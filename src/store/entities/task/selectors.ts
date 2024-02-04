import { State } from '../../types'

export const selectTaskModule = (state: State) => state.task

export const selectTaskEntities = (state: State) => selectTaskModule(state).entities

export const selectTaskIds = (state: State) => selectTaskModule(state).ids

export const selectTaskLoadingStatus = (state: State) => selectTaskModule(state).status

export const selectTaskById = (state: State, id: string) => selectTaskEntities(state)[id]

export const selectUnplannedTaskIds = (state: State) =>
    selectTaskIds(state).filter(id => !selectTaskById(state, id).dueDate)

export const selectTaskIdsByDueDate = (state: State, dueDate: string) =>
    selectTaskIds(state).filter(id => selectTaskById(state, id).dueDate === dueDate)
