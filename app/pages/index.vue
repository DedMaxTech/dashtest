<script setup lang="ts">
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Сводка" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>

        </template>
      </UDashboardNavbar>


    </template>

    <template #body>
      <HomeCommitChart/>
    </template>
  </UDashboardPanel>
</template>
