<template>
  <div class="bg-white rounded-lg border border-gray-200/50 shadow-sm p-5 h-[240px] flex flex-col animate-pulse">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Title area -->
        <div class="flex items-start gap-2.5 mb-3">
          <div class="flex-shrink-0 mt-[2px]">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
          </div>
          <div class="h-[22px] bg-gray-200 rounded w-3/5"></div>
        </div>
        
        <!-- Description -->
        <div class="space-y-2">
          <div class="h-[18px] bg-gray-200 rounded w-full"></div>
          <div class="h-[18px] bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>

      <!-- Action button placeholder -->
      <div class="w-8 h-8 p-1.5 -mr-1.5">
        <div class="w-5 h-5 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-auto pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Date -->
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-16 h-[18px] bg-gray-200 rounded"></div>
          </div>
          <!-- Items count -->
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-gray-200 rounded"></div>
            <div class="w-20 h-[18px] bg-gray-200 rounded"></div>
          </div>
        </div>
        <!-- Due date badge -->
        <div class="w-[72px] h-[21px] bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
</template> 