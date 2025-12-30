<template>
  <div class="relative min-h-screen bg-[#0F0F12] text-white font-premium">
    <Header
      :logo-src="logoSrc"
      :logo-text="brandName"
      :links="navLinks"
      cta-label="In&#237;cio"
      cta-href="/"
      :show-user="true"
    />

    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-40 right-10 h-72 w-72 rounded-full bg-[#FF7A00]/10 blur-[120px]"></div>
      <div class="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-white/5 blur-[120px]"></div>
    </div>

    <main class="relative mx-auto max-w-6xl px-6 pb-16 pt-24">
      <header class="max-w-3xl">
        <h1 class="text-3xl font-semibold text-white sm:text-4xl">Reserva de quadras</h1>
        <p class="mt-3 text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
          Escolha a quadra, a data e o hor&#225;rio. Confirmando agora, sua reserva fica pendente de pagamento.
        </p>
      </header>

      <div class="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div class="space-y-8">
          <section id="quadra">
            <QuadraSelect
              :quadras="quadras"
              :selected-id="quadraSelecionada?.id ?? null"
              :loading="loadingQuadras"
              :error-message="erroQuadras"
              @select="handleSelectQuadra"
            />
          </section>

          <section id="data">
            <DateSelect
              v-model="dataSelecionada"
              :min-date="minDate"
              :calendar-cells="calendarCells"
              :week-labels="weekLabels"
              :month-label="monthLabel"
              :can-prev="canGoPrev"
              :can-next="canGoNext"
              :loading-calendar="loadingCalendar"
              :disabled="!quadraSelecionada"
              @prev-month="goToPrevMonth"
              @next-month="goToNextMonth"
            />
          </section>

          <section id="horarios">
            <HorariosGrid
              :horarios="horarios"
              :selected-id="horarioSelecionado?.id ?? null"
              :loading="loadingHorarios"
              :disabled="!quadraSelecionada || !dataSelecionada"
              :error-message="erroDisponibilidade"
              @select="handleSelectHorario"
            />
          </section>

          <section
            id="confirmacao"
            class="rounded-2xl border border-white/10 bg-[#1A1A1F] p-6 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.9)]"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-white">4. Confirme a reserva</h2>
                <p class="text-sm text-[#B5B5B5]">Revise os dados antes de confirmar.</p>
              </div>
              <span v-if="loadingReserva" class="text-xs text-white/60">Enviando...</span>
            </div>

            <button
              type="button"
              class="mt-5 w-full rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF8F26] disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="!podeConfirmar"
              @click="confirmarReserva"
            >
              {{ reservaCriada ? 'Reserva confirmada' : 'Confirmar reserva' }}
            </button>

            <p v-if="erroReserva" class="mt-4 text-sm text-[#FF7A00]">
              {{ erroReserva }}
            </p>
            <p v-if="reservaCriada" class="mt-3 text-xs text-white/60">
              Reserva criada com status pendente de pagamento.
            </p>
          </section>
        </div>

        <aside class="space-y-6">
          <ReservaResumo :reserva="reservaCriada" :resumo="resumoAtual" />

          <div class="rounded-2xl border border-white/10 bg-[#15151B] p-5 text-sm text-white/60">
            <p>
              Precisa alterar algo? Basta escolher outra quadra, data ou hor&#225;rio para gerar uma nova reserva.
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import QuadraSelect from '../components/QuadraSelect.vue';
import DateSelect from '../components/DateSelect.vue';
import HorariosGrid from '../components/HorariosGrid.vue';
import ReservaResumo from '../components/ReservaResumo.vue';
import { quadrasService } from '../services/quadrasService';
import { normalizeHorarios, reservasService } from '../services/reservasService';
import { useAgendaStore } from '../stores/useAgendaStore';

const route = useRoute();
const agendaStore = useAgendaStore();

const brandName = 'Playero';
const logoSrc = '/images/logo-text.png';

const quadras = ref([]);
const quadraSelecionada = ref(null);
const dataSelecionada = ref('');
const horarios = ref([]);
const horarioSelecionado = ref(null);

const loadingQuadras = ref(true);
const loadingHorarios = ref(false);
const loadingReserva = ref(false);
const loadingCalendar = ref(false);

const erroQuadras = ref('');
const erroDisponibilidade = ref('');
const erroReserva = ref('');
const reservaCriada = ref(null);

const calendarCells = ref([]);
const currentMonth = ref(new Date());
const calendarRequestId = ref(0);

const navLinks = [
  { label: 'Quadras', href: '#quadra' },
  { label: 'Data', href: '#data' },
  { label: 'Hor\u00e1rios', href: '#horarios' },
  { label: 'Confirma\u00e7\u00e3o', href: '#confirmacao' },
];

const weekLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Mar\u00e7o',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (value) => {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const setCurrentMonthFromDate = (value) => {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return false;
  }
  const nextMonth = getMonthStart(parsed);
  const current = getMonthStart(currentMonth.value);
  if (nextMonth.getTime() !== current.getTime()) {
    currentMonth.value = nextMonth;
    return true;
  }
  return false;
};

const formatDisplayDate = (value) => {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return value || '-';
  }
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${parsed.getFullYear()}`;
};

const formatHorarioLabel = (horario) => {
  if (!horario) {
    return '-';
  }
  if (horario.horaFim) {
    return `${horario.horaInicio} - ${horario.horaFim}`;
  }
  return horario.horaInicio || '-';
};

const minDate = computed(() => formatLocalDate(new Date()));
const monthLabel = computed(() => {
  const reference = getMonthStart(currentMonth.value);
  return `${monthNames[reference.getMonth()]} ${reference.getFullYear()}`;
});

const canGoPrev = computed(() => {
  const today = getMonthStart(new Date());
  return getMonthStart(currentMonth.value).getTime() > today.getTime();
});

const canGoNext = computed(() => true);

const resumoAtual = computed(() => ({
  quadra: quadraSelecionada.value?.name || '-',
  data: dataSelecionada.value ? formatDisplayDate(dataSelecionada.value) : '-',
  horario: horarioSelecionado.value ? formatHorarioLabel(horarioSelecionado.value) : '-',
}));

const podeConfirmar = computed(
  () =>
    Boolean(quadraSelecionada.value && dataSelecionada.value && horarioSelecionado.value) &&
    !loadingReserva.value &&
    !reservaCriada.value
);

const getValidationMessage = (error) => {
  const errors = error?.normalized?.errors;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const value = errors[firstKey];
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string') {
      return value;
    }
  }
  return error?.normalized?.message || '';
};

const fetchQuadras = async () => {
  loadingQuadras.value = true;
  erroQuadras.value = '';

  try {
    quadras.value = await quadrasService.listQuadras();

    const queryId = route.query.quadra ? Number(route.query.quadra) : null;
    if (queryId && !quadraSelecionada.value) {
      const preselect = quadras.value.find((quadra) => Number(quadra.id) === queryId);
      if (preselect) {
        quadraSelecionada.value = preselect;
      }
    }
  } catch (error) {
    const status = error?.response?.status;
    if (status === 403) {
      erroQuadras.value = error?.normalized?.message || 'Sem permiss\u00e3o para listar quadras.';
      return;
    }
    if (status === 422) {
      erroQuadras.value = getValidationMessage(error) || 'Dados inv\u00e1lidos. Tente novamente.';
      return;
    }
    erroQuadras.value = 'N\u00e3o foi poss\u00edvel carregar as quadras. Tente novamente.';
  } finally {
    loadingQuadras.value = false;
  }
};

const loadDisponibilidade = async () => {
  if (!quadraSelecionada.value || !dataSelecionada.value) {
    horarios.value = [];
    return;
  }

  loadingHorarios.value = true;
  erroDisponibilidade.value = '';

  try {
    const dayPayload = await agendaStore.loadDay(
      {
        data: dataSelecionada.value,
        date: dataSelecionada.value,
        quadra_id: quadraSelecionada.value.id,
      },
      { force: true },
    );
    const agendaDay = dayPayload ?? agendaStore.day.value;
    if (agendaDay?.is_closed) {
      horarios.value = [];
      erroDisponibilidade.value = 'Dia fechado para reservas.';
      return;
    }
    const slots = normalizeHorarios(agendaDay?.slots ?? []);
    horarios.value = slots;
    if (!slots.length) {
      erroDisponibilidade.value = 'Sem hor\u00e1rios dispon\u00edveis para este dia.';
    }
  } catch (error) {
    const status = error?.response?.status;
    if (status === 403) {
      erroDisponibilidade.value = error?.normalized?.message || 'Sem permiss\u00e3o para consultar hor\u00e1rios.';
      horarios.value = [];
      return;
    }
    if (status === 422) {
      erroDisponibilidade.value = getValidationMessage(error) || 'Dados inv\u00e1lidos. Tente novamente.';
      horarios.value = [];
      return;
    }
    horarios.value = [];
    erroDisponibilidade.value = 'N\u00e3o foi poss\u00edvel carregar os hor\u00e1rios. Tente novamente.';
  } finally {
    loadingHorarios.value = false;
  }
};

const buildMonthGrid = (referenceDate) => {
  const startOfMonth = getMonthStart(referenceDate);
  const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
  const startOffset = (startOfMonth.getDay() + 6) % 7;
  const totalDays = endOfMonth.getDate();
  const totalCells = startOffset + totalDays;
  const trailing = (7 - (totalCells % 7)) % 7;
  const startDate = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth(),
    startOfMonth.getDate() - startOffset
  );

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let index = 0; index < totalCells + trailing; index += 1) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
    const iso = formatLocalDate(date);
    const inMonth = date.getMonth() === startOfMonth.getMonth();
    const isPast = date < startOfToday;
    let status = 'unknown';

    if (!inMonth) {
      status = 'outside';
    } else if (isPast) {
      status = 'past';
    } else {
      status = 'loading';
    }

    cells.push({
      key: iso,
      date: iso,
      dayNumber: String(date.getDate()),
      inMonth,
      isPast,
      isSelectable: inMonth && !isPast,
      status,
    });
  }
  return cells;
};

const resolveAgendaDateKey = (value) => {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return formatLocalDate(value);
  }
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
    const [day, month, year] = raw.split('/');
    return `${year}-${month}-${day}`;
  }
  return '';
};

const normalizeAgendaStatus = (value) => {
  const raw = String(value || '').toLowerCase();
  if (!raw) {
    return 'unknown';
  }
  if (raw === 'closed') {
    return 'closed';
  }
  if (raw === 'partial') {
    return 'partial';
  }
  if (raw === 'available') {
    return 'available';
  }
  return 'unknown';
};

const loadCalendarMonth = async () => {
  if (!quadraSelecionada.value) {
    calendarCells.value = [];
    loadingCalendar.value = false;
    return;
  }

  const requestId = calendarRequestId.value + 1;
  calendarRequestId.value = requestId;

  const monthGrid = buildMonthGrid(currentMonth.value);
  calendarCells.value = monthGrid;
  loadingCalendar.value = true;

  try {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth() + 1;
    const payload = await agendaStore.loadMonth(
      {
        year,
        month,
        ano: year,
        mes: month,
        quadra_id: quadraSelecionada.value.id,
      },
      { force: true },
    );

    if (requestId !== calendarRequestId.value) {
      return;
    }

    const days = payload?.days ?? [];
    const statusByDate = new Map(
      days
        .map((item) => {
          const dateKey = resolveAgendaDateKey(
            item?.date ?? item?.data ?? item?.dia ?? item?.day,
          );
          if (!dateKey) {
            return null;
          }
          const status = normalizeAgendaStatus(
            item?.status ?? item?.state ?? item?.situacao ?? item?.availability,
          );
          return [dateKey, status];
        })
        .filter(Boolean),
    );

    calendarCells.value = monthGrid.map((cell) => {
      if (!cell.inMonth) {
        return { ...cell, status: 'outside' };
      }
      if (cell.isPast) {
        return { ...cell, status: 'past' };
      }
      return {
        ...cell,
        status: statusByDate.get(cell.date) ?? 'unknown',
      };
    });
  } catch (error) {
    if (requestId !== calendarRequestId.value) {
      return;
    }
    calendarCells.value = monthGrid.map((cell) => {
      if (!cell.inMonth) {
        return { ...cell, status: 'outside' };
      }
      if (cell.isPast) {
        return { ...cell, status: 'past' };
      }
      return { ...cell, status: 'unknown' };
    });
  } finally {
    if (requestId === calendarRequestId.value) {
      loadingCalendar.value = false;
    }
  }
};

const goToPrevMonth = () => {
  if (!canGoPrev.value) {
    return;
  }
  const current = getMonthStart(currentMonth.value);
  currentMonth.value = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  loadCalendarMonth();
};

const goToNextMonth = () => {
  const current = getMonthStart(currentMonth.value);
  currentMonth.value = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  loadCalendarMonth();
};

const handleSelectQuadra = (quadraId) => {
  const selected = quadras.value.find((quadra) => String(quadra.id) === String(quadraId));
  if (!selected) {
    return;
  }
  quadraSelecionada.value = selected;
};

const handleSelectHorario = (horarioId) => {
  const selected = horarios.value.find((horario) => String(horario.id) === String(horarioId));
  if (!selected) {
    return;
  }
  horarioSelecionado.value = selected;
};

const confirmarReserva = async () => {
  if (!podeConfirmar.value) {
    return;
  }

  loadingReserva.value = true;
  erroReserva.value = '';

  try {
    const payload = await reservasService.createReserva({
      quadra_id: quadraSelecionada.value.id,
      data: dataSelecionada.value,
      hora_inicio: horarioSelecionado.value.horaInicio,
    });

    const reservaId = payload?.id ?? payload?.data?.id ?? payload?.reserva_id;
    const status = payload?.status ?? payload?.data?.status ?? 'pendente_pagamento';

    reservaCriada.value = {
      id: reservaId,
      status,
      quadra: quadraSelecionada.value?.name,
      data: formatDisplayDate(dataSelecionada.value),
      horario: formatHorarioLabel(horarioSelecionado.value),
    };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 403) {
      erroReserva.value = error?.normalized?.message || 'Sem permiss\u00e3o para criar reserva.';
      return;
    }
    if (status === 422) {
      erroReserva.value = getValidationMessage(error) || 'Dados inv\u00e1lidos. Revise e tente novamente.';
      return;
    }
    if (status === 409) {
      erroReserva.value = 'Hor\u00e1rio indispon\u00edvel. Escolha outro hor\u00e1rio.';
    } else {
      erroReserva.value = 'N\u00e3o foi poss\u00edvel confirmar a reserva. Tente novamente.';
    }
  } finally {
    loadingReserva.value = false;
  }
};

watch(quadraSelecionada, () => {
  horarioSelecionado.value = null;
  reservaCriada.value = null;
  erroReserva.value = '';
  erroDisponibilidade.value = '';

  if (quadraSelecionada.value) {
    if (dataSelecionada.value) {
      setCurrentMonthFromDate(dataSelecionada.value);
    } else {
      currentMonth.value = getMonthStart(new Date());
    }
    loadCalendarMonth();
    if (dataSelecionada.value) {
      loadDisponibilidade();
    }
  } else {
    dataSelecionada.value = '';
    horarios.value = [];
    calendarCells.value = [];
    loadingCalendar.value = false;
  }
});

watch(dataSelecionada, () => {
  horarioSelecionado.value = null;
  reservaCriada.value = null;
  erroReserva.value = '';
  erroDisponibilidade.value = '';

  if (quadraSelecionada.value && dataSelecionada.value) {
    const monthChanged = setCurrentMonthFromDate(dataSelecionada.value);
    if (monthChanged) {
      loadCalendarMonth();
    }
    loadDisponibilidade();
  } else {
    horarios.value = [];
  }
});

onMounted(() => {
  fetchQuadras();
});
</script>
