import { computed, reactive } from 'vue';
import { agendaService } from '../services/agendaService';

const DEFAULT_CONFIG = {
  hora_abertura: '08:00',
  hora_fechamento: '22:00',
  duracao_reserva_minutos: 60,
  dias_semana_ativos: [1, 2, 3, 4, 5, 6],
  timezone: 'America/Sao_Paulo',
};

const state = reactive({
  config: { ...DEFAULT_CONFIG },
  exceptions: [],
  monthCache: {},
  dayCache: {},
  loading: {
    config: false,
    exceptions: false,
    month: false,
    day: false,
  },
  lastMonthKey: '',
  lastDayKey: '',
});

const unwrap = (payload) => payload?.data ?? payload ?? {};

const normalizeConfig = (payload) => {
  const data = unwrap(payload);
  const rawDays = data?.dias_semana_ativos ?? data?.diasSemanaAtivos ?? DEFAULT_CONFIG.dias_semana_ativos;
  const parsedDays = Array.isArray(rawDays)
    ? rawDays.map((day) => Number(day)).filter((day) => !Number.isNaN(day) && day > 0)
    : [];

  return {
    hora_abertura: data?.hora_abertura ?? data?.horaAbertura ?? DEFAULT_CONFIG.hora_abertura,
    hora_fechamento: data?.hora_fechamento ?? data?.horaFechamento ?? DEFAULT_CONFIG.hora_fechamento,
    duracao_reserva_minutos:
      data?.duracao_reserva_minutos ??
      data?.duracaoReservaMinutos ??
      DEFAULT_CONFIG.duracao_reserva_minutos,
    dias_semana_ativos: parsedDays.length ? parsedDays : [...DEFAULT_CONFIG.dias_semana_ativos],
    timezone: data?.timezone ?? DEFAULT_CONFIG.timezone,
  };
};

const normalizeException = (exception, index = 0) => {
  const horaAbertura = exception?.hora_abertura ?? exception?.horaAbertura ?? null;
  const horaFechamento = exception?.hora_fechamento ?? exception?.horaFechamento ?? null;
  const dataValue = exception?.data ?? exception?.date ?? '';
  const motivo = exception?.motivo ?? exception?.descricao ?? '';
  const fechado = Boolean(
    exception?.fechado ?? exception?.is_closed ?? exception?.isClosed ?? exception?.closed ?? false,
  );

  return {
    id: exception?.id ?? exception?.uuid ?? index,
    data: typeof dataValue === 'string' ? dataValue.slice(0, 10) : dataValue,
    hora_abertura: horaAbertura,
    hora_fechamento: horaFechamento,
    motivo,
    fechado,
  };
};

const normalizeMonthPayload = (payload) => {
  const data = unwrap(payload);
  const days =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.days) && data.days) ||
    (Array.isArray(data?.dias) && data.dias) ||
    (Array.isArray(data?.calendar) && data.calendar) ||
    (Array.isArray(data?.calendario) && data.calendario) ||
    [];

  return { raw: data, days };
};

const normalizeDayPayload = (payload) => {
  const data = unwrap(payload);
  const slots =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.slots) && data.slots) ||
    (Array.isArray(data?.horarios) && data.horarios) ||
    (Array.isArray(data?.disponibilidade) && data.disponibilidade) ||
    [];

  return {
    raw: data,
    is_closed: Boolean(data?.is_closed ?? data?.isClosed ?? data?.fechado ?? data?.closed ?? false),
    slots,
  };
};

const resolveQuadraId = (params = {}) =>
  params.quadra_id ?? params.quadraId ?? params.quadra?.id ?? params.quadra ?? '';

const buildMonthKey = (params = {}) => {
  const year = params.year ?? params.ano ?? new Date().getFullYear();
  const monthValue = params.month ?? params.mes ?? new Date().getMonth() + 1;
  const month = String(monthValue).padStart(2, '0');
  const quadraId = resolveQuadraId(params);
  return `${year}-${month}-${quadraId || 'all'}`;
};

const buildDayKey = (params = {}) => {
  const date = params.date ?? params.data ?? '';
  const quadraId = resolveQuadraId(params);
  return `${date || 'unknown'}-${quadraId || 'all'}`;
};

const loadConfig = async () => {
  state.loading.config = true;
  try {
    const response = await agendaService.getConfig();
    state.config = normalizeConfig(response);
    return state.config;
  } finally {
    state.loading.config = false;
  }
};

const updateConfig = async (payload) => {
  state.loading.config = true;
  try {
    const response = await agendaService.updateConfig(payload);
    state.config = normalizeConfig(response);
    return state.config;
  } finally {
    state.loading.config = false;
  }
};

const loadExceptions = async () => {
  state.loading.exceptions = true;
  try {
    const response = await agendaService.listExceptions();
    const data = unwrap(response);
    state.exceptions = Array.isArray(data) ? data.map(normalizeException) : [];
    return state.exceptions;
  } finally {
    state.loading.exceptions = false;
  }
};

const createException = async (payload) => {
  const response = await agendaService.createException(payload);
  const normalized = normalizeException(unwrap(response), state.exceptions.length + 1);
  state.exceptions = [normalized, ...state.exceptions];
  return normalized;
};

const updateException = async (id, payload) => {
  const response = await agendaService.updateException(id, payload);
  const normalized = normalizeException(unwrap(response), id);
  state.exceptions = state.exceptions.map((item) =>
    String(item.id) === String(id) ? { ...item, ...normalized } : item,
  );
  return normalized;
};

const deleteException = async (id) => {
  await agendaService.deleteException(id);
  state.exceptions = state.exceptions.filter((item) => String(item.id) !== String(id));
};

const loadMonth = async (params = {}, options = {}) => {
  const key = buildMonthKey(params);
  if (!options.force && state.monthCache[key]) {
    state.lastMonthKey = key;
    return state.monthCache[key];
  }

  state.loading.month = true;
  try {
    const response = await agendaService.getMonth(params);
    const normalized = normalizeMonthPayload(response);
    state.monthCache[key] = {
      key,
      params,
      ...normalized,
    };
    state.lastMonthKey = key;
    return state.monthCache[key];
  } finally {
    state.loading.month = false;
  }
};

const loadDay = async (params = {}, options = {}) => {
  const key = buildDayKey(params);
  if (!options.force && state.dayCache[key]) {
    state.lastDayKey = key;
    return state.dayCache[key];
  }

  state.loading.day = true;
  try {
    const response = await agendaService.getDay(params);
    const normalized = normalizeDayPayload(response);
    state.dayCache[key] = {
      key,
      params,
      ...normalized,
    };
    state.lastDayKey = key;
    return state.dayCache[key];
  } finally {
    state.loading.day = false;
  }
};

export const useAgendaStore = () => {
  const config = computed(() => state.config);
  const exceptions = computed(() => state.exceptions);
  const month = computed(() => state.monthCache[state.lastMonthKey] ?? null);
  const day = computed(() => state.dayCache[state.lastDayKey] ?? null);
  const loading = computed(() => state.loading);

  return {
    state,
    config,
    exceptions,
    month,
    day,
    loading,
    loadConfig,
    updateConfig,
    loadExceptions,
    createException,
    updateException,
    deleteException,
    loadMonth,
    loadDay,
  };
};
