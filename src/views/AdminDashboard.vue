<template>
  <div class="dashboard-shell">
    <Sidebar
      :brand="brand"
      :general-items="generalItems"
      :support-items="supportItems"
      :quick-action="quickAction"
    />

    <Topbar
      :title="topbar.title"
      :subtitle="topbar.subtitle"
      :search-placeholder="topbar.searchPlaceholder"
      :user="topbar.user"
      :show-theme-toggle="topbar.showThemeToggle"
    />

    <main class="dashboard-main">
      <div class="dashboard-content">
        <section class="dashboard-kpi-grid">
          <KPI v-for="kpi in kpis" :key="kpi.title" :title="kpi.title" :value="kpi.value" :meta="kpi.meta" :icon="kpi.icon" />
        </section>

        <section class="dashboard-section">
          <SectionHeader title="Quadras (status em tempo real)">
            <template #actions>
              <button class="dash-action dash-action--ghost" type="button">
                <DashboardIcon name="filter" />
                Filtrar
              </button>
              <button class="dash-action dash-action--primary" type="button">
                <DashboardIcon name="plus" />
                Nova Quadra
              </button>
            </template>
          </SectionHeader>

          <div class="dashboard-quadra-grid">
            <QuadraCard
              v-for="quadra in quadras"
              :key="quadra.id"
              variant="admin"
              :name="quadra.name"
              :subtitle="quadra.subtitle"
              :status="quadra.status"
              :next-reservation-time="quadra.nextReservation"
              :secondary-action-label="quadra.secondaryActionLabel"
              :primary-action-label="quadra.primaryActionLabel"
            />
          </div>
        </section>

        <section class="dashboard-section">
          <SectionHeader title="Eventos criados">
            <template #actions>
              <button class="dash-action dash-action--primary" type="button">
                <DashboardIcon name="plus" />
                Criar Evento
              </button>
            </template>
          </SectionHeader>

          <div class="dashboard-event-grid">
            <EventoCard
              v-for="evento in eventos"
              :key="evento.id"
              :title="evento.title"
              :meta="evento.meta"
              :location="evento.location"
              :attendees="evento.attendees"
              :primary-action-label="evento.primaryActionLabel"
              :secondary-action-label="evento.secondaryActionLabel"
            />
          </div>
        </section>

        <section class="dashboard-section dashboard-info">
          <div class="info-wrap">
            <h2 class="info-title">Informações gerais</h2>
            <div class="info-grid">
              <div v-for="card in infoCards" :key="card.id" class="info-card">
                <span class="info-label">{{ card.label }}</span>
                <h3 class="info-headline">{{ card.headline }}</h3>
                <p class="info-text">{{ card.text }}</p>
                <p v-for="detail in card.details" :key="detail" class="info-detail">
                  {{ detail }}
                </p>
              </div>
            </div>
          </div>

          <AcoesRapidas title="Ações rápidas" :items="acoesRapidas" />
        </section>
      </div>
    </main>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue';
import Topbar from '../components/Topbar.vue';
import KPI from '../components/KPI.vue';
import SectionHeader from '../components/SectionHeader.vue';
import QuadraCard from '../components/QuadraCard.vue';
import EventoCard from '../components/EventoCard.vue';
import AcoesRapidas from '../components/AcoesRapidas.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';

const brand = {
  name: 'Playero',
  role: 'Admin Geral',
};

const generalItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '#', active: true },
  { label: 'Clientes', icon: 'users', href: '#' },
  { label: 'Quadras', icon: 'grid', href: '#' },
  { label: 'Reservas', icon: 'calendar-check', href: '#' },
  { label: 'Administradores', icon: 'shield', href: '#' },
  { label: 'CAgenda', icon: 'calendar', href: '#' },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
];

const supportItems = [{ label: 'Configurações', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho rápido',
  description: 'Criar um novo evento em poucos cliques.',
  buttonLabel: 'Novo Evento',
  href: '#',
};

const topbar = {
  title: 'Dashboard',
  subtitle: 'Visão geral do centro • quadras, reservas e eventos',
  searchPlaceholder: 'Buscar quadra, esporte, status...',
  user: {
    name: 'Admin',
    role: 'Geral',
  },
  showThemeToggle: false,
};

const kpis = [
  {
    title: 'Quadras livres agora',
    value: 3,
    meta: 'Prontas para reservar',
    icon: 'grid',
  },
  {
    title: 'Quadras sem reservas',
    value: 2,
    meta: 'Sem agenda futura',
    icon: 'calendar',
  },
  {
    title: 'Reservas em andamento',
    value: 2,
    meta: 'Status: hoje',
    icon: 'clipboard',
  },
];

const quadras = [
  {
    id: 1,
    name: 'Quadra 01',
    subtitle: 'Beach Tennis',
    status: 'Livre',
    nextReservation: 'Sem reservas',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  },
  {
    id: 2,
    name: 'Quadra 02',
    subtitle: 'Beach Tennis',
    status: 'Reservada',
    nextReservation: 'Hoje 18:00',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  },
  {
    id: 3,
    name: 'Quadra 03',
    subtitle: 'Vôlei',
    status: 'Livre',
    nextReservation: 'Sem reservas',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  },
  {
    id: 4,
    name: 'Quadra 04',
    subtitle: 'Footvolley',
    status: 'Manutenção',
    nextReservation: 'Retorno 16:30',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  },
  {
    id: 5,
    name: 'Quadra 05',
    subtitle: 'Beach Tennis',
    status: 'Livre',
    nextReservation: 'Hoje 20:00',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  },
  {
    id: 6,
    name: 'Quadra 06',
    subtitle: 'Vôlei',
    status: 'Reservada',
    nextReservation: 'Hoje 19:00',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  },
];

const eventos = [
  {
    id: 1,
    title: 'Festa de Aniversário (Kids)',
    attendees: 28,
    meta: 'Aniversário • Sáb, 10/02 • 16:00 - 19:00',
    location: 'Área Kids + Bar',
    secondaryActionLabel: 'Gerenciar',
    primaryActionLabel: 'Ver lista',
  },
  {
    id: 2,
    title: 'Happy Hour Corporativo (VIP)',
    attendees: 42,
    meta: 'Festa da Empresa • Qui, 15/02 • 19:30 - 23:00',
    location: 'Chillout + VIP',
    secondaryActionLabel: 'Gerenciar',
    primaryActionLabel: 'Ver lista',
  },
  {
    id: 3,
    title: 'Torneio Relâmpago Beach Tennis',
    attendees: 64,
    meta: 'Torneio • Dom, 18/02 • 09:00 - 13:00',
    location: 'Quadras 01-03',
    secondaryActionLabel: 'Gerenciar',
    primaryActionLabel: 'Ver lista',
  },
];

const infoCards = [
  {
    id: 1,
    label: 'Hoje',
    headline: 'Fluxo estimado',
    text: 'Movimento moderado no bar e nas quadras.',
    details: [],
  },
  {
    id: 2,
    label: 'Alertas',
    headline: '1 quadra em manutenção',
    text: 'Verificar rede, iluminação e areia.',
    details: [],
  },
  {
    id: 3,
    label: 'Financeiro',
    headline: 'Resumo do dia (mock)',
    text: 'Receita prevista: R$ 3.420',
    details: ['Ticket médio: R$ 68'],
  },
  {
    id: 4,
    label: 'Equipe',
    headline: 'Administradores ativos',
    text: '2 colaboradores gerindo reservas agora.',
    details: [],
  },
];

const acoesRapidas = [
  { label: 'Criar cliente', icon: 'user-plus', href: '#' },
  { label: 'Criar reserva', icon: 'calendar-plus', href: '#' },
  { label: 'Adicionar quadra', icon: 'grid-plus', href: '#' },
  { label: 'Novo administrador', icon: 'shield', href: '#' },
  { label: 'Bloquear horário', icon: 'ban', href: '#' },
  { label: 'Criar evento', icon: 'sparkle', href: '#' },
];

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '#', active: true },
  { label: 'Quadras', icon: 'grid', href: '#' },
  { label: 'Reservas', icon: 'calendar-check', href: '#' },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
  { label: 'Perfil', icon: 'user', href: '#' },
];
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
  padding-top: calc(var(--dash-topbar-height) + 24px);
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

.dashboard-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-quadra-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.dashboard-event-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-info {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.info-wrap {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 20px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.info-title {
  margin: 0 0 18px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-card {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.info-headline {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.info-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.info-detail {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
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

@media (max-width: 1200px) {
  .dashboard-kpi-grid,
  .dashboard-quadra-grid,
  .dashboard-event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 0;
    padding-top: 150px;
  }

  .dashboard-content {
    padding: 0 24px 60px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding-top: 180px;
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-kpi-grid,
  .dashboard-quadra-grid,
  .dashboard-event-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }
}
</style>

