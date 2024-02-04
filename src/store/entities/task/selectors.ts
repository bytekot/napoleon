import { RootState } from '@reduxjs/toolkit/query'

export const selectTaskModule = (state: RootState) => state.task

export const selectTaskEntities = (state: RootState) => selectTaskModule(state).entities

export const selectTaskIds = (state: RootState) => selectTaskModule(state).ids

export const selectTaskLoadingStatus = (state: RootState) => selectTaskModule(state).status

export const selectTaskById = (state: RootState, id: string) => selectTaskEntities(state)[id]
