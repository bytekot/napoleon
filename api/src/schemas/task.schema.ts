import { z } from 'zod'

export const createTaskSchema = z.object({
  name: z.string().min(1),
  creationDate: z.string().min(1),
})

export const editTaskSchema = z.object({
  dueDate: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  completed: z.boolean().optional(),
})

export const taskIdParamSchema = z.object({
  id: z.string().min(1),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type EditTaskInput = z.infer<typeof editTaskSchema>
export type TaskIdParam = z.infer<typeof taskIdParamSchema>
