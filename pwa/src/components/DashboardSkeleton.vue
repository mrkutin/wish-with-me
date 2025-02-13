<template>
  <div class="flex-1 bg-background-alt">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-background rounded-lg border border-border p-6">
            <div class="space-y-4">
              <div class="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 