<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Sun,
  Moon,
  ArrowRight,
  ArrowLeftRight,
  ClipboardList,
  Check,
  ShieldCheck,
} from 'lucide-vue-next'
import { initHeroCanvas } from './webgl/heroCanvas'
import { initSpecsCanvas } from './webgl/specsCanvas'
import {
  businessInfo,
  HERO_FOCUSES,
  SHOWCASE_STAGES,
  BENTO_IMAGES,
  COMPARISON_PROJECTS,
  PROPERTY_TYPES,
  SERVICE_OPTIONS,
} from './data/siteData'
import QuoteDrawer from './components/QuoteDrawer.vue'

// Starts in Bottle Green (#0F372B) + Bone (#EFE7DA) + Vermilion (#E8392B) Editorial Mode
const theme = ref('dark')
watch(
  theme,
  (val) => {
    document.documentElement.setAttribute('data-theme', val)
  },
  { immediate: true }
)

const activeFocus = ref('hedges')
const heroCanvasRef = ref(null)
const specsCanvasRef = ref(null)
const heroStageRef = ref(null)
const tiltWrapRef = ref(null)

// 4-Stage Showcase
const activeStage = ref(0)
const captionBlur = ref(false)
let stageTimer = null

const selectStage = (idx) => {
  captionBlur.value = true
  clearTimeout(stageTimer)
  stageTimer = setTimeout(() => {
    activeStage.value = idx
    captionBlur.value = false
  }, 120)
}

// Before / After Slider
const activeProjectIdx = ref(0)
const splitPct = ref(50)
const splitAnimate = ref(false)
const isDragging = ref(false)

const currentProject = computed(() => COMPARISON_PROJECTS[activeProjectIdx.value])

const updateSplit = (pct, animate) => {
  splitAnimate.value = animate
  splitPct.value = Math.max(0, Math.min(100, pct))
}

const onCompPointerDown = (e) => {
  isDragging.value = true
  e.currentTarget.setPointerCapture(e.pointerId)
  const rect = e.currentTarget.getBoundingClientRect()
  updateSplit(((e.clientX - rect.left) / rect.width) * 100, false)
}

const onCompPointerMove = (e) => {
  if (!isDragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  updateSplit(((e.clientX - rect.left) / rect.width) * 100, false)
}

const onCompPointerUp = () => {
  isDragging.value = false
}

// Quote Configurator
const selectedProperty = ref('Residential')
const selectedServices = ref(['Lawn Mowing', 'Hedge Trimming & Pruning'])
const drawerOpen = ref(false)

const toggleService = (name) => {
  if (selectedServices.value.includes(name)) {
    selectedServices.value = selectedServices.value.filter((s) => s !== name)
  } else {
    selectedServices.value.push(name)
  }
}

const removeService = (name) => {
  selectedServices.value = selectedServices.value.filter((s) => s !== name)
}

const imgFailed = ref({})
const markFailed = (key) => {
  imgFailed.value[key] = true
}

let cleanupHeroGl = () => {}
let cleanupSpecsGl = () => {}
let rafTiltId = 0

onMounted(() => {
  cleanupHeroGl = initHeroCanvas(heroCanvasRef.value)
  cleanupSpecsGl = initSpecsCanvas(specsCanvasRef.value)

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stage = heroStageRef.value
  let targetX = 0
  let targetY = 0
  let curX = 0
  let curY = 0

  const onMove = (e) => {
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    targetY = nx * 8
    targetX = -ny * 6
  }
  const onLeave = () => {
    targetX = 0
    targetY = 0
  }

  if (stage && tiltWrapRef.value && !prefersReduced) {
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', onLeave)
    const tick = () => {
      curX += (targetX - curX) * 0.08
      curY += (targetY - curY) * 0.08
      if (tiltWrapRef.value) {
        tiltWrapRef.value.style.transform = `rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`
      }
      rafTiltId = requestAnimationFrame(tick)
    }
    rafTiltId = requestAnimationFrame(tick)
  }

  onUnmounted(() => {
    cancelAnimationFrame(rafTiltId)
    stage?.removeEventListener('pointermove', onMove)
    stage?.removeEventListener('pointerleave', onLeave)
  })
})

onUnmounted(() => {
  clearTimeout(stageTimer)
  cleanupHeroGl()
  cleanupSpecsGl()
})
</script>

<template>
  <div class="grain-overlay" aria-hidden="true" />

<!-- Fixed Top Header: Green/White/Yellow Angled Trust Bar + Big Logo Navbar -->
  <header class="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-lg transition-colors" style="border-color: rgba(255, 255, 255, 0.2)">
    <!-- Top Angled Split Bar (Matched to Site Green, White & Golden Yellow Palette) -->
    <div
      class="w-full border-b"
      style="
        border-color: rgba(255, 255, 255, 0.16);
        background: linear-gradient(
          108deg,
          #1e5736 0%,
          #1e5736 44%,
          rgba(255, 255, 255, 0.94) 50.5%,
          #f2c12e 56%,
          #f2c12e 100%
        );
      "
    >
      <div class="font-mono-spec mx-auto grid h-9 max-w-[1400px] grid-cols-2 items-center px-5 text-[11px] font-medium uppercase tracking-[0.16em] sm:px-10">
        <div class="flex items-center justify-start gap-1.5 text-white">
          <span style="color: #f2c12e">&#9733;</span>
          <span>4.9 Customer Rating</span>
        </div>
        <div class="flex items-center justify-end text-[#0f3820]">
          <span>Trusted By 1000+ Clients</span>
        </div>
      </div>
    </div>

    <!-- Main Logo & Navigation Bar -->
    <div class="h-20 text-white" style="background: var(--glass-bg)">
      <div class="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 sm:px-10">
        <a href="#hero" class="inline-flex items-center gap-3.5">
          <div class="flex items-center justify-center rounded-xl bg-white px-2.5 py-1 shadow-md">
            <img
              v-if="!imgFailed['logo']"
              :src="businessInfo.logo"
              alt="Green Blade Mowing Solutions"
              class="h-12 w-auto object-contain sm:h-14"
              @error="markFailed('logo')"
            />
          </div>
          <span class="font-editorial hidden text-2xl tracking-wide text-white sm:inline sm:text-3xl">
            Green Blade Mowing Solutions
          </span>
        </a>

        <nav class="flex items-center gap-5 text-white sm:gap-7">
          <a
            href="#showcase"
            class="font-mono-spec hidden text-[11px] uppercase tracking-[0.18em] text-white/90 transition hover:text-white md:inline"
          >
            Services
          </a>
          <a
            href="#thermal"
            class="font-mono-spec hidden text-[11px] uppercase tracking-[0.18em] text-white/90 transition hover:text-white md:inline"
          >
            Projects
          </a>
          <a
            href="#craft"
            class="font-mono-spec hidden text-[11px] uppercase tracking-[0.18em] text-white/90 transition hover:text-white md:inline"
          >
            About
          </a>
          <a
            href="#order"
            class="font-mono-spec hidden items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-white/10 sm:inline-flex"
          >
            <span>Get a Quote</span>
            <ArrowRight class="h-3 w-3" />
          </a>

          <!-- Light/Dark Green Switch -->
          <button
            type="button"
            @click="theme = theme === 'dark' ? 'light' : 'dark'"
            aria-label="Toggle green theme"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 text-white transition active:scale-95"
          >
            <Sun v-if="theme === 'dark'" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </button>

          <!-- Quote Drawer Trigger -->
          <button
            type="button"
            @click="drawerOpen = true"
            aria-label="Open quote request"
            class="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/35 text-white transition active:scale-95"
          >
            <ClipboardList class="h-4 w-4" />
            <span
              class="font-mono-spec absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
              style="background: var(--accent); color: var(--accent-text)"
            >
              {{ selectedServices.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>
  </header>

  <main>
    <!-- SECTION 1: Editorial Poster Hero -->
    <section
      id="hero"
      ref="heroStageRef"
      class="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden pb-10 pt-36"
    >
      <canvas ref="heroCanvasRef" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

      <!-- Top Micro Metadata Row -->
      <div class="relative z-20 mx-auto flex w-full max-w-[1400px] items-start justify-between px-5 sm:px-10">
        <div class="font-mono-spec text-[11px] uppercase leading-relaxed tracking-[0.18em]" style="color: var(--text-secondary)">
          <p>Cranbourne Base</p>
          <p>Southeast Melbourne</p>
        </div>
        <div class="font-mono-spec text-right text-[11px] uppercase leading-relaxed tracking-[0.18em]" style="color: var(--text-secondary)">
          <p>Residential &amp;</p>
          <p>Commercial Care</p>
        </div>
      </div>

      <!-- Center Poster Composition (Balanced Display Type + Tilting Garden Photo) -->
      <div class="relative z-10 mx-auto my-auto flex w-full max-w-[1400px] flex-col items-center px-5 py-6 sm:px-10">
        <!-- Upper Editorial Line -->
        <h1 class="font-editorial pointer-events-none relative z-20 self-start text-[clamp(2.5rem,6vw,5.2rem)] leading-[0.92] tracking-[-0.02em]">
          <span class="italic">TRANSFORMING</span>
          <span class="ml-3 italic sm:ml-5" style="color: var(--accent)">LAWNS</span>
        </h1>

        <!-- Center 3D-Tilt Garden Stage -->
        <div
          class="relative z-10 my-3 w-full max-w-[540px] sm:my-4 lg:max-w-[620px]"
          style="perspective: 1200px"
        >
          <div
            ref="tiltWrapRef"
            class="overflow-hidden rounded-[12px] border shadow-2xl transition-transform duration-75 will-change-transform"
            style="border-color: var(--border-strong); background: var(--surface)"
          >
            <img
              v-if="!imgFailed[activeFocus]"
              :src="HERO_FOCUSES[activeFocus].img"
              :alt="HERO_FOCUSES[activeFocus].label"
              class="h-[290px] w-full object-cover sm:h-[380px]"
              @error="markFailed(activeFocus)"
            />
            <div
              v-else
              class="flex h-[290px] items-center justify-center bg-[#0b2b21] p-8 text-center sm:h-[380px]"
            >
              <p class="font-editorial text-3xl italic">{{ HERO_FOCUSES[activeFocus].headline }}</p>
            </div>
          </div>
        </div>

        <!-- Lower Editorial Line -->
        <p class="font-editorial pointer-events-none relative z-20 self-end text-right text-[clamp(2.4rem,5.5vw,4.8rem)] italic leading-[0.92] tracking-[-0.02em]">
          <span class="ml-3 italic sm:ml-5" style="color: var(--accent)">WITH</span>
          PRECISION
        </p>
      </div>

      <!-- Bottom Action & Swatch Bar -->
      <div class="relative z-20 mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-end sm:px-10">
        <!-- Left Vermilion / Editorial CTA -->
        <div class="flex flex-wrap items-center gap-4">
          <button
            type="button"
            @click="drawerOpen = true"
            class="inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-medium tracking-wide shadow-lg transition active:scale-97"
            style="background: var(--accent); color: var(--accent-text)"
          >
            <span>Get Free Quote</span>
            <ArrowRight class="h-4 w-4" />
          </button>
          <a
            :href="businessInfo.phoneHref"
            class="font-mono-spec inline-flex items-center gap-2 rounded-full border px-5 py-3.5 text-xs uppercase tracking-[0.14em] transition hover:opacity-80"
            style="border-color: var(--border-strong)"
          >
            Call {{ businessInfo.phone }}
          </a>
        </div>

        <!-- Center Service Focus Pills -->
        <div
          class="inline-flex flex-wrap gap-1.5 rounded-full border p-1.5 backdrop-blur-md"
          style="background: var(--glass-bg); border-color: var(--border)"
        >
          <button
            v-for="(meta, key) in HERO_FOCUSES"
            :key="key"
            type="button"
            @click="activeFocus = key"
            class="rounded-full px-3.5 py-1.5 text-xs font-medium transition"
            :style="
              activeFocus === key
                ? 'background: var(--accent); color: var(--accent-text)'
                : 'color: var(--text-secondary)'
            "
          >
            {{ meta.label }}
          </button>
        </div>

        <!-- Right Corner Metadata -->
        <div class="font-mono-spec hidden text-right text-[11px] uppercase leading-relaxed tracking-[0.18em] lg:block" style="color: var(--text-secondary)">
          <p>Free Itemised</p>
          <p>Estimates</p>
        </div>
      </div>
    </section>

    <!-- SECTION 2: 4-Stage Full-Bleed Architectural Garden Showcase -->
    <section id="showcase" class="relative h-[88dvh] min-h-[560px] w-full overflow-hidden" style="background: var(--surface)">
      <div class="relative h-full w-full">
        <figure
          v-for="(stage, idx) in SHOWCASE_STAGES"
          :key="stage.title"
          class="absolute inset-0 h-full w-full transition-all duration-700"
          :style="{
            clipPath: idx <= activeStage ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)',
            transitionTimingFunction: 'var(--ease-out)',
          }"
        >
          <img
            v-if="!imgFailed['stage-' + idx]"
            :src="stage.src"
            :alt="stage.alt"
            class="h-full w-full object-cover"
            @error="markFailed('stage-' + idx)"
          />
          <div v-else class="h-full w-full bg-[#0b2b21]" />
        </figure>
      </div>

      <div
        class="pointer-events-none absolute inset-0 z-10"
        style="background: linear-gradient(to top, rgba(8, 28, 22, 0.92) 0%, rgba(8, 28, 22, 0.35) 50%, transparent 80%)"
      />

      <div class="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-5 pb-10 sm:flex-row sm:items-end sm:px-10 sm:pb-14">
        <div class="showcase-caption max-w-[700px] text-[#efe7da]" :class="{ 'is-blurring': captionBlur }">
          <span class="font-mono-spec text-xs uppercase tracking-[0.2em]" style="color: var(--accent)">
            Service 0{{ activeStage + 1 }} / 0{{ SHOWCASE_STAGES.length }}
          </span>
          <h2 class="font-editorial mt-2 text-[clamp(2.8rem,6vw,5.4rem)] leading-[0.95]">
            {{ SHOWCASE_STAGES[activeStage].title }}
          </h2>
          <p class="mt-3 text-lg text-[#efe7da]/90 sm:text-xl">
            {{ SHOWCASE_STAGES[activeStage].sub }}
          </p>
          <p class="mt-2 max-w-xl text-sm text-[#efe7da]/75">
            {{ SHOWCASE_STAGES[activeStage].detail }}
          </p>
        </div>

        <div class="inline-flex items-center gap-2 rounded-full border border-[#efe7da]/25 bg-[#0b2b21]/75 px-3.5 py-2.5 backdrop-blur-lg">
          <button
            v-for="(stage, i) in SHOWCASE_STAGES"
            :key="stage.title"
            type="button"
            :aria-label="`Show ${stage.title}`"
            @click="selectStage(i)"
            class="h-1.5 rounded-full transition-all duration-300"
            :style="{
              width: activeStage === i ? '44px' : '24px',
              background: activeStage === i ? 'var(--accent)' : 'rgba(239, 231, 218, 0.35)',
            }"
          />
        </div>
      </div>
    </section>

    <!-- SECTION 3: Interactive Before & After Comparison Slider -->
    <section id="thermal" class="py-24 sm:py-32">
      <div class="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-10 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <div
            class="relative aspect-[16/10] cursor-ew-resize select-none overflow-hidden rounded-[12px] border"
            style="border-color: var(--border); touch-action: pan-y"
            @pointerdown="onCompPointerDown"
            @pointermove="onCompPointerMove"
            @pointerup="onCompPointerUp"
            @pointercancel="onCompPointerUp"
          >
            <!-- AFTER Layer (Right Side / Full Background) -->
            <div class="absolute inset-0">
              <img
                v-if="!imgFailed[currentProject.id + '-after']"
                :src="currentProject.afterImg"
                :alt="`${currentProject.title} After`"
                class="h-full w-full object-cover"
                @error="markFailed(currentProject.id + '-after')"
              />
              <div
                v-else
                class="flex h-full w-full flex-col items-center justify-center bg-[#144435] p-6 text-center text-[#efe7da]"
              >
                <span class="font-mono-spec rounded-full px-3 py-1 text-xs uppercase" style="background: var(--accent)">After</span>
                <p class="font-editorial mt-2 text-3xl">{{ currentProject.title }}</p>
                <p class="font-mono-spec mt-1 text-xs opacity-70">Drop photo: public{{ currentProject.afterImg }}</p>
              </div>
            </div>

            <!-- BEFORE Layer (Left Side / Clipped) -->
            <div
              class="absolute inset-0 overflow-hidden"
              :style="{
                clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
                transition: splitAnimate ? 'clip-path 380ms var(--ease-out)' : 'none',
              }"
            >
              <img
                v-if="!imgFailed[currentProject.id + '-before']"
                :src="currentProject.beforeImg"
                :alt="`${currentProject.title} Before`"
                class="h-full w-full object-cover"
                @error="markFailed(currentProject.id + '-before')"
              />
              <div
                v-else
                class="flex h-full w-full flex-col items-center justify-center bg-[#23201b] p-6 text-center text-[#efe7da]"
              >
                <span class="font-mono-spec rounded-full border border-white/30 px-3 py-1 text-xs uppercase">Before</span>
                <p class="font-editorial mt-2 text-3xl">{{ currentProject.title }}</p>
                <p class="font-mono-spec mt-1 text-xs opacity-70">Drop photo: public{{ currentProject.beforeImg }}</p>
              </div>
            </div>

            <!-- Corner Labels -->
            <span class="font-mono-spec pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-[#0b2b21]/80 px-3 py-1 text-[11px] uppercase tracking-wider text-[#efe7da] backdrop-blur-xs">
              Before
            </span>
            <span
              class="font-mono-spec pointer-events-none absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black"
              style="background: var(--accent)"
            >
              After
            </span>

            <!-- Drag Handle -->
            <div
              class="pointer-events-none absolute inset-y-0 z-10 flex w-11 -translate-x-1/2 items-center justify-center"
              :style="{
                left: `clamp(22px, ${splitPct}%, calc(100% - 22px))`,
                transition: splitAnimate ? 'left 380ms var(--ease-out)' : 'none',
              }"
            >
              <div class="absolute inset-y-0 w-0.5 bg-[#efe7da] shadow-md" />
              <div
                class="relative z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-xl"
                style="background: var(--accent); color: var(--accent-text)"
              >
                <ArrowLeftRight class="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="mb-5 flex flex-wrap gap-2">
            <button
              v-for="(proj, idx) in COMPARISON_PROJECTS"
              :key="proj.id"
              type="button"
              @click="activeProjectIdx = idx"
              class="font-mono-spec rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-wider transition"
              :style="
                activeProjectIdx === idx
                  ? 'background: var(--accent); border-color: var(--accent); color: var(--accent-text)'
                  : 'border-color: var(--border); color: var(--text-secondary)'
              "
            >
              {{ proj.label }}
            </button>
          </div>

          <h2 class="font-editorial text-[clamp(2.8rem,5vw,4.5rem)] leading-[0.95]">
            Before &amp; <span class="italic">after</span> transformations.
          </h2>
          <p class="mt-4 text-base leading-relaxed sm:text-lg" style="color: var(--text-secondary)">
            {{ currentProject.summary }}
          </p>

          <div
            class="mt-7 inline-flex rounded-full border p-1"
            style="background: var(--surface); border-color: var(--border)"
          >
            <button
              type="button"
              @click="updateSplit(100, true)"
              class="rounded-full px-5 py-2.5 text-sm font-medium transition"
              :style="splitPct >= 98 ? 'background: var(--accent); color: var(--accent-text)' : 'color: var(--text-secondary)'"
            >
              Before
            </button>
            <button
              type="button"
              @click="updateSplit(50, true)"
              class="rounded-full px-5 py-2.5 text-sm font-medium transition"
              :style="splitPct > 2 && splitPct < 98 ? 'background: var(--accent); color: var(--accent-text)' : 'color: var(--text-secondary)'"
            >
              50 / 50
            </button>
            <button
              type="button"
              @click="updateSplit(0, true)"
              class="rounded-full px-5 py-2.5 text-sm font-medium transition"
              :style="splitPct <= 2 ? 'background: var(--accent); color: var(--accent-text)' : 'color: var(--text-secondary)'"
            >
              After
            </button>
          </div>

          <div class="mt-8 flex gap-10 border-t pt-6" style="border-color: var(--border)">
            <div>
              <p class="font-mono-spec text-3xl font-bold tracking-tight">30 km</p>
              <p class="text-sm" style="color: var(--text-secondary)">Southeast Melbourne</p>
            </div>
            <div>
              <p class="font-mono-spec text-3xl font-bold tracking-tight">100%</p>
              <p class="text-sm" style="color: var(--text-secondary)">Green waste cleared</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: Asymmetric 3-Tile Editorial Bento -->
    <section id="craft" class="py-20 sm:py-28">
      <div class="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 class="font-editorial text-[clamp(2.8rem,5vw,4.5rem)] leading-[0.95]">
            Crafted for <span class="italic">every</span> yard.
          </h2>
          <p class="max-w-md text-base" style="color: var(--text-secondary)">
            Your dedicated partner for residential &amp; commercial lawn care throughout Southeast Melbourne.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[290px_290px]">
          <article
            class="group relative flex flex-col justify-end overflow-hidden rounded-[12px] border lg:col-span-7 lg:row-span-2"
            style="background: var(--surface); border-color: var(--border); min-height: 360px"
          >
            <img
              v-if="!imgFailed['bento-pruning']"
              :src="BENTO_IMAGES.pruning"
              alt="Garden tree pruning and topiary shaping"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              @error="markFailed('bento-pruning')"
            />
            <div
              class="relative z-10 p-7 text-[#efe7da]"
              style="background: linear-gradient(to top, rgba(8, 28, 22, 0.94) 0%, rgba(8, 28, 22, 0.5) 65%, transparent 100%)"
            >
              <div class="mb-3 flex flex-wrap gap-2">
                <span class="font-mono-spec inline-flex items-center gap-1.5 rounded-full border border-[#efe7da]/30 bg-black/30 px-3 py-1 text-xs">
                  <ShieldCheck class="h-3.5 w-3.5" style="color: var(--accent)" /> Licensed &amp; Insured
                </span>
                <span class="font-mono-spec rounded-full border border-[#efe7da]/30 bg-black/30 px-3 py-1 text-xs">
                  Locally Owned
                </span>
              </div>
              <h3 class="font-editorial text-3xl sm:text-4xl">Garden Tree Pruning &amp; Care</h3>
              <p class="mt-2 max-w-xl text-sm text-[#efe7da]/85 sm:text-base">
                Dead or dying branches risk property damage and drain nutrients. We use specialised training and compact-access equipment for residential trees, fruit trees, and full garden maintenance.
              </p>
            </div>
          </article>

          <article
            class="group relative flex flex-col justify-end overflow-hidden rounded-[12px] border lg:col-span-5"
            style="background: var(--surface); border-color: var(--border); min-height: 260px"
          >
            <img
              v-if="!imgFailed['bento-gutters']"
              :src="BENTO_IMAGES.edgingAndGutters"
              alt="Precision edging and yard care"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              @error="markFailed('bento-gutters')"
            />
            <div
              class="relative z-10 p-7 text-[#efe7da]"
              style="background: linear-gradient(to top, rgba(8, 28, 22, 0.94) 0%, rgba(8, 28, 22, 0.45) 65%, transparent 100%)"
            >
              <h3 class="font-editorial text-3xl">Garden Cleaning &amp; Edging</h3>  
              <p class="mt-1.5 text-sm text-[#efe7da]/85">
                Crisp lawn borders plus hand-cleared gutters with roofline reports—tailored for eucalypt canopies that shed year-round.
              </p>
            </div>
          </article>

          <article
            class="relative flex flex-col justify-end overflow-hidden rounded-[12px] border lg:col-span-5"
            style="background: var(--surface-elevated); border-color: var(--border); min-height: 260px"
          >
            <canvas ref="specsCanvasRef" class="absolute inset-0 h-full w-full" aria-hidden="true" />
            <div class="relative z-10 flex items-end justify-between gap-4 p-7">
              <div>
                <h3 class="font-editorial text-3xl">Cranbourne Base</h3>
                <p class="mt-1 text-sm" style="color: var(--text-secondary)">
                  Residential &amp; Commercial
                </p>
              </div>
              <span
                class="font-mono-spec rounded-full border px-3.5 py-1.5 text-xs backdrop-blur-md"
                style="background: var(--glass-bg); border-color: var(--border-strong)"
              >
                Outer SE Vic
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- SECTION 4.5: Green Blade Signature Flyer Showcase -->
    <section class="py-16 sm:py-24">
      <div class="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div
          class="overflow-hidden rounded-[20px] border bg-white text-[#143d25] shadow-2xl"
          style="border-color: var(--border)"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12">
            <!-- Left Column: White Logo Header + Sweeping Green Wave -->
            <div class="flex flex-col justify-between lg:col-span-6">
              <!-- Top White Zone: Logo + "Reliable & expert" right beside it -->
              <div class="flex flex-wrap items-center justify-start gap-5 bg-white px-7 py-8 sm:gap-7 sm:px-10">
                <img
                  v-if="!imgFailed['logo']"
                  :src="businessInfo.logo"
                  alt="Green Blade Mowing"
                  class="h-20 w-auto object-contain sm:h-24"
                  @error="markFailed('logo')"
                />
                <p
                  class="text-3xl font-bold text-[#1e5736] sm:text-4xl lg:-rotate-3"
                  style="font-family: 'Caveat', cursive"
                >
                  Reliable &amp; expert
                </p>
              </div>

              <!-- Lower Sweeping Green Wave: Services + Contact -->
              <div class="relative flex-1 rounded-tr-[110px] bg-[#1e5736] px-7 py-10 text-white sm:rounded-tr-[160px] sm:px-12 sm:py-12">
                <p class="font-mono-spec text-xs font-medium uppercase tracking-[0.22em]" style="color: #f2c12e">
                  Services :
                </p>

                <ul class="mt-4 space-y-2.5 text-xl font-semibold sm:text-2xl">
                  <li v-for="opt in SERVICE_OPTIONS" :key="opt.id">
                    <a
                      href="#order"
                      @click="!selectedServices.includes(opt.name) && toggleService(opt.name)"
                      class="inline-flex items-center gap-2.5 transition hover:translate-x-1 hover:text-[#f2c12e]"
                    >
                      <span class="h-2 w-2 rounded-full bg-[#f2c12e]" />
                      <span>{{ opt.name }}</span>
                    </a>
                  </li>
                </ul>

                <div class="mt-9 border-t border-white/20 pt-6">
                  <a
                    :href="businessInfo.phoneHref"
                    class="block text-2xl font-bold tracking-tight text-white transition hover:text-[#f2c12e] sm:text-3xl"
                  >
                    contact us @ {{ businessInfo.phone }}
                  </a>
                  <a
                    :href="`mailto:${businessInfo.email}`"
                    class="font-mono-spec mt-1.5 inline-block text-sm text-white/85 transition hover:text-[#f2c12e]"
                  >
                    {{ businessInfo.email }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Right Column: Curved Garden Photo + "Transforming lawns with precision" -->
            <div class="relative min-h-[340px] bg-white lg:col-span-6 lg:min-h-[520px]">
              <div class="relative h-full w-full overflow-hidden lg:rounded-bl-[160px]">
                <img
                  v-if="!imgFailed['flyer-garden']"
                  src="/images/index-2-slider-31.jpg"
                  alt="Green Blade Mowing landscaped garden"
                  class="h-full w-full object-cover"
                  @error="markFailed('flyer-garden')"
                />
                <div
                  class="absolute inset-0"
                  style="background: linear-gradient(to top, rgba(20, 61, 37, 0.85) 0%, rgba(20, 61, 37, 0.2) 55%, transparent 100%)"
                />
                <div class="absolute bottom-8 right-8 left-8 text-right text-white sm:bottom-12 sm:right-12">
                  <p class="font-editorial text-3xl leading-none tracking-tight sm:text-5xl">
                    Transforming lawns
                    <br />
                    <span style="color: #f2c12e">with precision</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- SECTION 5: Interactive Quote Configurator -->
    <section id="order" class="py-24 sm:py-32">
      <div class="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-10 lg:grid-cols-12">
        <div
          class="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[12px] border p-8 lg:col-span-6"
          style="background: var(--surface); border-color: var(--border)"
        >
          <div class="relative z-10 flex items-center justify-between">
            <span class="font-mono-spec text-xs uppercase tracking-widest" style="color: var(--text-secondary)">
              {{ selectedProperty }} Property
            </span>
            <span
              class="font-mono-spec rounded-full px-3 py-1 text-xs font-medium"
              style="background: var(--accent); color: var(--accent-text)"
            >
              Free Estimate
            </span>
          </div>

          <div class="relative z-10 my-auto py-8">
            <p class="font-mono-spec text-xs uppercase tracking-widest" style="color: var(--accent)">
              Your Custom Yard Plan
            </p>
            <h3 class="font-editorial mt-2 text-4xl sm:text-5xl">
              {{ selectedServices.length > 0 ? `${selectedServices.length} Services Selected` : 'Select Services' }}
            </h3>
            <ul class="mt-6 space-y-3">
              <li
                v-for="srv in selectedServices"
                :key="srv"
                class="flex items-center gap-3 text-sm font-medium"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full"
                  style="background: var(--accent); color: var(--accent-text)"
                >
                  <Check class="h-3 w-3" />
                </span>
                <span>{{ srv }}</span>
              </li>
            </ul>
          </div>

          <div class="font-mono-spec relative z-10 border-t pt-4 text-[11px] uppercase tracking-wider" style="border-color: var(--border); color: var(--text-secondary)">
            Itemised quote confirmed before work starts &bull; {{ businessInfo.website }}
          </div>
        </div>

        <div class="lg:col-span-6">
          <h2 class="font-editorial text-[clamp(2.8rem,5vw,4.5rem)] leading-[0.95]">
            Get your <span class="italic">price</span> instantly.
          </h2>
          <p class="font-mono-spec mt-3 text-base" style="color: var(--text-secondary)">
            Free itemised estimate &bull; {{ businessInfo.phone }}
          </p>

          <div class="mt-7">
            <span class="mb-3 block text-sm font-medium" style="color: var(--text-secondary)">
              Property Type
            </span>
            <div class="flex flex-wrap gap-2.5">
              <button
                v-for="prop in PROPERTY_TYPES"
                :key="prop"
                type="button"
                @click="selectedProperty = prop"
                class="rounded-full border px-5 py-2.5 text-sm font-medium transition active:scale-97"
                :style="
                  selectedProperty === prop
                    ? 'border-color: var(--accent); background: var(--accent); color: var(--accent-text)'
                    : 'border-color: var(--border); background: var(--surface)'
                "
              >
                {{ prop }}
              </button>
            </div>
          </div>

          <div class="mt-7">
            <span class="mb-3 block text-sm font-medium" style="color: var(--text-secondary)">
              Select Services Needed
            </span>
            <div class="flex flex-wrap gap-2.5">
              <button
                v-for="opt in SERVICE_OPTIONS"
                :key="opt.id"
                type="button"
                @click="toggleService(opt.name)"
                class="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition active:scale-97"
                :style="
                  selectedServices.includes(opt.name)
                    ? 'border-color: var(--accent); background: var(--surface-elevated)'
                    : 'border-color: var(--border); background: var(--surface)'
                "
              >
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  :style="{
                    background: selectedServices.includes(opt.name) ? 'var(--accent)' : 'var(--border-strong)',
                  }"
                />
                <span>{{ opt.name }}</span>
              </button>
            </div>
          </div>

          <div class="my-8 border-t" style="border-color: var(--border)">
            <div class="flex justify-between border-b py-3.5 text-sm" style="border-color: var(--border)">
              <span style="color: var(--text-secondary)">Service Area</span>
              <span class="font-medium">{{ businessInfo.area }}</span>
            </div>
            <div class="flex justify-between border-b py-3.5 text-sm" style="border-color: var(--border)">
              <span style="color: var(--text-secondary)">Base Location</span>
              <span class="font-medium">{{ businessInfo.base }}</span>
            </div>
            <div class="flex justify-between border-b py-3.5 text-sm" style="border-color: var(--border)">
              <span style="color: var(--text-secondary)">Scheduling</span>
              <span class="font-medium">Confirmed date, never emergency</span>
            </div>
          </div>

          <button
            type="button"
            @click="drawerOpen = true"
            class="w-full rounded-full py-4 text-base font-medium shadow-lg transition active:scale-97"
            style="background: var(--accent); color: var(--accent-text)"
          >
            Continue to Free Quote ({{ selectedServices.length }})
          </button>
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t py-7" style="border-color: var(--border)">
    <div class="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-5 text-sm sm:flex-row sm:px-10" style="color: var(--text-secondary)">
      <span class="font-editorial text-lg" style="color: var(--text-primary)">{{ businessInfo.brand }}</span>
      <span>{{ businessInfo.tagline }}</span>
      <span>&copy; {{ new Date().getFullYear() }} {{ businessInfo.fullName }} &bull; {{ businessInfo.phone }}</span>
    </div>
  </footer>

  <QuoteDrawer
    :open="drawerOpen"
    :property-type="selectedProperty"
    :selected-services="selectedServices"
    @close="drawerOpen = false"
    @remove-service="removeService"
    @clear-services="selectedServices = []"
  />
</template>