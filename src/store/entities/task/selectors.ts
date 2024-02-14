import { RootState } from '../../index'

export const selectTaskModule = (state: RootState) => state.task

export const selectTaskEntities = (state: RootState) => selectTaskModule(state).entities

export const selectTaskIds = (state: RootState) => selectTaskModule(state).ids

export const selectTaskLoadingStatus = (state: RootState) => selectTaskModule(state).status

export const selectTaskById = (state: RootState, id: string) => selectTaskEntities(state)[id]

export const selectUnplannedTaskIds = (state: RootState) =>
    selectTaskIds(state)
        .filter(id => !selectTaskById(state, id).dueDate)
        .sort((task1Id, task2Id) => {
            const creationDate1 = new Date(selectTaskById(state, task1Id)?.creationDate ?? null)
            const creationDate2 = new Date(selectTaskById(state, task2Id)?.creationDate ?? null)

            if (creationDate1 > creationDate2) return 1
            if (creationDate1 < creationDate2) return -1

            return 0
        })

export const selectTaskIdsByDueDate = (state: RootState, dueDate: string) =>
    selectTaskIds(state)
        .filter(id => selectTaskById(state, id).dueDate === dueDate)
        .sort((task1Id, task2Id) => {
            const order1 = selectTaskById(state, task1Id)?.order ?? 0
            const order2 = selectTaskById(state, task2Id)?.order ?? 0

            if (order1 > order2) return 1
            if (order1 < order2) return -1

            return 0
        })
