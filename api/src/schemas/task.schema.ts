import { z } from 'zod'

export const createTaskSchema = z.object({
  name: z.string().min(1),
  creationDate: z.string().min(1),
})

export const batchEditSchema = z.object({
  tasks: z
    .array(
      z
        .object({
          id: z.string().min(1),
          dueDate: z.string().nullable().optional(),
          order: z.number().nullable().optional(),
          completed: z.boolean().optional(),
          name: z.string().min(1).optional(),
        })
        .refine(
          (task) =>
            task.dueDate !== undefined ||
            task.order !== undefined ||
            task.completed !== undefined ||
            task.name !== undefined,
          { message: 'At least one field to update is required' },
        ),
    )
    .min(1),
})

export const taskIdParamSchema = z.object({
  id: z.string().min(1),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type BatchEditInput = z.infer<typeof batchEditSchema>
export type TaskIdParam = z.infer<typeof taskIdParamSchema>
