<template>
  <div class="relative min-h-screen bg-background-alt">
    <BackgroundDecorations />
    <div class="relative z-10">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import BackgroundDecorations from '@/components/BackgroundDecorations.vue'
</script> 