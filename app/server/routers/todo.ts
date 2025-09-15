import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { publicProcedure, protectedProcedure, router } from '../trpc';

export const todoRouter = router({
    all: protectedProcedure.query(async ({ ctx }) => {
        return await prisma.task.findMany({
            where: { userId: ctx.auth.userId },
            orderBy: { time: 'asc' },
        });
    }),

    add: protectedProcedure
        .input(
            z.object({
                text: z.string(),
                time: z.string().datetime(),

            }),
        )
        .mutation(async ({ ctx, input }) => {
            const todo = await prisma.task.create({
                data: {
                    text: input.text,
                    time: input.time,
                    userId: ctx.auth.userId,
                },
            });

            return todo;
        }),

    edit: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                data: z.object({
                    completed: z.boolean().optional(),
                    time: z.string().datetime().optional(),
                    text: z.string().min(1).optional(),
                }),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, data } = input;
            const todo = await prisma.task.update({
                where: {
                    id,
                    userId: ctx.auth.userId,
                },
                data,
            });
            return todo;
        }),

    toggleAll: protectedProcedure
        .input(z.object({ completed: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.task.updateMany({
                where: { userId: ctx.auth.userId },
                data: { completed: input.completed },
            });
        }),

    delete: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ ctx, input: id }) => {
            await prisma.task.delete({
                where: { id, userId: ctx.auth.userId },
            });
            return id;
        }),

    clearCompleted: protectedProcedure.mutation(async ({ ctx }) => {
        await prisma.task.deleteMany({
            where: { completed: true, userId: ctx.auth.userId },
        });

        return await prisma.task.findMany({
            where: { userId: ctx.auth.userId },
        });
    }),
    updateTime: publicProcedure
        .input(z.object({ id: z.string(), time: z.date() }))
        .mutation(async ({ input, ctx }) => {
            return await prisma.task.update({
                where: { id: input.id },
                data: { time: input.time },
            });
        }),
});
export type TodoRouter = typeof todoRouter
