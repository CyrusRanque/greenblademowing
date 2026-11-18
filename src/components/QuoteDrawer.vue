<script setup>
import { reactive, ref, watch } from 'vue'
import { X, CheckCircle2 } from 'lucide-vue-next'
import { businessInfo } from '../data/siteData'

const props = defineProps({
  open: Boolean,
  propertyType: String,
  selectedServices: Array,
})

const emit = defineEmits(['close', 'removeService', 'clearServices'])

const submitted = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  streetAddress: '',
  city: '',
  phone: '',
  notes: '',
  agreeSms: true,
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) submitted.value = false
  }
)

const handleSubmit = () => {
  submitted.value = true
  setTimeout(() => {
    emit('clearServices')
  }, 400)
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-70 bg-[#050807]/60 backdrop-blur-xs transition-opacity duration-300"
    :class="open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
    @click="emit('close')"
  />

  <!-- Slide-Over Drawer -->
  <aside
    role="dialog"
    aria-modal="true"
    aria-labelledby="drawer-title"
    class="fixed inset-y-0 right-0 z-80 flex w-full max-w-[440px] flex-col border-l transition-transform duration-300"
    style="
      background: var(--surface);
      border-color: var(--border);
      transition-timing-function: var(--ease-drawer);
    "
    :class="open ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b px-6 py-5"
      style="border-color: var(--border)"
    >
      <div>
        <h2 id="drawer-title" class="text-xl font-bold tracking-tight">
          Free Itemised Quote
        </h2>
        <p class="text-xs" style="color: var(--text-secondary)">
          {{ propertyType }} &bull; {{ businessInfo.phone }}
        </p>
      </div>
      <button
        type="button"
        aria-label="Close quote drawer"
        @click="emit('close')"
        class="flex h-10 w-10 items-center justify-center rounded-full border transition hover:opacity-80"
        style="border-color: var(--border)"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto px-6 py-5">
      <!-- Confirmation State -->
      <div v-if="submitted" class="flex h-full flex-col items-center justify-center py-10 text-center">
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full"
          style="background: var(--accent); color: var(--accent-text)"
        >
          <CheckCircle2 class="h-7 w-7" />
        </div>
        <h3 class="mt-4 text-2xl font-bold">Estimate Requested</h3>
        <p class="mt-2 max-w-xs text-sm" style="color: var(--text-secondary)">
          Thanks, {{ form.firstName }}! Green Blade Mowing Solutions will review your property in
          {{ form.city || 'Southeast Melbourne' }} and confirm your schedule shortly.
        </p>
        <button
          type="button"
          @click="emit('close')"
          class="mt-6 rounded-full px-7 py-3 text-sm font-medium transition active:scale-97"
          style="background: var(--accent); color: var(--accent-text)"
        >
          Done
        </button>
      </div>

      <!-- Form -->
      <form v-else id="quote-drawer-form" @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Selected Services Chips -->
        <div
          v-if="selectedServices.length > 0"
          class="rounded-[12px] border p-3.5"
          style="background: var(--bg); border-color: var(--border)"
        >
          <p class="text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary)">
            Selected Services ({{ selectedServices.length }})
          </p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="srv in selectedServices"
              :key="srv"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style="background: var(--surface-elevated)"
            >
              {{ srv }}
              <button
                type="button"
                @click="emit('removeService', srv)"
                class="opacity-60 hover:opacity-100"
                aria-label="Remove service"
              >
                &times;
              </button>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-medium" style="color: var(--text-secondary)">First Name *</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              placeholder="First Name"
              class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
              style="background: var(--bg); border-color: var(--border)"
            />
          </div>
          <div>
            <label class="text-xs font-medium" style="color: var(--text-secondary)">Last Name *</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              placeholder="Last Name"
              class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
              style="background: var(--bg); border-color: var(--border)"
            />
          </div>
        </div>

        <div>
          <label class="text-xs font-medium" style="color: var(--text-secondary)">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="you@example.com"
            class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
            style="background: var(--bg); border-color: var(--border)"
          />
        </div>

        <div>
          <label class="text-xs font-medium" style="color: var(--text-secondary)">Street Address *</label>
          <input
            v-model="form.streetAddress"
            type="text"
            required
            placeholder="Street Address"
            class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
            style="background: var(--bg); border-color: var(--border)"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-medium" style="color: var(--text-secondary)">City / Suburb *</label>
            <input
              v-model="form.city"
              type="text"
              required
              placeholder="e.g. Cranbourne"
              class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
              style="background: var(--bg); border-color: var(--border)"
            />
          </div>
          <div>
            <label class="text-xs font-medium" style="color: var(--text-secondary)">Phone *</label>
            <input
              v-model="form.phone"
              type="tel"
              required
              placeholder="0480 758 829"
              class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
              style="background: var(--bg); border-color: var(--border)"
            />
          </div>
        </div>

        <div>
          <label class="text-xs font-medium" style="color: var(--text-secondary)">Property Notes</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Lawn size, hedge height, access details..."
            class="mt-1 w-full rounded-[12px] border px-3.5 py-2.5 text-sm outline-none"
            style="background: var(--bg); border-color: var(--border)"
          ></textarea>
        </div>

        <label class="flex items-start gap-2.5 text-xs leading-relaxed" style="color: var(--text-secondary)">
          <input v-model="form.agreeSms" type="checkbox" required class="mt-0.5 accent-[#3d5740]" />
          <span>
            By Submitting Your Phone Number, You Agree To "Start" Receiving Texts From Green Blade Mowing.
          </span>
        </label>
      </form>
    </div>

    <!-- Footer CTA -->
    <div
      v-if="!submitted"
      class="border-t px-6 py-5"
      style="border-color: var(--border)"
    >
      <button
        type="submit"
        form="quote-drawer-form"
        class="w-full rounded-full py-4 text-base font-medium transition active:scale-97"
        style="background: var(--accent); color: var(--accent-text)"
      >
        Get Your Price Instantly
      </button>
    </div>
  </aside>
</template>