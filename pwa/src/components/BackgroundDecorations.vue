<template>
  <div class="absolute inset-0 overflow-hidden max-w-[1800px] mx-auto pointer-events-none">
    <!-- Left side decorations -->
    <div class="absolute left-8 top-[15%] text-indigo-50 transform -rotate-12">
      <Gift class="w-24 h-24" strokeWidth={1.5} />
    </div>
    <div class="absolute left-12 top-[45%] text-indigo-50 transform rotate-12">
      <Heart class="w-20 h-20 stroke-current" />
    </div>
    <div class="absolute left-16 bottom-[20%] text-indigo-50 transform -rotate-6">
      <ShoppingBag class="w-16 h-16 stroke-current" />
    </div>
    
    <!-- Right side decorations -->
    <div class="absolute right-8 top-[20%] text-indigo-50 transform rotate-12">
      <Package class="w-20 h-20 stroke-current" />
    </div>
    <div class="absolute right-12 top-[50%] text-indigo-50 transform -rotate-12">
      <Heart class="w-24 h-24 stroke-current" />
    </div>
    <div class="absolute right-16 bottom-[15%] text-indigo-50 transform rotate-6">
      <Gift class="w-16 h-16 stroke-current" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Gift, Heart, ShoppingBag, Package } from 'lucide-vue-next'
</script> 