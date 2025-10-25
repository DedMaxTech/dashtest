<script setup lang="ts">
import { parseISO, startOfISOWeek, formatISO, format, subDays, getISODay, isAfter } from 'date-fns'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip, VisScatter } from '@unovis/vue'


const { selectedRepo, fetchSelectedRepoCommits, getCachedCommits } = useRepo()

const { status, refresh } = await useAsyncData(
  'selected-repo-commits',
  async () => {
    if (!selectedRepo.value) return []
    return fetchSelectedRepoCommits()
  },
  { watch: [selectedRepo], immediate: true, server: true }
)

const loading = computed(() => status.value === 'pending')

type WeeklyRow = { weekStart: string; count: number }
const weeklyRows = computed<WeeklyRow[]>(() => {
  const commits = getCachedCommits()
  const buckets: Record<string, number> = {}
  for (const c of commits) {
    if (!c.created_at) continue
    const weekStart = startOfISOWeek(parseISO(c.created_at))
    const key = formatISO(weekStart, { representation: 'date' })
    buckets[key] = (buckets[key] ?? 0) + 1
  }
  return Object.entries(buckets)
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
})

type WeekdayRow = { dayIdx: number; label: string; avgPerWeek: number; total: number }
const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const weekdayRows = computed<WeekdayRow[]>(() => {
  const commits = getCachedCommits()
  const now = new Date()
  const from = subDays(now, 28)

  const counts: number[] = Array(7).fill(0)
  for (const c of commits) {
    if (!c.created_at) continue
    const d = parseISO(c.created_at)
    if (!isAfter(d, from)) continue
    const isoDay = getISODay(d)
    counts[isoDay - 1]++
  }

  const weeks = 50
  return counts.map((total, i) => ({
    dayIdx: i,
    label: weekdayLabels[i],
    total,
    avgPerWeek: total / weeks
  }))
})

const xWeekly = (_: WeeklyRow, i: number) => i
const yWeekly = (d: WeeklyRow) => d.count
const tickWeekly = (i: number) => {
  const r = weeklyRows.value[i]
  return r ? format(parseISO(r.weekStart), 'dd MMM') : ''
}
const tooltipWeekly = (d: WeeklyRow) =>
  `${format(parseISO(d.weekStart), 'dd MMM yyyy')}: ${d.count} коммитов`

const xWeekday = (_: WeekdayRow, i: number) => i
const yWeekday = (d: WeekdayRow) => d.avgPerWeek
const tickWeekday = (i: number) => weekdayRows.value[i]?.label ?? ''
const tooltipWeekday = (d: WeekdayRow) =>
  `${d.label}: средн. ${d.avgPerWeek.toFixed(2)} / неделю (всего за 4 нед: ${d.total})`

const totalCommits = computed(() =>
  getCachedCommits().length
)

const onForceRefresh = async () => {
  if (!selectedRepo.value) return
  await fetchSelectedRepoCommits({ force: true })
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <UCard :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
      <template #header>
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">Коммиты по неделям</p>
          <p class="text-3xl text-highlighted font-semibold">
            {{ totalCommits }}
          </p>
        </div>
      </template>

      <div v-if="!selectedRepo" class="p-6 text-muted">
        Выберите репозиторий, чтобы увидеть график.
      </div>
      <div v-if="selectedRepo && !loading && weeklyRows.length === 0" class="p-6 text-muted">
        Для этого репозитория коммитов по неделям пока нет.
      </div>
      <div v-else class="h-96">
        <VisXYContainer
          :data="weeklyRows"
          :padding="{ top: 40 }"
          class="h-full"
        >
          <VisArea :x="xWeekly" :y="yWeekly" color="var(--ui-primary)" :opacity="0.1" />
          <VisLine :x="xWeekly" :y="yWeekly" color="var(--ui-primary)" />
          <VisScatter :x="xWeekly" :y="yWeekly" color="var(--ui-primary)" :size="4" />

          <VisAxis type="x" :x="xWeekly" :tick-format="tickWeekly" />
          <VisAxis type="y" :y="yWeekly" />

          <VisCrosshair color="var(--ui-primary)" :template="tooltipWeekly" />
          <VisTooltip />
        </VisXYContainer>
      </div>


    </UCard>

    <UCard :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
      <template #header>
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            Коммиты по дням недели
          </p>
        </div>
      </template>

      <div v-if="!selectedRepo" class="p-6 text-muted">
        Выберите репозиторий, чтобы увидеть распределение по дням недели.
      </div>
    <div v-if="selectedRepo && !loading && weekdayRows.every(r => r.total === 0)" class="p-6 text-muted">
        За последние 4 недели коммитов не найдено.
      </div>
      <div v-else class="h-80">
        <VisXYContainer
          :data="weekdayRows"
          :padding="{ top: 30, right: 12, left: 36, bottom: 24 }"
          class="h-full"
        >
          <VisArea :x="xWeekday" :y="yWeekday" color="var(--ui-primary)" :opacity="0.15" />
          <VisLine :x="xWeekday" :y="yWeekday" color="var(--ui-primary)" />
          <VisScatter :x="xWeekday" :y="yWeekday" color="var(--ui-primary)" :size="8" />

          <VisAxis type="x" :x="xWeekday" :tick-format="tickWeekday" />
          <VisAxis type="y" :y="yWeekday" />

          <VisCrosshair color="var(--ui-primary)" :template="tooltipWeekday" />
          <VisTooltip />
        </VisXYContainer>
      </div>


    </UCard>
  </div>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
