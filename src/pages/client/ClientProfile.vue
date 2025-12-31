<template>
  <div class="dashboard-shell client-shell">
    <Sidebar
      mode="client"
      :brand="brand"
      general-label="CLIENTE"
      support-label="SUPORTE"
      :general-items="generalItems"
      :support-items="supportItems"
      :user="sidebarUser"
    />

    <main class="dashboard-main">
      <div class="dashboard-content">
        <SectionHeader title="Meu perfil" subtitle="Atualize seus dados e credenciais." />

        <div class="profile-grid">
          <section class="profile-card">
            <header class="profile-card-header">
              <div>
                <p class="card-eyebrow">Dados do cliente</p>
                <h3 class="card-title">{{ profile.name || '---' }}</h3>
              </div>
              <span class="status-pill status-pill--info">{{ profile.role || 'Cliente' }}</span>
            </header>

            <div class="profile-list">
              <div class="profile-item">
                <span class="profile-label">Nome</span>
                <strong class="profile-value">{{ profile.firstName || '---' }}</strong>
              </div>
              <div class="profile-item">
                <span class="profile-label">Sobrenome</span>
                <strong class="profile-value">{{ profile.lastName || '---' }}</strong>
              </div>
              <div class="profile-item">
                <span class="profile-label">Email</span>
                <strong class="profile-value">{{ profile.email || '---' }}</strong>
              </div>
              <div class="profile-item">
                <span class="profile-label">Telefone</span>
                <strong class="profile-value">{{ profile.phone || '---' }}</strong>
              </div>
            </div>
          </section>

          <section class="profile-card">
            <header class="profile-card-header">
              <div>
                <p class="card-eyebrow">Seguran\u00e7a</p>
                <h3 class="card-title">Alterar email</h3>
              </div>
            </header>

            <form class="profile-form" @submit.prevent="handleSubmit">
              <div v-if="formErrors.general" class="form-error">
                {{ formErrors.general }}
              </div>

              <label class="form-field">
                <span>Novo email</span>
                <input
                  v-model.trim="form.newEmail"
                  type="email"
                  placeholder="novo@email.com"
                  :class="{ 'has-error': formErrors.newEmail }"
                />
                <small v-if="formErrors.newEmail" class="field-error">{{ formErrors.newEmail }}</small>
              </label>

              <label class="form-field">
                <span>Confirmar email</span>
                <input
                  v-model.trim="form.confirmEmail"
                  type="email"
                  placeholder="confirme seu email"
                  :class="{ 'has-error': formErrors.confirmEmail }"
                />
                <small v-if="formErrors.confirmEmail" class="field-error">{{ formErrors.confirmEmail }}</small>
              </label>

              <label class="form-field">
                <span>Senha atual</span>
                <input
                  v-model="form.currentPassword"
                  type="password"
                  placeholder="********"
                  :class="{ 'has-error': formErrors.currentPassword }"
                />
                <small v-if="formErrors.currentPassword" class="field-error">
                  {{ formErrors.currentPassword }}
                </small>
              </label>

              <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
                {{ isSaving ? 'Salvando...' : 'Salvar' }}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '../../components/Sidebar.vue';
import SectionHeader from '../../components/SectionHeader.vue';
import MobileNav from '../../components/MobileNav.vue';
import api from '../../services/apiClient';
import { useAuth } from '../../stores/auth';
import { useToast } from '../../composables/useToast';

const route = useRoute();
const auth = useAuth();
const toast = useToast();

const mockMode = import.meta.env.VITE_MOCK_MODE === 'true';

const brand = computed(() => ({
  name: 'Playero',
  role: 'Cliente',
}));

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  const firstName = user.first_name ?? user.nome ?? user.name ?? '';
  const lastName = user.last_name ?? user.sobrenome ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return {
    name: fullName || 'Cliente',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Cliente',
  };
});

const generalItems = computed(() => [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    href: '/cliente/dashboard',
    active: route.path === '/cliente/dashboard',
  },
  {
    label: 'Minhas Reservas',
    icon: 'calendar-check',
    href: '/cliente/reservas',
    active: route.path === '/cliente/reservas',
  },
  {
    label: 'Meu Perfil',
    icon: 'user',
    href: '/cliente/perfil',
    active: route.path === '/cliente/perfil',
  },
]);

const supportItems = computed(() => [
  {
    label: 'Suporte',
    icon: 'clipboard',
    href: '/cliente/suporte',
    active: route.path === '/cliente/suporte',
  },
]);

const mobileNav = computed(() => [
  { label: 'Dashboard', icon: 'dashboard', href: '/cliente/dashboard', active: route.path === '/cliente/dashboard' },
  { label: 'Reservas', icon: 'calendar-check', href: '/cliente/reservas', active: route.path === '/cliente/reservas' },
  { label: 'Perfil', icon: 'user', href: '/cliente/perfil', active: route.path === '/cliente/perfil' },
  { label: 'Suporte', icon: 'clipboard', href: '/cliente/suporte', active: route.path === '/cliente/suporte' },
]);

const profile = reactive({
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'Cliente',
});

const form = reactive({
  newEmail: '',
  confirmEmail: '',
  currentPassword: '',
});

const formErrors = reactive({
  newEmail: '',
  confirmEmail: '',
  currentPassword: '',
  general: '',
});

const isSaving = ref(false);

const mockProfile = {
  name: 'Juliana Santos',
  firstName: 'Juliana',
  lastName: 'Santos',
  email: 'juliana@playero.com',
  phone: '(11) 98888-7777',
  role: 'Cliente',
};

const normalizeProfile = (payload) => {
  const raw = payload?.data ?? payload?.user ?? payload ?? {};
  const firstName = raw.first_name ?? raw.nome ?? raw.name ?? '';
  const lastName = raw.last_name ?? raw.sobrenome ?? raw.apelido ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return {
    name: fullName || raw.name || '---',
    firstName: firstName || '---',
    lastName: lastName || '---',
    email: raw.email ?? raw.email_address ?? '',
    phone: raw.phone ?? raw.telefone ?? raw.contato ?? '',
    role: raw.role ?? raw.perfil ?? raw.tipo ?? 'Cliente',
  };
};

const setProfile = (payload) => {
  Object.assign(profile, payload);
};

const clearErrors = () => {
  formErrors.newEmail = '';
  formErrors.confirmEmail = '';
  formErrors.currentPassword = '';
  formErrors.general = '';
};

const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

const handleSubmit = async () => {
  if (isSaving.value) {
    return;
  }

  clearErrors();

  if (!form.newEmail.trim()) {
    formErrors.newEmail = 'Informe o novo email.';
  } else if (!validateEmail(form.newEmail)) {
    formErrors.newEmail = 'Informe um email v\u00e1lido.';
  }

  if (!form.confirmEmail.trim()) {
    formErrors.confirmEmail = 'Confirme o novo email.';
  } else if (form.newEmail.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase()) {
    formErrors.confirmEmail = 'Os emails n\u00e3o conferem.';
  }

  if (formErrors.newEmail || formErrors.confirmEmail) {
    toast.error('Verifique os campos destacados.');
    return;
  }

  isSaving.value = true;

  try {
    if (mockMode) {
      setProfile({ ...profile, email: form.newEmail.trim() });
      toast.success('Email atualizado com sucesso.');
      form.newEmail = '';
      form.confirmEmail = '';
      form.currentPassword = '';
      return;
    }

    const payload = {
      email: form.newEmail.trim(),
      email_confirmation: form.confirmEmail.trim(),
      password: form.currentPassword || undefined,
    };

    await api.put('/api/v1/me/email', payload);
    setProfile({ ...profile, email: form.newEmail.trim() });
    toast.success('Email atualizado com sucesso.');
    form.newEmail = '';
    form.confirmEmail = '';
    form.currentPassword = '';
  } catch (error) {
    const status = error?.response?.status;
    if (status === 422) {
      const errors = error?.response?.data?.errors ?? error?.normalized?.errors ?? {};
      const emailError = errors.email?.[0] ?? errors.email?.message;
      const confirmError = errors.email_confirmation?.[0] ?? errors.email_confirmation?.message;
      const passwordError = errors.password?.[0] ?? errors.password?.message;
      formErrors.newEmail = emailError || formErrors.newEmail;
      formErrors.confirmEmail = confirmError || formErrors.confirmEmail;
      formErrors.currentPassword = passwordError || '';
      formErrors.general = 'N\u00e3o foi poss\u00edvel atualizar o email.';
      toast.error('Corrija os erros e tente novamente.');
      return;
    }

    formErrors.general = 'N\u00e3o foi poss\u00edvel atualizar o email.';
    toast.error('Falha ao atualizar o email.');
  } finally {
    isSaving.value = false;
  }
};

const loadProfile = async () => {
  if (mockMode) {
    setProfile(mockProfile);
    return;
  }

  try {
    const response = await api.get('/auth/me');
    setProfile(normalizeProfile(response?.data ?? response));
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      setProfile(mockProfile);
      toast.info('Perfil em modo de demonstra\u00e7\u00e3o.');
      return;
    }
    toast.error('N\u00e3o foi poss\u00edvel carregar o perfil.');
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.client-shell {
  min-height: 100vh;
  background: #0b0d10;
  color: #f7f7f8;
  font-family: 'Sora', 'Space Grotesk', system-ui, sans-serif;
  --dash-bg: #0b0d10;
  --dash-surface: #141418;
  --dash-surface-soft: #15151b;
  --dash-soft: #1a1a1f;
  --dash-border: rgba(255, 255, 255, 0.1);
  --dash-text: #f7f7f8;
  --dash-muted: #b5b5b5;
  --dash-primary: #ff7a00;
  --dash-primary-soft: rgba(255, 122, 0, 0.18);
  --dash-success: #4caf50;
  --dash-success-soft: rgba(76, 175, 80, 0.2);
  --dash-warning: #ffc107;
  --dash-warning-soft: rgba(255, 193, 7, 0.2);
  --dash-danger: #ff5f6b;
  --dash-danger-soft: rgba(255, 95, 107, 0.2);
  --dash-info: #1976d2;
  --dash-shadow: 0 30px 70px -50px rgba(0, 0, 0, 0.7);
  --dash-radius: 18px;
  --dash-radius-lg: 24px;
  --dash-sidebar-width: 280px;
  --dash-mobile-nav-height: 72px;
}

.dashboard-shell {
  min-height: 100vh;
  background: var(--dash-bg);
  color: var(--dash-text);
}

.dashboard-main {
  margin-left: var(--dash-sidebar-width);
  padding-top: 32px;
  padding-bottom: 40px;
  min-height: 100vh;
}

.dashboard-content {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px 60px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.profile-card {
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  border-radius: var(--dash-radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: var(--dash-shadow);
}

.profile-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted);
  font-weight: 700;
}

.card-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.profile-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.profile-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted);
  font-weight: 700;
}

.profile-value {
  font-size: 0.95rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--dash-muted);
  font-weight: 600;
}

.form-field input {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f0f12;
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-field input:focus {
  outline: none;
  border-color: rgba(255, 122, 0, 0.6);
  box-shadow: 0 0 0 2px rgba(255, 122, 0, 0.2);
}

.form-field input.has-error {
  border-color: rgba(255, 95, 107, 0.7);
}

.field-error {
  color: #ff5f6b;
  font-size: 0.75rem;
}

.form-error {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 95, 107, 0.4);
  background: rgba(58, 24, 24, 0.6);
  color: #f7f7f8;
  font-size: 0.85rem;
}

.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-pill--info {
  background: rgba(25, 118, 210, 0.2);
  color: #88b7ff;
}

.dash-action {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--dash-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--dash-text);
  cursor: pointer;
}

.dash-action--primary {
  background: var(--dash-primary);
  color: #0b0d10;
  border-color: transparent;
  box-shadow: 0 18px 40px -28px rgba(255, 122, 0, 0.6);
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 0;
    padding-top: 24px;
  }

  .dashboard-content {
    padding: 0 24px 60px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding-top: 24px;
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .profile-list {
    grid-template-columns: 1fr;
  }
}
</style>


