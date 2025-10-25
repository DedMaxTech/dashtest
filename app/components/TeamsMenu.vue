<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { RepositoryListItem } from '~/types/api'

defineProps<{ collapsed?: boolean }>()

const { repos } = useAuth()
const { selectedRepo, setSelectedRepo } = useRepo()

watchEffect(() => {
  if (!selectedRepo.value && repos.value?.length) {
    setSelectedRepo(repos.value[0]!)
  }
})

const formatRepo = (repo?: RepositoryListItem) => repo ? `${repo.owner_name}/${repo.name}` : ''

const items = computed<DropdownMenuItem[][]>(() => ([
  repos.value.map(repo => ({
    label: formatRepo(repo),
    onSelect: () => setSelectedRepo(repo),
  }))
]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :label="collapsed ? undefined : formatRepo(selectedRepo || undefined)"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
      trailing-icon="i-lucide-chevrons-up-down"
    />
  </UDropdownMenu>
</template>
