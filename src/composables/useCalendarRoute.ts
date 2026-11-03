import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCalendarStore } from '../stores/calendar'
import { CALENDAR_PERIODS } from '../constants/calendar'
import type { CalendarPeriod } from '../types/calendar'

const VALID_PERIODS = Object.values(CALENDAR_PERIODS) as CalendarPeriod[]

function isValidPeriod(value: unknown): value is CalendarPeriod {
  return typeof value === 'string' && VALID_PERIODS.includes(value as CalendarPeriod)
}

export function useCalendarRoute() {
  const route = useRoute()
  const router = useRouter()
  const store = useCalendarStore()

  watch(
    () => route.query.period,
    (period) => {
      if (isValidPeriod(period) && period !== store.period) {
        store.setPeriod(period)
      }
    },
    { immediate: true },
  )

  watch(
    () => store.period,
    async (period) => {
      if (route.query.period !== period) {
        await router.replace({ query: { ...route.query, period } })
      }
    },
    { immediate: true },
  )
}
