<template>
  <div class="login-shell relative min-h-screen bg-[#0F0F12] text-white">
    <div class="login-background absolute inset-0">
      <div class="login-background-image h-full w-full bg-cover bg-center" :style="backgroundStyle"></div>
      <div class="login-background-overlay absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
      <div class="login-background-vignette absolute inset-0 bg-[#140f10]/40"></div>
    </div>

    <div class="login-stage relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div
        class="login-card w-full rounded-[32px] border border-white/10 bg-white/5 shadow-[0_50px_140px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl animate-fade-up"
      >
        <div class="login-grid grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-0 lg:p-12">
          <div class="login-brand flex flex-col gap-10 lg:pr-12">
            <div class="login-logo-row flex items-center gap-3">
              <div
                class="login-logo-badge flex h-12 w-12 items-center justify-center rounded-full bg-[#FF7A00] shadow-[0_10px_30px_-15px_rgba(255,122,0,0.8)]"
              >
                <img src="/images/logo-text.png" alt="Playero" class="login-logo-image" />
              </div>
              <span class="login-logo-text text-4xl font-semibold text-white"></span>
            </div>

            <h1 class="login-hero-title text-4xl font-semibold leading-tight text-white sm:text-4xl">
              Reserva, joga,
              <br class="hidden sm:block" />
              desfruta.
            </h1>
            <p class="login-hero-subtitle text-sm text-white/70 sm:text-base">
              Seu ponto de encontro para esporte, lazer e bons momentos.
            </p>
          </div>

          <div class="login-panel-wrap relative lg:pl-12">
            <div class="login-divider-line absolute left-0 top-0 hidden h-full w-px bg-white/10 lg:block"></div>

            <div
              class="login-panel rounded-2xl border border-white/10 bg-[#2b2426]/80 p-7 shadow-[0_35px_100px_-50px_rgba(0,0,0,0.9)] backdrop-blur-lg sm:p-8 animate-fade-up"
              :class="{ 'login-panel--compact': !isRegistering }"
              style="animation-delay: 0.08s"
            >
              <transition name="login-panel-fade" mode="out-in">
                <div :key="panelMode">
                  <h2 class="login-panel-title text-center text-lg font-semibold text-white sm:text-xl">
                    {{ isRegistering
                      ? 'Crie sua conta no Playero'
                      : 'Entre na sua conta para reservar uma quadra ou uma data comemorativa' }}
                  </h2>
                  <p v-if="isRegistering" class="mt-2 text-center text-sm text-white/70">
                    Cadastre-se para reservar quadras, eventos e experiências especiais.
                  </p>

                  <div
                    v-if="hasActiveError"
                    class="login-error mt-5 flex gap-3 rounded-xl border border-[#FF7A00]/60 bg-[#3a1f1d]/70 px-4 py-3 text-sm text-white/90"
                  >
                    <span
                      class="login-error-icon flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7A00]/20 text-[#FF7A00]"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 9v4" stroke-linecap="round" />
                        <path d="M12 17h.01" stroke-linecap="round" />
                        <path
                          d="M10.3 3.7L1.8 18.3a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p class="login-error-title font-semibold text-white">{{ activeErrorHeadline }}</p>
                      <p class="login-error-detail text-xs text-white/70">{{ activeErrorDetail }}</p>
                    </div>
                  </div>

                  <form v-if="!isRegistering" class="login-form mt-6 space-y-4" @submit.prevent="handleSubmit">
                    <label class="login-field relative block">
                      <span class="sr-only">Email</span>
                      <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                          <path
                            d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                          />
                          <path d="m22 8-10 6L2 8" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </span>
                      <input
                        v-model.trim="email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        placeholder="joao@example.com"
                        :class="[
                          'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                          hasLoginError
                            ? 'login-input--error border-[#FF7A00]/60 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60'
                            : 'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                        ]"
                      />
                    </label>

                    <label class="login-field relative block">
                      <span class="sr-only">Senha</span>
                      <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                          <rect x="4" y="11" width="16" height="10" rx="2" />
                          <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke-linecap="round" />
                        </svg>
                      </span>
                      <input
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        name="password"
                        autocomplete="current-password"
                        placeholder="********"
                        :class="[
                          'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                          hasLoginError
                            ? 'login-input--error border-[#FF7A00]/60 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60'
                            : 'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                        ]"
                      />
                      <button
                        type="button"
                        class="login-password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                        @click="togglePassword"
                      >
                        <svg
                          v-if="showPassword"
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg
                          v-else
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                        >
                          <path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-7 0-11-7-11-7a19.6 19.6 0 0 1 5.1-5.6" />
                          <path d="M9.9 4.6A10.2 10.2 0 0 1 12 5c7 0 11 7 11 7a19.7 19.7 0 0 1-4.1 5" />
                          <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
                          <path d="M3 3l18 18" stroke-linecap="round" />
                        </svg>
                      </button>
                    </label>

                    <div class="login-forgot text-sm text-white/70">
                      <a href="#" class="login-link transition hover:text-white">
                        Esqueci minha <span class="login-link-accent text-[#FF7A00]">senha</span>
                      </a>
                    </div>

                    <button
                      type="submit"
                      class="login-primary-button w-full rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(255,122,0,0.9)] transition hover:bg-[#FF8F26] disabled:cursor-not-allowed disabled:opacity-70"
                      :disabled="isSubmitting"
                    >
                      {{ isSubmitting ? 'Entrando...' : 'Tentar novamente' }}
                    </button>

                    <p class="login-signup text-center text-sm text-white/60">
                      Não tem conta?
                      <button
                        type="button"
                        class="login-link login-link-accent text-[#FF7A00] transition hover:text-[#FF8F26]"
                        @click="switchToRegister"
                      >
                        Cadastre-se
                      </button>
                    </p>

                    <div class="login-divider flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/40">
                      <span class="h-px flex-1 bg-white/10"></span>
                      ou
                      <span class="h-px flex-1 bg-white/10"></span>
                    </div>

                    <button
                      type="button"
                      class="login-secondary-button flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                    >
                      <svg class="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                        <path
                          fill="#FFC107"
                          d="M43.6 20.4H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.2 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.2 0 19-7.4 19-20 0-1.2-.1-2.4-.4-3.6z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.3 14.7 12.9 19C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.2 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 35.7 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.6 20.4H42V20H24v8h11.3c-1.1 3-3.3 5.5-6.1 7.1l.1.1 6.3 5.2C39.8 37 44 31.3 44 24c0-1.2-.1-2.4-.4-3.6z"
                        />
                      </svg>
                      Entrar com Google
                    </button>
                  </form>

                  <form v-else class="login-form mt-6 space-y-4" @submit.prevent="handleRegister">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="login-field relative block">
                        <span class="sr-only">Nome</span>
                        <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          v-model.trim="registerFirstName"
                          type="text"
                          name="first-name"
                          autocomplete="given-name"
                          placeholder="Nome"
                          :class="[
                            'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                            'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                          ]"
                          required
                        />
                      </label>

                      <label class="login-field relative block">
                        <span class="sr-only">Sobrenome</span>
                        <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          v-model.trim="registerLastName"
                          type="text"
                          name="last-name"
                          autocomplete="family-name"
                          placeholder="Sobrenome"
                          :class="[
                            'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                            'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                          ]"
                          required
                        />
                      </label>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="login-field relative block">
                        <span class="sr-only">Telefone</span>
                        <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path
                              d="M22 16.9V20a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2 4.2 2 2 0 0 1 4 2h3.1a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.45 2.1L8 9a16 16 0 0 0 7 7l.4-1.4a2 2 0 0 1 2.1-.45 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2.05z"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </span>
                        <input
                          v-model.trim="registerPhone"
                          type="tel"
                          name="phone"
                          autocomplete="tel"
                          placeholder="(11) 99999-9999"
                          :class="[
                            'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                            'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                          ]"
                          required
                        />
                      </label>

                      <label class="login-field relative block">
                        <span class="sr-only">Confirmar telefone</span>
                        <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path
                              d="M22 16.9V20a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2 4.2 2 2 0 0 1 4 2h3.1a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.45 2.1L8 9a16 16 0 0 0 7 7l.4-1.4a2 2 0 0 1 2.1-.45 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2.05z"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </span>
                        <input
                          v-model.trim="registerPhoneConfirm"
                          type="tel"
                          name="phone-confirm"
                          autocomplete="tel"
                          placeholder="Confirme seu telefone"
                          :class="[
                            'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                            registerPhoneMismatch
                              ? 'login-input--error border-[#FF7A00]/60 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60'
                              : 'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                          ]"
                          required
                        />
                      </label>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <label class="login-field relative block">
                        <span class="sr-only">Email</span>
                        <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path
                              d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                            />
                            <path d="m22 8-10 6L2 8" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </span>
                        <input
                          v-model.trim="registerEmail"
                          type="email"
                          name="register-email"
                          autocomplete="email"
                          placeholder="seuemail@playero.com"
                          :class="[
                            'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                            'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                          ]"
                          required
                        />
                      </label>

                      <label class="login-field relative block">
                        <span class="sr-only">Confirmar email</span>
                        <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                            <path
                              d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                            />
                            <path d="m22 8-10 6L2 8" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </span>
                        <input
                          v-model.trim="registerEmailConfirm"
                          type="email"
                          name="register-email-confirm"
                          autocomplete="email"
                          placeholder="confirme seu email"
                          :class="[
                            'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                            registerEmailMismatch
                              ? 'login-input--error border-[#FF7A00]/60 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60'
                              : 'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                          ]"
                          required
                        />
                      </label>
                    </div>

                    <label class="login-field relative block">
                      <span class="sr-only">Senha</span>
                      <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                          <rect x="4" y="11" width="16" height="10" rx="2" />
                          <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke-linecap="round" />
                        </svg>
                      </span>
                      <input
                        v-model="registerPassword"
                        :type="registerShowPassword ? 'text' : 'password'"
                        name="register-password"
                        autocomplete="new-password"
                        placeholder="Crie uma senha"
                        :class="[
                          'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                          'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                        ]"
                        required
                      />
                      <button
                        type="button"
                        class="login-password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                        @click="toggleRegisterPassword"
                      >
                        <svg
                          v-if="registerShowPassword"
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg
                          v-else
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                        >
                          <path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-7 0-11-7-11-7a19.6 19.6 0 0 1 5.1-5.6" />
                          <path d="M9.9 4.6A10.2 10.2 0 0 1 12 5c7 0 11 7 11 7a19.7 19.7 0 0 1-4.1 5" />
                          <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
                          <path d="M3 3l18 18" stroke-linecap="round" />
                        </svg>
                      </button>
                    </label>

                    <label class="login-field relative block">
                      <span class="sr-only">Confirmar senha</span>
                      <span class="login-field-icon absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                          <rect x="4" y="11" width="16" height="10" rx="2" />
                          <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke-linecap="round" />
                        </svg>
                      </span>
                      <input
                        v-model="registerPasswordConfirm"
                        :type="registerShowPasswordConfirm ? 'text' : 'password'"
                        name="register-password-confirm"
                        autocomplete="new-password"
                        placeholder="Confirme sua senha"
                        :class="[
                          'login-input w-full rounded-xl border bg-black/30 px-11 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-1',
                          registerPasswordMismatch
                            ? 'login-input--error border-[#FF7A00]/60 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60'
                            : 'login-input--normal border-white/10 focus:border-[#FF7A00] focus:ring-[#FF7A00]/60',
                        ]"
                        required
                      />
                      <button
                        type="button"
                        class="login-password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                        @click="toggleRegisterPasswordConfirm"
                      >
                        <svg
                          v-if="registerShowPasswordConfirm"
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg
                          v-else
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                        >
                          <path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-7 0-11-7-11-7a19.6 19.6 0 0 1 5.1-5.6" />
                          <path d="M9.9 4.6A10.2 10.2 0 0 1 12 5c7 0 11 7 11 7a19.7 19.7 0 0 1-4.1 5" />
                          <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
                          <path d="M3 3l18 18" stroke-linecap="round" />
                        </svg>
                      </button>
                    </label>

                    <label class="login-terms flex items-start gap-3 text-sm text-white/70">
                      <input
                        v-model="registerTermsAccepted"
                        type="checkbox"
                        class="login-checkbox mt-1 shrink-0"
                        required
                      />
                      <span>
                        Aceito os termos de privacidade e autorizo o envio de comunicações por email
                      </span>
                    </label>

                    <button
                      type="submit"
                      class="login-primary-button w-full rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(255,122,0,0.9)] transition hover:bg-[#FF8F26] disabled:cursor-not-allowed disabled:opacity-70"
                      :disabled="!isRegisterReady || isRegisterSubmitting"
                    >
                      {{ isRegisterSubmitting ? 'Criando...' : 'Criar conta' }}
                    </button>

                    <p class="login-signup text-center text-sm text-white/60">
                      Já tenho conta?
                      <button
                        type="button"
                        class="login-link login-link-accent text-[#FF7A00] transition hover:text-[#FF8F26]"
                        @click="switchToLogin"
                      >
                        Entrar
                      </button>
                    </p>
                  </form>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuth();

const panelMode = ref('login');
const isRegistering = computed(() => panelMode.value === 'register');

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);

const registerFirstName = ref('');
const registerLastName = ref('');
const registerPhone = ref('');
const registerPhoneConfirm = ref('');
const registerEmail = ref('');
const registerEmailConfirm = ref('');
const registerPassword = ref('');
const registerPasswordConfirm = ref('');
const registerTermsAccepted = ref(false);
const registerShowPassword = ref(false);
const registerShowPasswordConfirm = ref(false);
const isRegisterSubmitting = ref(false);

const loginErrorHeadline = ref('');
const loginErrorDetail = ref('');
const registerErrorHeadline = ref('');
const registerErrorDetail = ref('');

const hasLoginError = computed(() => loginErrorHeadline.value.length > 0);
const activeErrorHeadline = computed(() =>
  isRegistering.value ? registerErrorHeadline.value : loginErrorHeadline.value,
);
const activeErrorDetail = computed(() =>
  isRegistering.value ? registerErrorDetail.value : loginErrorDetail.value,
);
const hasActiveError = computed(() => activeErrorHeadline.value.length > 0);

const loginBackgroundUrl = (import.meta.env.VITE_LOGIN_BG_URL ?? '/images/login.jpg').trim();

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${loginBackgroundUrl})`,
}));

const registerEmailMismatch = computed(() => {
  const emailValue = registerEmail.value.trim().toLowerCase();
  const confirmValue = registerEmailConfirm.value.trim().toLowerCase();
  return Boolean(emailValue && confirmValue && emailValue !== confirmValue);
});

const registerPhoneMismatch = computed(() => {
  const phoneValue = registerPhone.value.replace(/\D/g, '');
  const confirmValue = registerPhoneConfirm.value.replace(/\D/g, '');
  return Boolean(phoneValue && confirmValue && phoneValue !== confirmValue);
});

const registerPasswordMismatch = computed(() => {
  const passwordValue = registerPassword.value;
  const confirmValue = registerPasswordConfirm.value;
  return Boolean(passwordValue && confirmValue && passwordValue !== confirmValue);
});

const isRegisterReady = computed(() =>
  Boolean(
    registerFirstName.value.trim() &&
      registerLastName.value.trim() &&
      registerPhone.value.trim() &&
      registerPhoneConfirm.value.trim() &&
      registerEmail.value.trim() &&
      registerEmailConfirm.value.trim() &&
      registerPassword.value &&
      registerPasswordConfirm.value &&
      registerTermsAccepted.value,
  ),
);

const toggleGlobalScrollLock = (isActive) => {
  if (typeof document === 'undefined') {
    return;
  }
  const className = 'login-shell-active';
  document.documentElement.classList.toggle(className, isActive);
  document.body.classList.toggle(className, isActive);
};

onMounted(() => {
  toggleGlobalScrollLock(true);
});

onBeforeUnmount(() => {
  toggleGlobalScrollLock(false);
});

const clearErrors = () => {
  loginErrorHeadline.value = '';
  loginErrorDetail.value = '';
  registerErrorHeadline.value = '';
  registerErrorDetail.value = '';
};

const switchPanel = (mode) => {
  if (panelMode.value === mode) {
    return;
  }
  panelMode.value = mode;
  clearErrors();
};

const switchToRegister = () => {
  switchPanel('register');
};

const switchToLogin = () => {
  switchPanel('login');
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleRegisterPassword = () => {
  registerShowPassword.value = !registerShowPassword.value;
};

const toggleRegisterPasswordConfirm = () => {
  registerShowPasswordConfirm.value = !registerShowPasswordConfirm.value;
};

const setLoginError = (headline, detail) => {
  loginErrorHeadline.value = headline;
  loginErrorDetail.value = detail;
};

const setRegisterError = (headline, detail) => {
  registerErrorHeadline.value = headline;
  registerErrorDetail.value = detail;
};

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

const handleRegister = () => {
  if (isRegisterSubmitting.value) {
    return;
  }
  registerErrorHeadline.value = '';
  registerErrorDetail.value = '';

  if (!isRegisterReady.value) {
    return;
  }

  if (registerEmailMismatch.value) {
    setRegisterError('Os emails não conferem.', 'Verifique se os emails digitados são iguais.');
    return;
  }

  if (registerPhoneMismatch.value) {
    setRegisterError('Os telefones não conferem.', 'Verifique se os telefones digitados são iguais.');
    return;
  }

  if (registerPasswordMismatch.value) {
    setRegisterError('As senhas não conferem.', 'Verifique se as senhas digitadas são iguais.');
  }
};

const handleSubmit = async () => {
  if (isSubmitting.value) {
    return;
  }
  isSubmitting.value = true;
  loginErrorHeadline.value = '';
  loginErrorDetail.value = '';

  try {
    await auth.login(email.value, password.value);

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
    if (redirect && redirect !== '/login') {
      router.push(redirect);
      return;
    }

    if (auth.role.value && /admin/i.test(auth.role.value)) {
      router.push('/admin');
      return;
    }

    router.push('/');
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      setLoginError('Email ou senha incorretos.', 'Verifique seus dados e tente novamente.');
      return;
    }
    if (status === 422) {
      const validationMessage = getValidationMessage(error);
      setLoginError('Dados inválidos.', validationMessage || 'Verifique seus dados e tente novamente.');
      return;
    }
    if (error?.normalized?.message) {
      setLoginError(error.normalized.message, 'Verifique seus dados e tente novamente.');
      return;
    }
    setLoginError('Não foi possível entrar.', 'Verifique sua conexão e tente novamente.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.login-shell {
  --accent: #ff7a00;
  --accent-strong: #ff8f26;
  --danger: #ff5f6b;
  --text-primary: #f7f7f8;
  --text-secondary: rgba(255, 255, 255, 0.72);
  --text-muted: rgba(255, 255, 255, 0.56);
  --text-faint: rgba(255, 255, 255, 0.4);
  --glass-border: rgba(255, 255, 255, 0.12);
  --panel-bg: linear-gradient(140deg, rgba(28, 30, 36, 0.6) 0%, rgba(12, 14, 18, 0.35) 100%);
  --panel-border: rgba(255, 255, 255, 0.14);
  --input-bg: rgba(8, 10, 12, 0.45);
  --input-border: rgba(255, 255, 255, 0.18);
  --shadow-strong: 0 60px 160px -80px rgba(0, 0, 0, 0.95), 0 30px 90px -70px rgba(0, 0, 0, 0.9);
  --shadow-panel: 0 24px 70px -60px rgba(0, 0, 0, 0.78);
  font-family: "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: var(--text-primary);
  background-color: #0b0d10;
  height: 100vh;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 122, 0, 0.45) rgba(10, 12, 15, 0.55);
}

:global(html.login-shell-active),
:global(body.login-shell-active) {
  height: 100%;
  overflow: hidden;
}

.login-shell::-webkit-scrollbar {
  width: 8px;
}

.login-shell::-webkit-scrollbar-track {
  background: rgba(10, 12, 15, 0.55);
  border-radius: 999px;
}

.login-shell::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(255, 122, 0, 0.55), rgba(255, 122, 0, 0.25));
  border-radius: 999px;
  border: 2px solid rgba(10, 12, 15, 0.55);
}

.login-shell::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(255, 122, 0, 0.75), rgba(255, 122, 0, 0.35));
}

.login-shell *,
.login-shell *::before,
.login-shell *::after {
  box-sizing: border-box;
}

.login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.login-background-image {
  filter: blur(6px) saturate(0.85) brightness(0.7);
  transform: scale(1.06);
}

.login-background-overlay,
.login-background-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-background-overlay {
  background: linear-gradient(
    120deg,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(12, 12, 16, 0.6) 45%,
    rgba(0, 0, 0, 0.85) 100%
  );
}

.login-background-vignette {
  background:
    radial-gradient(90% 80% at 20% 15%, rgba(255, 122, 0, 0.12), transparent 55%),
    radial-gradient(75% 70% at 85% 20%, rgba(255, 255, 255, 0.08), transparent 60%),
    radial-gradient(80% 90% at 15% 85%, rgba(20, 30, 40, 0.5), transparent 60%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.6));
}

.login-stage {
  width: 100%;
  max-width: none;
  margin: 0;
  justify-content: center;
  position: relative;
  inset: auto;
  align-items: flex-start;
  min-height: 100svh;
  padding: clamp(1rem, 3vw, 2.25rem);
}

@media (min-width: 640px) {
  .login-stage {
    padding: clamp(1.5rem, 3.5vw, 3rem);
  }
}

@media (min-width: 1024px) {
  .login-stage {
    position: fixed;
    inset: 0;
    align-items: center;
    justify-content: flex-end;
    padding: 3.5rem 4.5rem;
  }
}

.login-card {
  width: min(1320px, 100%);
  max-height: none;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid var(--glass-border);
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(24, 26, 32, 0.82), rgba(16, 18, 22, 0.68));
  box-shadow: var(--shadow-strong);
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 122, 0, 0.35) rgba(12, 14, 18, 0.5);
}

@media (min-width: 640px) {
  .login-card {
    max-height: calc(100vh - 4rem);
    max-height: calc(100svh - 4rem);
  }
}

@media (min-width: 1024px) {
  .login-card {
    max-height: calc(100vh - 7rem);
    max-height: calc(100svh - 7rem);
  }
}

.login-card::-webkit-scrollbar {
  width: 8px;
}

.login-card::-webkit-scrollbar-track {
  background: rgba(12, 14, 18, 0.5);
  border-radius: 999px;
}

.login-card::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(255, 122, 0, 0.5), rgba(255, 122, 0, 0.2));
  border-radius: 999px;
  border: 2px solid rgba(12, 14, 18, 0.55);
}

.login-card::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(255, 122, 0, 0.7), rgba(255, 122, 0, 0.35));
}

@media (min-width: 1024px) {
  .login-shell {
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .login-shell::-webkit-scrollbar {
    width: 0;
  }

  .login-card {
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .login-card::-webkit-scrollbar {
    width: 0;
  }
}

.login-grid {
  gap: 1.5rem;
  padding: 1.5rem;
}

@media (min-width: 1024px) {
  .login-grid {
    align-items: center;
    gap: 2.25rem;
    padding: 2.25rem;
    grid-template-columns: 0.75fr 1.25fr;
  }

  .login-panel-wrap {
    display: flex;
    justify-content: flex-end;
    padding-left: 1.4rem;
  }

  .login-divider-line {
    left: 0.35rem;
  }
}

.login-logo-badge {
  width: 170px;
  height: 112px;
  background: transparent;
  box-shadow: none;
}

.login-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1.06);
}

.login-logo-text {
  letter-spacing: 0.01em;
}

.login-brand {
  align-self: flex-start;
  gap: 0;
}

.login-logo-row {
  align-items: center;
  margin-bottom: 0.5rem;
  margin-left: 0;
}

@media (min-width: 640px) {
  .login-logo-badge {
    width: 210px;
    height: 138px;
  }
}

@media (min-width: 1024px) {
  .login-logo-badge {
    width: 220px;
    height: 145px;
  }

  .login-logo-row {
    margin-bottom: 0.75rem;
    margin-left: 0;
  }
}

.login-hero-title {
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  margin: 0;
}

.login-hero-subtitle {
  color: var(--text-secondary);
  max-width: 28rem;
  line-height: 1.5;
  margin: 0.35rem 0 0;
}

.login-panel {
  border-radius: 24px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  backdrop-filter: blur(20px) saturate(1.15);
  -webkit-backdrop-filter: blur(20px) saturate(1.15);
  box-shadow: var(--shadow-panel), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  width: 100%;
  margin-bottom: 0.9rem;
  padding: 1.5rem 1.5rem 2.15rem;
  transition: width 0.28s ease, max-width 0.28s ease, min-width 0.28s ease;
}

@media (min-width: 640px) {
  .login-panel {
    margin-bottom: 1.15rem;
    padding: 1.75rem 1.75rem 2.35rem;
  }
}

@media (min-width: 1024px) {
  .login-panel {
    width: 620px;
    max-width: 620px;
    min-width: 620px;
    margin-left: -0.15rem;
    margin-bottom: 1.35rem;
    padding: 2.2rem 2.2rem 2.75rem;
  }

  .login-panel--compact {
    width: 480px;
    max-width: 480px;
    min-width: 480px;
  }
}

.login-panel-title {
  font-size: 1.15rem;
  letter-spacing: 0.01em;
}

.login-error {
  border-radius: 18px;
  border: 1px solid rgba(255, 95, 95, 0.45);
  background: rgba(58, 24, 24, 0.65);
}

.login-error-icon {
  background: rgba(255, 95, 95, 0.2);
  color: var(--danger);
}

.login-error-detail {
  color: var(--text-secondary);
}

.login-form {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.login-terms {
  border-radius: 18px;
  border: 1px solid var(--input-border);
  background: rgba(8, 10, 12, 0.35);
  padding: 0.75rem 0.9rem;
}

.login-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  border-radius: 6px;
}

.login-field-icon {
  color: var(--text-muted);
  pointer-events: none;
}

.login-input {
  border: 1px solid var(--input-border);
  border-radius: 18px;
  background: var(--input-bg);
  font-size: 0.9rem;
  color: var(--text-primary);
  padding: 0.7rem 2.5rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.login-input::placeholder {
  color: var(--text-faint);
}

.login-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.4);
  background: rgba(10, 12, 15, 0.7);
}

.login-input--normal {
  border-color: var(--input-border);
}

.login-input--error {
  border-color: rgba(255, 95, 95, 0.75);
}

.login-input--error:focus {
  border-color: rgba(255, 95, 95, 0.95);
  box-shadow: 0 0 0 1px rgba(255, 95, 95, 0.5);
}

.login-password-toggle {
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.login-password-toggle:hover {
  color: var(--text-primary);
}

.login-forgot {
  color: var(--text-secondary);
}

.login-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--text-primary);
}

.login-link-accent {
  color: var(--accent);
  font-weight: 600;
}

.login-link-accent:hover {
  color: var(--accent-strong);
}

.login-primary-button {
  border: none;
  border-radius: 999px;
  min-height: 48px;
  cursor: pointer;
  background: linear-gradient(135deg, #ff8b24 0%, #ff7a00 55%, #ff6900 100%);
  box-shadow: 0 18px 45px -22px rgba(255, 122, 0, 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.login-primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
  box-shadow: 0 20px 50px -24px rgba(255, 122, 0, 0.95);
}

.login-primary-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.login-divider {
  letter-spacing: 0.35em;
  color: var(--text-faint);
}

.login-divider span {
  background: rgba(255, 255, 255, 0.12);
}

.login-secondary-button {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  min-height: 48px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.login-secondary-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.login-signup {
  color: var(--text-muted);
}

.login-shell button,
.login-shell input,
.login-shell a {
  font-family: inherit;
}

.login-shell .animate-fade-up {
  animation: loginFadeUp 0.7s ease both;
}

.login-panel-fade-enter-active,
.login-panel-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.login-panel-fade-enter-from,
.login-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes loginFadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-shell .animate-fade-up {
    animation: none;
  }

  .login-panel-fade-enter-active,
  .login-panel-fade-leave-active {
    transition: none;
  }
}
</style>
