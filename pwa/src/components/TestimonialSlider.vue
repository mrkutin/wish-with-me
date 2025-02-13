<template>
  <div class="relative">
    <div class="overflow-hidden">
      <div class="flex transition-transform duration-300" :style="slideStyle">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="w-full flex-shrink-0 px-4"
        >
          <blockquote class="text-xl italic mb-4">
            "{{ testimonial.quote }}"
          </blockquote>
          <div class="font-semibold">{{ testimonial.author.name }}</div>
          <div class="text-sm opacity-75">{{ testimonial.author.title }}</div>
        </div>
      </div>
    </div>
    <div class="flex justify-center gap-2 mt-6">
      <button
        v-for="(_, index) in testimonials"
        :key="index"
        @click="currentSlide = index"
        class="w-2 h-2 rounded-full transition-colors"
        :class="currentSlide === index ? 'bg-white' : 'bg-white/30'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Author {
  name: string
  title: string
}

interface Testimonial {
  quote: string
  author: Author
}

const props = defineProps<{
  testimonials: Testimonial[]
}>()

const currentSlide = ref(0)

const slideStyle = computed(() => ({
  transform: `translateX(-${currentSlide.value * 100}%)`
}))

// Auto-advance slides
setInterval(() => {
  currentSlide.value = (currentSlide.value + 1) % props.testimonials.length
}, 5000)
</script> 