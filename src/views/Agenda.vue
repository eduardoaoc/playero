<template>
  <div class="dashboard-shell">
    <Sidebar
      :brand="brand"
      :general-items="generalItems"
      :support-items="supportItems"
      :quick-action="quickAction"
      :user="sidebarUser"
    />

    <Topbar
      title="Agenda"
      subtitle="Configuracao de agenda"
      :user="topbarUser"
      :show-theme-toggle="false"
    />

    <main class="dashboard-main">
      <div class="dashboard-content">
        <section class="dashboard-section">
          <SectionHeader
            title="Agenda / Configuracao de agenda"
            subtitle="Gerencie horarios, excecoes e bloqueios manuais."
          />

          <div v-if="!canAccess" class="access-card">
            <div class="access-icon">
              <DashboardIcon name="shield" />
            </div>
            <div>
              <h3 class="access-title">Area restrita</h3>
              <p class="access-text">
                Apenas perfis admin ou super_admin podem acessar a configuracao de agenda.
              </p>
            </div>
          </div>
        </section>

        <template v-if="canAccess">
          <section class="dashboard-section">
            <SectionHeader
              title="Configuracao geral da agenda"
              subtitle="Defina horario base, dias ativos e timezone."
            >
              <template #actions>
                <button class="dash-action dash-action--primary" type="button" @click="openConfigModal">
                  <DashboardIcon name="settings" />
                  Editar configuracao
                </button>
              </template>
            </SectionHeader>

            <AgendaConfigCard
              :config="agendaConfig"
              :week-days="weekDays"
              :is-loading="isConfigLoading"
            />
          </section>

          <section class="dashboard-section">
            <SectionHeader
              title="Horario de funcionamento"
              subtitle="Horario padrao usado no fluxo de reservas."
            >
              <template #actions>
                <button
                  class="dash-action dash-action--ghost"
                  type="button"
                  @click="openHorarioModal"
                >
                  <DashboardIcon name="clock" />
                  Definir horario de funcionamento
                </button>
              </template>
            </SectionHeader>

            <div class="info-card">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Abertura</span>
                  <strong class="info-value">{{ agendaConfig.hora_abertura || '--:--' }}</strong>
                </div>
                <div class="info-item">
                  <span class="info-label">Fechamento</span>
                  <strong class="info-value">{{ agendaConfig.hora_fechamento || '--:--' }}</strong>
                </div>
                <div class="info-item">
                  <span class="info-label">Dias ativos</span>
                  <strong class="info-value">{{ activeDaysLabel }}</strong>
                </div>
                <div class="info-item">
                  <span class="info-label">Duracao padrao</span>
                  <strong class="info-value">{{ durationLabel }}</strong>
                </div>
              </div>
              <div class="info-note">
                <DashboardIcon name="clock" :size="18" />
                <span>Alteracoes aqui atualizam a configuracao geral da agenda.</span>
              </div>
            </div>
          </section>

          <section class="dashboard-section">
            <SectionHeader
              title="Excecoes de funcionamento"
              subtitle="Datas especiais com horario personalizado."
            >
              <template #actions>
                <button class="dash-action dash-action--primary" type="button" @click="openExceptionModal">
                  <DashboardIcon name="calendar-plus" />
                  Adicionar excecao
                </button>
              </template>
            </SectionHeader>

            <div class="exceptions-card">
              <div v-if="exceptionsLoading" class="card-empty">
                Carregando excecoes...
              </div>
              <div v-else-if="!exceptions.length" class="card-empty">
                Nenhuma excecao cadastrada.
              </div>
              <div v-else class="exceptions-grid">
                <div v-for="exception in exceptions" :key="exception.id" class="exception-item">
                  <div class="exception-header">
                    <div>
                      <p class="exception-date">{{ formatDate(exception.data) }}</p>
                      <p class="exception-hours">
                        {{
                          exception.fechado
                            ? 'Fechado o dia todo'
                            : `${exception.hora_abertura || '--:--'} - ${exception.hora_fechamento || '--:--'}`
                        }}
                      </p>
                    </div>
                    <span class="exception-badge" :class="{ 'is-closed': exception.fechado }">
                      {{ exception.fechado ? 'Fechado' : 'Horario especial' }}
                    </span>
                  </div>
                  <p v-if="exception.motivo" class="exception-motivo">{{ exception.motivo }}</p>
                  <div class="exception-actions">
                    <button class="action-button action-button--ghost" type="button" @click="openEditException(exception)">
                      Editar
                    </button>
                    <button class="action-button action-button--danger" type="button" @click="handleDeleteException(exception)">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="dashboard-section">
            <SectionHeader
              title="Bloqueios manuais"
              subtitle="Gerencie manutencoes e indisponibilidades."
            >
              <template #actions>
                <button class="dash-action dash-action--primary" type="button" @click="openBlockingModal">
                  <DashboardIcon name="ban" />
                  Adicionar bloqueio
                </button>
              </template>
            </SectionHeader>

            <BlockingsTable
              :blockings="normalizedBlockings"
              :loading="blockingsLoading"
              :can-manage="canAccess"
              @delete="handleDeleteBlocking"
            />
          </section>
        </template>
      </div>
    </main>

    <HorarioFuncionamentoModal
      :open="isHorarioModalOpen"
      :config="agendaConfig"
      :week-days="weekDays"
      :is-saving="isConfigSaving"
      @close="closeHorarioModal"
      @save="handleHorarioSave"
    />

    <ExcecaoHorarioModal
      :open="isExceptionModalOpen"
      :mode="exceptionModalMode"
      :initial-data="selectedException"
      :is-saving="isExceptionSaving"
      @close="closeExceptionModal"
      @save="handleExceptionSave"
    />

    <div v-if="isConfigModalOpen" class="modal-overlay" @click="closeConfigModal">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Configuracao geral</p>
            <h3 class="modal-title">Editar configuracao da agenda</h3>
          </div>
          <button class="modal-close" type="button" @click="closeConfigModal">
            <DashboardIcon name="x" />
          </button>
        </header>

        <form class="modal-body" @submit.prevent="handleConfigSave">
          <div class="form-grid">
            <label class="form-field" :class="{ 'has-error': showConfigOpenError }">
              <span>Hora de abertura</span>
              <input v-model="configForm.hora_abertura" type="time" />
              <small v-if="showConfigOpenError" class="form-error">Informe a hora de abertura.</small>
            </label>
            <label class="form-field" :class="{ 'has-error': showConfigCloseError }">
              <span>Hora de fechamento</span>
              <input v-model="configForm.hora_fechamento" type="time" />
              <small v-if="showConfigCloseError" class="form-error">Informe a hora de fechamento.</small>
            </label>
            <label class="form-field" :class="{ 'has-error': showConfigDurationError }">
              <span>Duracao padrao (minutos)</span>
              <input v-model.number="configForm.duracao_reserva_minutos" type="number" min="30" step="15" />
              <small v-if="showConfigDurationError" class="form-error">
                Informe a duracao padrao.
              </small>
            </label>
            <label class="form-field" :class="{ 'has-error': showConfigTimezoneError }">
              <span>Timezone</span>
              <input v-model="configForm.timezone" type="text" placeholder="America/Sao_Paulo" />
              <small v-if="showConfigTimezoneError" class="form-error">
                Informe o timezone.
              </small>
            </label>
          </div>

          <div class="days-card">
            <span class="days-label">Dias da semana ativos</span>
            <div class="days-grid">
              <label v-for="day in weekDays" :key="day.value" class="day-option">
                <input v-model="configForm.dias_semana_ativos" type="checkbox" :value="day.value" />
                <span>{{ day.label }}</span>
              </label>
            </div>
            <p v-if="showConfigDaysError" class="form-error">Selecione ao menos um dia ativo.</p>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeConfigModal">
              Cancelar
            </button>
            <button class="dash-action dash-action--primary" type="submit" :disabled="isConfigSaving">
              <span v-if="isConfigSaving">Salvando...</span>
              <span v-else>Salvar configuracao</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isBlockingModalOpen" class="modal-overlay" @click="closeBlockingModal">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Bloqueio manual</p>
            <h3 class="modal-title">Adicionar bloqueio</h3>
          </div>
          <button class="modal-close" type="button" @click="closeBlockingModal">
            <DashboardIcon name="x" />
          </button>
        </header>

        <form class="modal-body" @submit.prevent="handleCreateBlocking">
          <div class="form-grid">
            <label class="form-field" :class="{ 'has-error': showBlockingQuadraError }">
              <span>Quadra</span>
              <select v-model="blockingForm.quadra_id">
                <option value="" disabled>Selecione</option>
                <option v-for="quadra in quadraOptions" :key="quadra.id" :value="quadra.id">
                  {{ quadra.label }}
                </option>
              </select>
              <small v-if="showBlockingQuadraError" class="form-error">
                Selecione a quadra.
              </small>
            </label>
            <label class="form-field" :class="{ 'has-error': showBlockingDateError }">
              <span>Data</span>
              <input v-model="blockingForm.data" type="date" />
              <small v-if="showBlockingDateError" class="form-error">Informe a data.</small>
            </label>
            <label class="form-field" :class="{ 'has-error': showBlockingStartError }">
              <span>Hora inicio</span>
              <input v-model="blockingForm.hora_inicio" type="time" />
              <small v-if="showBlockingStartError" class="form-error">Informe a hora inicio.</small>
            </label>
            <label class="form-field" :class="{ 'has-error': showBlockingEndError }">
              <span>Hora fim</span>
              <input v-model="blockingForm.hora_fim" type="time" />
              <small v-if="showBlockingEndError" class="form-error">Informe a hora fim.</small>
            </label>
            <label class="form-field form-field--wide">
              <span>Motivo</span>
              <input v-model="blockingForm.motivo" type="text" placeholder="Manutencao" />
            </label>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeBlockingModal">
              Cancelar
            </button>
            <button class="dash-action dash-action--primary" type="submit" :disabled="isBlockingSaving">
              <span v-if="isBlockingSaving">Salvando...</span>
              <span v-else>Salvar bloqueio</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Topbar from '../components/Topbar.vue';
import SectionHeader from '../components/SectionHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';
import AgendaConfigCard from '../components/AgendaConfigCard.vue';
import BlockingsTable from '../components/BlockingsTable.vue';
import HorarioFuncionamentoModal from '../components/modals/HorarioFuncionamentoModal.vue';
import ExcecaoHorarioModal from '../components/modals/ExcecaoHorarioModal.vue';
import { agendaService } from '../services/agendaService';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const userRole = 'admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');
const canAccess = computed(() => ['admin', 'super_admin'].includes(String(userRole).toLowerCase()));

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Administradores', icon: 'shield', href: '/admin/administradores' },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda', active: true },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
];

const generalItems = computed(() =>
  baseGeneralItems.filter((item) => item.label !== 'Administradores' || isSuperAdmin.value),
);

const supportItems = [{ label: 'Configuracoes', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho rapido',
  description: 'Configurar agenda com poucos cliques.',
  buttonLabel: 'Nova excecao',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});

const topbarUser = computed(() => sidebarUser.value);

const weekDays = [
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sab', value: 6 },
  { label: 'Dom', value: 7 },
];

const isConfigLoading = ref(false);
const isConfigSaving = ref(false);
const agendaConfig = ref({
  hora_abertura: '08:00',
  hora_fechamento: '22:00',
  duracao_reserva_minutos: 60,
  dias_semana_ativos: [1, 2, 3, 4, 5, 6],
  timezone: 'America/Sao_Paulo',
});

const isConfigModalOpen = ref(false);
const isHorarioModalOpen = ref(false);
const isExceptionModalOpen = ref(false);
const isExceptionSaving = ref(false);

const configForm = reactive({
  hora_abertura: '',
  hora_fechamento: '',
  duracao_reserva_minutos: 60,
  dias_semana_ativos: [],
  timezone: '',
});

const isConfigSubmitted = ref(false);

const exceptions = ref([]);
const exceptionsLoading = ref(false);
const selectedException = ref(null);
const isExceptionEditing = ref(false);
const exceptionModalMode = computed(() => (isExceptionEditing.value ? 'edit' : 'create'));

const blockingsLoading = ref(false);
const isBlockingModalOpen = ref(false);
const isBlockingSaving = ref(false);
const isBlockingSubmitted = ref(false);
const blockings = ref([]);

const blockingForm = reactive({
  quadra_id: '',
  data: '',
  hora_inicio: '',
  hora_fim: '',
  motivo: '',
});

const quadraOptions = [
  { id: 1, label: 'Quadra 01' },
  { id: 2, label: 'Quadra 02' },
  { id: 3, label: 'Quadra 03' },
  { id: 4, label: 'Quadra 04' },
];

const durationLabel = computed(() => {
  const minutes = Number(agendaConfig.value?.duracao_reserva_minutos ?? 0);
  return minutes ? `${minutes} min` : '---';
});

const activeDaysLabel = computed(() => {
  const active = agendaConfig.value?.dias_semana_ativos ?? [];
  if (!active.length) {
    return '---';
  }
  return weekDays
    .filter((day) => active.includes(day.value))
    .map((day) => day.label)
    .join(', ');
});

const showConfigOpenError = computed(
  () => isConfigSubmitted.value && !configForm.hora_abertura,
);
const showConfigCloseError = computed(
  () => isConfigSubmitted.value && !configForm.hora_fechamento,
);
const showConfigDurationError = computed(
  () => isConfigSubmitted.value && !configForm.duracao_reserva_minutos,
);
const showConfigTimezoneError = computed(() => isConfigSubmitted.value && !configForm.timezone);
const showConfigDaysError = computed(() => {
  if (!isConfigSubmitted.value) {
    return false;
  }
  return !configForm.dias_semana_ativos || !configForm.dias_semana_ativos.length;
});

const showBlockingQuadraError = computed(
  () => isBlockingSubmitted.value && !blockingForm.quadra_id,
);
const showBlockingDateError = computed(() => isBlockingSubmitted.value && !blockingForm.data);
const showBlockingStartError = computed(() => isBlockingSubmitted.value && !blockingForm.hora_inicio);
const showBlockingEndError = computed(() => isBlockingSubmitted.value && !blockingForm.hora_fim);

const normalizedBlockings = computed(() => blockings.value.map(normalizeBlocking));

const formatDate = (value) => {
  if (!value) {
    return '---';
  }
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString('pt-BR');
};

const handleApiError = (error, fallback, silentStatuses = []) => {
  const status = error?.response?.status ?? error?.normalized?.status;
  if (silentStatuses.includes(status)) {
    return;
  }
  const message = error?.normalized?.message || fallback;
  if (typeof window !== 'undefined' && message) {
    window.alert(message);
  }
};

const normalizeConfig = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const rawDays = data.dias_semana_ativos ?? data.diasSemanaAtivos;
  const parsedDays = Array.isArray(rawDays)
    ? rawDays
        .map((day) => Number(day))
        .filter((day) => !Number.isNaN(day) && day > 0)
    : [];
  return {
    hora_abertura: data.hora_abertura ?? data.horaAbertura ?? '08:00',
    hora_fechamento: data.hora_fechamento ?? data.horaFechamento ?? '22:00',
    duracao_reserva_minutos:
      data.duracao_reserva_minutos ?? data.duracaoReservaMinutos ?? 60,
    dias_semana_ativos: parsedDays.length ? parsedDays : [1, 2, 3, 4, 5, 6],
    timezone: data.timezone ?? 'America/Sao_Paulo',
  };
};

const normalizeException = (exception, index = 0) => {
  const horaAbertura = exception?.hora_abertura ?? exception?.horaAbertura ?? null;
  const horaFechamento = exception?.hora_fechamento ?? exception?.horaFechamento ?? null;
  const dataValue = exception?.data ?? exception?.date ?? '';
  const motivo = exception?.motivo ?? exception?.descricao ?? '';
  const fechado = Boolean(
    exception?.fechado ?? (!horaAbertura && !horaFechamento),
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

const resolveQuadraLabel = (blocking) => {
  const quadraId = blocking?.quadra_id ?? blocking?.quadraId ?? blocking?.quadra?.id;
  const name =
    blocking?.quadraLabel ??
    blocking?.quadra_nome ??
    blocking?.quadra?.nome ??
    (quadraId ? `Quadra ${String(quadraId).padStart(2, '0')}` : 'Quadra');
  return name;
};

const normalizeBlocking = (blocking, index = 0) => {
  const dataValue = blocking?.data ?? blocking?.data_inicio ?? blocking?.date ?? '';
  return {
    id: blocking?.id ?? blocking?.uuid ?? index,
    quadraLabel: resolveQuadraLabel(blocking),
    dataLabel: formatDate(dataValue),
    horaInicio: blocking?.hora_inicio ?? blocking?.horaInicio ?? blocking?.hora_inicial ?? '--:--',
    horaFim: blocking?.hora_fim ?? blocking?.horaFim ?? blocking?.hora_final ?? '--:--',
    motivo: blocking?.motivo ?? blocking?.descricao ?? '',
  };
};

const syncConfigForm = () => {
  const current = agendaConfig.value;
  configForm.hora_abertura = current.hora_abertura ?? '';
  configForm.hora_fechamento = current.hora_fechamento ?? '';
  configForm.duracao_reserva_minutos = current.duracao_reserva_minutos ?? 60;
  configForm.dias_semana_ativos = Array.isArray(current.dias_semana_ativos)
    ? [...current.dias_semana_ativos]
    : [];
  configForm.timezone = current.timezone ?? '';
  isConfigSubmitted.value = false;
};

const openConfigModal = () => {
  syncConfigForm();
  isConfigModalOpen.value = true;
};

const closeConfigModal = () => {
  isConfigModalOpen.value = false;
};

const openHorarioModal = () => {
  isHorarioModalOpen.value = true;
};

const closeHorarioModal = () => {
  isHorarioModalOpen.value = false;
};

const openExceptionModal = () => {
  selectedException.value = null;
  isExceptionEditing.value = false;
  isExceptionModalOpen.value = true;
};

const openEditException = (exception) => {
  if (!exception) {
    return;
  }
  selectedException.value = exception;
  isExceptionEditing.value = true;
  isExceptionModalOpen.value = true;
};

const closeExceptionModal = () => {
  isExceptionModalOpen.value = false;
  selectedException.value = null;
  isExceptionEditing.value = false;
};

const openBlockingModal = () => {
  isBlockingSubmitted.value = false;
  blockingForm.quadra_id = '';
  blockingForm.data = '';
  blockingForm.hora_inicio = '';
  blockingForm.hora_fim = '';
  blockingForm.motivo = '';
  isBlockingModalOpen.value = true;
};

const closeBlockingModal = () => {
  isBlockingModalOpen.value = false;
};

const persistConfig = async (payload) => {
  isConfigSaving.value = true;
  try {
    const response = await agendaService.updateConfig(payload);
    agendaConfig.value = normalizeConfig(response);
    return true;
  } catch (error) {
    handleApiError(error, 'Nao foi possivel salvar a configuracao.');
    return false;
  } finally {
    isConfigSaving.value = false;
  }
};

const handleConfigSave = async () => {
  isConfigSubmitted.value = true;
  if (
    showConfigOpenError.value ||
    showConfigCloseError.value ||
    showConfigDurationError.value ||
    showConfigTimezoneError.value ||
    showConfigDaysError.value
  ) {
    return;
  }
  const payload = {
    hora_abertura: configForm.hora_abertura,
    hora_fechamento: configForm.hora_fechamento,
    duracao_reserva_minutos: Number(configForm.duracao_reserva_minutos),
    dias_semana_ativos: [...configForm.dias_semana_ativos],
    timezone: configForm.timezone,
  };
  const saved = await persistConfig(payload);
  if (saved) {
    closeConfigModal();
  }
};

const handleHorarioSave = async (payload) => {
  const saved = await persistConfig({
    ...agendaConfig.value,
    hora_abertura: payload.hora_abertura,
    hora_fechamento: payload.hora_fechamento,
    dias_semana_ativos: payload.dias_semana_ativos,
  });
  if (saved) {
    closeHorarioModal();
  }
};

const handleExceptionSave = async (payload) => {
  isExceptionSaving.value = true;
  try {
    const motivoValue = payload.motivo?.trim() || (payload.fechado ? 'Fechado' : '');
    const request = {
      data: payload.data,
      hora_abertura: payload.hora_abertura,
      hora_fechamento: payload.hora_fechamento,
      motivo: motivoValue,
    };

    if (isExceptionEditing.value && selectedException.value) {
      const response = await agendaService.updateException(selectedException.value.id, request);
      const updated = normalizeException(response?.data ?? response, selectedException.value.id);
      exceptions.value = exceptions.value.map((item) =>
        item.id === selectedException.value.id ? { ...item, ...updated } : item,
      );
    } else {
      const response = await agendaService.createException(request);
      const created = normalizeException(response?.data ?? response, exceptions.value.length + 1);
      exceptions.value = [created, ...exceptions.value];
    }
    closeExceptionModal();
  } catch (error) {
    handleApiError(error, 'Nao foi possivel salvar a excecao.');
  } finally {
    isExceptionSaving.value = false;
  }
};

const handleDeleteException = async (exception) => {
  if (!exception?.id) {
    return;
  }
  try {
    await agendaService.deleteException(exception.id);
    exceptions.value = exceptions.value.filter((item) => item.id !== exception.id);
  } catch (error) {
    handleApiError(error, 'Nao foi possivel excluir a excecao.');
  }
};

const handleCreateBlocking = async () => {
  isBlockingSubmitted.value = true;
  if (
    showBlockingQuadraError.value ||
    showBlockingDateError.value ||
    showBlockingStartError.value ||
    showBlockingEndError.value
  ) {
    return;
  }
  isBlockingSaving.value = true;
  try {
    const payload = {
      quadra_id: Number(blockingForm.quadra_id),
      data: blockingForm.data,
      hora_inicio: blockingForm.hora_inicio,
      hora_fim: blockingForm.hora_fim,
      motivo: blockingForm.motivo,
    };
    const response = await agendaService.createBlocking(payload);
    const data = response?.data ?? response ?? payload;
    const quadraLabel =
      resolveQuadraLabel(data) ||
      quadraOptions.find((item) => item.id === payload.quadra_id)?.label ||
      'Quadra';
    blockings.value = [
      {
        id: data?.id ?? Date.now(),
        quadra_id: payload.quadra_id,
        quadraLabel,
        data: data?.data ?? payload.data,
        hora_inicio: data?.hora_inicio ?? payload.hora_inicio,
        hora_fim: data?.hora_fim ?? payload.hora_fim,
        motivo: data?.motivo ?? payload.motivo,
      },
      ...blockings.value,
    ];
    closeBlockingModal();
  } catch (error) {
    handleApiError(error, 'Nao foi possivel salvar o bloqueio.');
  } finally {
    isBlockingSaving.value = false;
  }
};

const handleDeleteBlocking = async (blocking) => {
  if (!blocking) {
    return;
  }
  try {
    await agendaService.deleteBlocking(blocking.id);
    blockings.value = blockings.value.filter((item) => item.id !== blocking.id);
  } catch (error) {
    handleApiError(error, 'Nao foi possivel excluir o bloqueio.');
  }
};

const loadConfig = async () => {
  if (!canAccess.value) {
    return;
  }
  isConfigLoading.value = true;
  try {
    const response = await agendaService.getConfig();
    agendaConfig.value = normalizeConfig(response);
  } catch (error) {
    handleApiError(error, 'Nao foi possivel carregar a configuracao.', [404]);
  } finally {
    isConfigLoading.value = false;
  }
};

const loadExceptions = async () => {
  if (!canAccess.value) {
    return;
  }
  exceptionsLoading.value = true;
  try {
    const response = await agendaService.listExceptions();
    const data = response?.data ?? response ?? [];
    exceptions.value = Array.isArray(data) ? data.map(normalizeException) : [];
  } catch (error) {
    handleApiError(error, 'Nao foi possivel carregar as excecoes.', [404]);
  } finally {
    exceptionsLoading.value = false;
  }
};

const loadBlockings = async () => {
  if (!canAccess.value) {
    return;
  }
  blockingsLoading.value = true;
  try {
    const response = await agendaService.getBlockings();
    const data = response?.data ?? response ?? [];
    blockings.value = Array.isArray(data) ? data : [];
  } catch (error) {
    handleApiError(error, 'Nao foi possivel carregar os bloqueios.');
  } finally {
    blockingsLoading.value = false;
  }
};

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda', active: true },
  { label: 'Perfil', icon: 'user', href: '#' },
];

onMounted(() => {
  loadConfig();
  loadExceptions();
  loadBlockings();
});
</script>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
  background: var(--dash-bg);
  color: var(--dash-text);
  font-family: 'Sora', 'Space Grotesk', system-ui, sans-serif;
  --dash-bg: var(--app-bg);
  --dash-surface: var(--app-surface);
  --dash-surface-soft: var(--app-surface-soft);
  --dash-soft: var(--app-surface-strong);
  --dash-border: var(--app-border);
  --dash-text: var(--app-text);
  --dash-muted: var(--app-muted);
  --dash-primary: var(--app-accent);
  --dash-primary-soft: var(--app-accent-soft);
  --dash-success: var(--app-success);
  --dash-success-soft: var(--app-success-soft);
  --dash-warning: var(--app-warning);
  --dash-warning-soft: var(--app-warning-soft);
  --dash-danger: var(--app-danger);
  --dash-danger-soft: var(--app-danger-soft);
  --dash-shadow: var(--app-shadow);
  --dash-shadow-soft: var(--app-shadow-soft);
  --dash-radius: 18px;
  --dash-radius-lg: 24px;
  --dash-sidebar-width: 280px;
  --dash-topbar-height: 96px;
  --dash-mobile-nav-height: 72px;
}

.dashboard-main {
  margin-left: var(--dash-sidebar-width);
  padding-top: calc(var(--dash-topbar-height) + 32px);
  padding-bottom: 40px;
  min-height: 100vh;
}

.dashboard-content {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dash-action {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface, #ffffff);
  color: var(--dash-text, #0f172a);
  cursor: pointer;
}

.dash-action--primary {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 18px 40px -28px var(--dash-primary-soft, rgba(255, 122, 0, 0.45));
}

.dash-action--ghost {
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
}

.access-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.access-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
}

.access-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.access-text {
  margin: 6px 0 0;
  color: var(--dash-muted, #64748b);
  font-size: 0.9rem;
}

.info-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.info-item {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.info-value {
  font-size: 0.95rem;
  color: var(--dash-text, #0f172a);
}

.info-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.exceptions-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.card-empty {
  text-align: center;
  padding: 18px;
  color: var(--dash-muted, #64748b);
}

.exceptions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.exception-item {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exception-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.exception-date {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.exception-hours {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.exception-motivo {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-text, #0f172a);
}

.exception-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.exception-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
}

.exception-badge.is-closed {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.action-button {
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface, #ffffff);
  color: var(--dash-text, #0f172a);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.action-button--ghost {
  background: transparent;
  color: var(--dash-muted, #64748b);
}

.action-button--danger {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 120;
}

.modal-card {
  width: 100%;
  max-width: 720px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 12px;
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
}

.modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.modal-close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-muted, #64748b);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.modal-body {
  padding: 16px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--dash-muted, #64748b);
  font-weight: 600;
}

.form-field input,
.form-field select {
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
}

.form-field.has-error input,
.form-field.has-error select {
  border-color: var(--dash-danger, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
}

.form-field--wide {
  grid-column: span 2;
}

.form-error {
  font-size: 0.75rem;
  color: var(--dash-danger, #ef4444);
}

.days-card {
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.days-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.day-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--dash-text, #0f172a);
  font-weight: 600;
}

.day-option input {
  width: 16px;
  height: 16px;
  accent-color: var(--dash-primary, #ff7a00);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 1200px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .exceptions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 0;
    padding-top: calc(var(--dash-topbar-height) + 24px);
  }

  .dashboard-content {
    padding: 0 24px 60px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-field--wide {
    grid-column: span 1;
  }

  .days-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
