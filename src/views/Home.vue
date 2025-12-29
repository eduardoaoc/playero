<template>
  <div class="relative min-h-screen bg-[#0F0F12] text-white font-premium">
    <Header
      :logo-src="logoSrc"
      :logo-text="brandName"
      :cta-label="heroCtaLabel"
      :cta-href="heroCtaHref"
      :links="navLinks"
    />

    <HeroBanner
      :title="hero.title"
      :subtitle="hero.subtitle"
      :cta-label="heroCtaLabel"
      :cta-href="heroCtaHref"
      :background-url="hero.image"
    />

    <main class="relative">
      <section id="quadras" class="relative scroll-mt-24 py-16 sm:py-20">
        <div class="pointer-events-none absolute inset-0 opacity-70">
          <div class="absolute -top-40 right-0 h-72 w-72 rounded-full bg-[#FF7A00]/10 blur-[120px]"></div>
        </div>

        <div class="relative mx-auto max-w-6xl px-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 v-if="quadrasTitle" class="text-3xl font-semibold text-white sm:text-4xl">
                {{ quadrasTitle }}
              </h2>
              <p v-if="quadrasSubtitle" class="mt-3 max-w-2xl text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
                {{ quadrasSubtitle }}
              </p>
            </div>
            <a
              v-if="quadrasCtaLabel"
              :href="quadrasCtaHref"
              class="inline-flex items-center justify-center rounded-full border border-[#FF7A00] px-6 py-2 text-sm font-semibold text-[#FF7A00] transition hover:bg-[#FF7A00] hover:text-white"
            >
              {{ quadrasCtaLabel }}
            </a>
          </div>

          <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <QuadraCard
              v-for="quadra in quadraCards"
              :key="quadra.id"
              :name="quadra.name"
              :description="quadra.description"
              :image-url="quadra.imageUrl"
              :href="quadra.href"
              :badge-label="quadra.badgeLabel"
            />
          </div>
        </div>
      </section>

      <section id="experiencias" class="relative scroll-mt-24 py-16 sm:py-20">
        <div class="relative mx-auto max-w-6xl px-6">
          <div>
            <h2 v-if="experiencesTitle" class="text-3xl font-semibold text-white sm:text-4xl">
              {{ experiencesTitle }}
            </h2>
            <p v-if="experiencesSubtitle" class="mt-3 max-w-2xl text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
              {{ experiencesSubtitle }}
            </p>
          </div>

          <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ExperienceCard
              v-for="card in experiencias"
              :key="card.id"
              :title="card.title"
              :text="card.text"
              :image-url="card.image"
            />
          </div>
        </div>
      </section>

      <section id="servicos" class="relative scroll-mt-24 py-16 sm:py-20">
        <div class="relative mx-auto max-w-6xl px-6">
          <div>
            <h2 v-if="servicesTitle" class="text-3xl font-semibold text-white sm:text-4xl">
              {{ servicesTitle }}
            </h2>
            <p v-if="servicesSubtitle" class="mt-3 max-w-2xl text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
              {{ servicesSubtitle }}
            </p>
          </div>

          <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="service in servicos"
              :key="service.id"
              class="group overflow-hidden rounded-2xl bg-[#1A1A1F] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,0.9)]"
            >
              <div class="relative h-44 overflow-hidden">
                <img
                  v-if="service.image"
                  :src="service.image"
                  :alt="service.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div v-else class="h-full w-full bg-gradient-to-br from-[#1A1A1F] via-[#15151B] to-[#0F0F12]"></div>
              </div>
              <div class="p-6">
                <h3 v-if="service.title" class="text-lg font-semibold text-white">
                  {{ service.title }}
                </h3>
                <p v-if="service.text" class="mt-2 text-sm leading-relaxed text-[#B5B5B5]">
                  {{ service.text }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="localizacao" class="relative scroll-mt-24 py-16 sm:py-20">
        <div class="relative mx-auto max-w-6xl px-6">
          <div class="rounded-3xl border border-white/10 bg-[#1A1A1F] px-8 py-10 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] sm:px-10">
            <h2 v-if="location.title" class="text-3xl font-semibold text-white sm:text-4xl">
              {{ location.title }}
            </h2>
            <p v-if="location.address" class="mt-4 text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
              {{ location.address }}
            </p>
            <div class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.9)]">
              <div class="relative h-64 w-full sm:h-72">
                <iframe
                  class="absolute inset-0 h-full w-full"
                  :src="mapEmbedUrl"
                  title="Mapa da Playero"
                  loading="lazy"
                  allowfullscreen
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                v-if="location.primaryLabel"
                :href="location.primaryHref"
                class="inline-flex items-center justify-center rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF8F26]"
              >
                {{ location.primaryLabel }}
              </a>
              <a
                v-if="location.secondaryLabel"
                :href="location.secondaryHref"
                class="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
              >
                {{ location.secondaryLabel }}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer :logo-text="brandName" :tagline="footerTagline" :legal-text="footerLegal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Header from '../components/Header.vue';
import HeroBanner from '../components/HeroBanner.vue';
import QuadraCard from '../components/QuadraCard.vue';
import ExperienceCard from '../components/ExperienceCard.vue';
import Footer from '../components/Footer.vue';
import { homeService } from '../services/homeService';
import { quadrasService } from '../services/quadrasService';

const brandName = ref('Playero');
const logoSrc = ref('/images/logo-text.png');
const footerTagline = ref('');
const footerLegal = ref('');

const reservaBase = (import.meta.env.VITE_RESERVA_URL ?? '/reservar').trim();

const hero = ref({
  title: 'Reserva, joga, desfruta.',
  subtitle: 'Venha conhecer o novo conceito de lazer da cidade.',
  image: '/images/login-ved.png',
});

const quadras = ref([
  {
    id: 1,
    nome: 'Quadra 1',
    texto: 'Quero jogar na quadra da esquerda',
    image: '/images/quadra1.jpg',
  },
  {
    id: 2,
    nome: 'Quadra 2',
    texto: 'Quero jogar na quadra central',
    image: '/images/quadra2.jpg',
  },
  {
    id: 3,
    nome: 'Quadra 3',
    texto: 'Quero jogar na quadra da direita',
    image: '/images/quadra3.jpg',
  },
]);

const experiencias = ref([
  {
    id: 1,
    title: 'Eventos',
    text: 'Veja a programa\u00e7\u00e3o dos pr\u00f3ximos eventos',
    image: '/images/eventos.jpg',
  },
  {
    id: 2,
    title: 'Aulas de Beach Tennis',
    text: 'Lugar perfeito para fazer aquele churrasco.',
    image: '/images/aulas.jpg',
  },
  {
    id: 3,
    title: 'Gourmet Rest & Bar',
    text: 'Vistas espetaculares das quadras',
    image: '/images/gourmet.jpg',
  },
]);

const servicos = ref([
  {
    id: 1,
    title: '\u00c1rea Kids',
    text: 'Venha com a garotada desfrutar da \u00e1rea kids.',
    image: '/images/kids.jpg',
  },
  {
    id: 2,
    title: 'Espa\u00e7o para Festas',
    text: 'Lugar perfeito para fazer aquele churrasco.',
    image: '/images/festas.jpg',
  },
  {
    id: 3,
    title: '\u00c1rea VIP',
    text: 'Vistas espetaculares das quadras.',
    image: '/images/vip.jpg',
  },
]);

const heroCtaLabel = 'Reservar quadra';
const heroCtaHref = reservaBase;

const quadrasTitle = ref('Reserve seu hor\u00e1rio');
const quadrasSubtitle = ref('');
const quadrasCtaLabel = ref('');
const quadrasCtaHref = ref(reservaBase);

const experiencesTitle = ref('Experi\u00eancias');
const experiencesSubtitle = ref('');

const servicesTitle = ref('Servi\u00e7os & Conviv\u00eancia');
const servicesSubtitle = ref('');

const location = ref({
  title: 'Localiza\u00e7\u00e3o',
  address: 'Rua General Os\u00f3rio, 103 - Centro - Sapiranga',
  primaryLabel: 'Como chegar',
  primaryHref:
    'https://www.google.com/maps/dir/?api=1&destination=Rua%20General%20Osorio,%20103%20-%20Centro%20-%20Sapiranga',
  secondaryLabel: 'Abrir no Google Maps',
  secondaryHref:
    'https://www.google.com/maps/search/?api=1&query=Rua%20General%20Osorio,%20103%20-%20Centro%20-%20Sapiranga',
});

const mapEmbedUrl = ref(
  'https://www.google.com/maps?q=Rua%20General%20Osorio,%20103%20-%20Centro%20-%20Sapiranga&output=embed'
);

const applySectionText = (section, fallback) => {
  if (!section || typeof section !== 'object') {
    return fallback;
  }
  return {
    title: section.title ?? fallback.title,
    subtitle: section.subtitle ?? fallback.subtitle,
    ctaLabel: section.ctaLabel ?? section.cta_label ?? fallback.ctaLabel,
    ctaHref: section.ctaHref ?? section.cta_href ?? fallback.ctaHref,
  };
};

const loadHomeContent = async () => {
  try {
    const payload = await homeService.getHome();
    const content = payload?.data ?? payload;
    if (!content || typeof content !== 'object') {
      return;
    }

    if (content.brand?.name) {
      brandName.value = content.brand.name;
    }
    if (content.brand?.logo) {
      logoSrc.value = content.brand.logo;
    }

    if (content.hero && typeof content.hero === 'object') {
      hero.value = {
        title: content.hero.title ?? hero.value.title,
        subtitle: content.hero.subtitle ?? hero.value.subtitle,
        image: content.hero.image ?? content.hero.image_url ?? hero.value.image,
      };
    }

    if (Array.isArray(content.experiencias)) {
      experiencias.value = content.experiencias;
    }

    if (Array.isArray(content.servicos)) {
      servicos.value = content.servicos;
    }

    if (content.localizacao && typeof content.localizacao === 'object') {
      location.value = { ...location.value, ...content.localizacao };
    }

    if (content.mapEmbedUrl) {
      mapEmbedUrl.value = content.mapEmbedUrl;
    }

    if (content.quadras && typeof content.quadras === 'object') {
      const quadrasSection = applySectionText(content.quadras, {
        title: quadrasTitle.value,
        subtitle: quadrasSubtitle.value,
        ctaLabel: quadrasCtaLabel.value,
        ctaHref: quadrasCtaHref.value,
      });
      quadrasTitle.value = quadrasSection.title;
      quadrasSubtitle.value = quadrasSection.subtitle;
      quadrasCtaLabel.value = quadrasSection.ctaLabel;
      quadrasCtaHref.value = quadrasSection.ctaHref;
    }

    if (content.experiencias_section && typeof content.experiencias_section === 'object') {
      const experiencesSection = applySectionText(content.experiencias_section, {
        title: experiencesTitle.value,
        subtitle: experiencesSubtitle.value,
      });
      experiencesTitle.value = experiencesSection.title;
      experiencesSubtitle.value = experiencesSection.subtitle;
    }

    if (content.servicos_section && typeof content.servicos_section === 'object') {
      const servicesSection = applySectionText(content.servicos_section, {
        title: servicesTitle.value,
        subtitle: servicesSubtitle.value,
      });
      servicesTitle.value = servicesSection.title;
      servicesSubtitle.value = servicesSection.subtitle;
    }
  } catch {
    // Keep fallback content on failure.
  }
};

const loadQuadras = async () => {
  try {
    quadras.value = await quadrasService.listQuadras();
  } catch {
    // Keep fallback content on failure.
  }
};

onMounted(() => {
  loadHomeContent();
  loadQuadras();
});

const quadraCards = computed(() =>
  quadras.value.map((quadra) => ({
    id: quadra.id,
    name: quadra.name ?? quadra.nome,
    description: quadra.description ?? quadra.texto,
    imageUrl: quadra.imageUrl ?? quadra.image,
    href: `${reservaBase}?quadra=${quadra.id}`,
    badgeLabel: quadra.name ?? quadra.nome,
  }))
);

const navLinks = computed(() => [
  { label: quadrasTitle.value, href: '#quadras' },
  { label: experiencesTitle.value, href: '#experiencias' },
  { label: servicesTitle.value, href: '#servicos' },
  { label: location.value.title, href: '#localizacao' },
]);
</script>

<style scoped></style>
