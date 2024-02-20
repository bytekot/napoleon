import { createContext, useReducer, useRef } from 'react'
import { CALENDAR_PERIODS, CALENDAR_REDUCER_ACTIONS as ACTIONS } from '../../constants/calendar'
import { getDateWithOffset } from '../../utils/calendar'
import {
    CalendarContextValue,
    CalendarPeriod,
    CalendarReducerAction,
    CalendarState,
    SetDateAction,
    SetMovingItemAction,
    SetPeriodAction,
} from '../../types/calendar'

const DEFAULT_STATE: CalendarState = {
    date: new Date(),
    period: CALENDAR_PERIODS.week,
    movingItem: null
}

export const CalendarContext = createContext<CalendarContextValue>(
    DEFAULT_STATE as CalendarContextValue
)

function CalendarReducer (state: CalendarState, action: CalendarReducerAction): CalendarState {
    switch (action.type) {
        case ACTIONS.setDate:
            return {
                ...state,
                date: (action as SetDateAction).payload,
            }
        case ACTIONS.setPeriod:
            return {
                ...state,
                period: (action as SetPeriodAction).payload,
            }
        case ACTIONS.setMovingItem:
            state.movingItemRef.current =
                (action as SetMovingItemAction).payload?.element ?? null

            return {
                ...state,
                movingItem: (action as SetMovingItemAction).payload?.id ?? null
            }
        case ACTIONS.setNextDate:
            return {
                ...state,
                date: getDateWithOffset(state.date, state.period, 1),
            }
        case ACTIONS.setPreviousDate:
            return {
                ...state,
                date: getDateWithOffset(state.date, state.period, -1),
            }
        default:
            throw new Error('Wrong calendar reducer action type.')
    }
}

export function CalendarProvider ({
    children,
    date,
    period,
}: {
    children: React.ReactNode
    date: Date
    period: CalendarPeriod
}) {
    const [state, dispatch] = useReducer(CalendarReducer,
        { 
            ...DEFAULT_STATE,
            date,
            period,
            movingItemRef: useRef<Element>(),
        }
    )

    const isPeriodWeek = state.period === CALENDAR_PERIODS.week
    const isPeriodMonth = state.period === CALENDAR_PERIODS.month

    function setDate (date: Date) {
        dispatch({ type: ACTIONS.setDate, payload: date })
    }

    function setPeriod (period: CalendarPeriod) {
        dispatch({ type: ACTIONS.setPeriod, payload: period })
    }

    function setMovingItem (item: { id: string, element: Element } | null) {
        item && item.element.addEventListener('dragend', () => {
            dispatch({ type: ACTIONS.setMovingItem, payload: null })
        })
        dispatch({ type: ACTIONS.setMovingItem, payload: item })
    }

    function setNextDate () {
        dispatch({ type: ACTIONS.setNextDate })
    }

    function setPreviousDate () {
        dispatch({ type: ACTIONS.setPreviousDate })
    }

    function setToday () {
        setDate(new Date())
    }

    return (
        <CalendarContext.Provider value={{
            date: state.date,
            period: state.period,
            movingItem: state.movingItem,
            setDate,
            setPeriod,
            isPeriodWeek,
            isPeriodMonth,
            setNextDate,
            setPreviousDate,
            setToday,
            setMovingItem,
        }}>
            {children}
        </CalendarContext.Provider>
    )
}
