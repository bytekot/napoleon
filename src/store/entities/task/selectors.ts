import { State } from '../../types'

export const selectTaskModule = (state: State) => state.task

export const selectTaskEntities = (state: State) => selectTaskModule(state).entities

export const selectTaskIds = (state: State) => selectTaskModule(state).ids

export const selectTaskLoadingStatus = (state: State) => selectTaskModule(state).status

export const selectTaskById = (state: State, id: string) => selectTaskEntities(state)[id]

export const selectUnplannedTaskIds = (state: State) =>
    selectTaskIds(state).filter(id => !selectTaskById(state, id).dueDate)

export const selectTaskIdsByDueDate = (state: State, dueDate: string) =>
    selectTaskIds(state)
        .filter(id => selectTaskById(state, id).dueDate === dueDate)
        .sort((task1Id, task2Id) => {
            const order1 = selectTaskById(state, task1Id)?.order ?? 0
            const order2 = selectTaskById(state, task2Id)?.order ?? 0

            if (order1 > order2) return 1
            if (order1 < order2) return -1

            return 0
        })
