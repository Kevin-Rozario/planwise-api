import { z } from 'zod';

export const eventSchema = z
  .object({
    title: z
      .string('Title is required')
      .trim()
      .min(3, 'Title must be at least 3 characters long')
      .max(100, 'Title must be less than 100 characters'),

    description: z
      .string('Description is required')
      .trim()
      .min(3, 'Description must be at least 3 characters long')
      .max(300, 'Description must be less than 300 characters'),

    mode: z.enum(['online', 'offline'], 'Mode is required').default('offline'),

    venue: z.string('Venue is required').trim().min(3, 'Venue must be at least 3 characters long'),

    startTime: z.preprocess(
      (arg) => (typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg),
      z.date('Start time is required'),
    ),

    endTime: z.preprocess(
      (arg) => (typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg),
      z.date('End time is required'),
    ),

    priority: z.enum(['high', 'medium', 'low'], 'Priority is required').default('medium'),

    tags: z.array(z.string().trim().min(1, 'Tag cannot be empty')).optional().default([]),

    workingHours: z
      .object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format'),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format'),
      })
      .optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type IEventInput = z.infer<typeof eventSchema>;
