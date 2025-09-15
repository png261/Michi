import { tool } from 'ai';
import { z } from 'zod';
import { appRouter } from '@/app/server/routers';
import { createContext } from '@/app/server/context';
import * as chrono from 'chrono-node';

// --- Helper: parse human-friendly datetime ---
function parseDateTime(input: string, defaultHour = 9): string | null {
    const date = chrono.parseDate(input, new Date(), { forwardDate: true });
    if (!date) return null;

    // Default time if only day provided
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
        date.setHours(defaultHour, 0, 0, 0);
    }

    return date.toISOString(); // Prisma-compatible DateTime
}

// --- Helper: fetch user tasks ---
async function getUserTasks() {
    const ctx = await createContext();
    if (!ctx.auth.userId) throw new Error('Unauthorized');
    const caller = appRouter.createCaller(ctx);
    return await caller.todo.all();
}

// --- Add Task ---
export const addTask = tool({
    description: 'Add a new task with text and a scheduled datetime (supports natural language like "tomorrow 2pm", "next Monday", "14/05").',
    inputSchema: z.object({
        text: z.string(),
        time: z.string(),
    }),
    execute: async ({ text, time }) => {
        const parsedTime = parseDateTime(time);
        if (!parsedTime) {
            return { success: false, message: "Could not understand the datetime. Try 'tomorrow 14:00', '14/05', etc." };
        }

        const ctx = await createContext();
        const caller = appRouter.createCaller(ctx);
        const task = await caller.todo.add({ text, time: parsedTime });

        return {
            success: true,
            message: `Task added: "${task.text}" scheduled on ${task.time}`,
            task,
        };
    },
});

// --- List Tasks ---
export const listTasks = tool({
    description: 'List all your tasks with status and scheduled time.',
    inputSchema: z.object({}),
    execute: async () => {
        const tasks = await getUserTasks();
        return {
            count: tasks.length,
            tasks: tasks.map((t: any, i: number) => ({
                index: i + 1,
                id: t.id,
                text: t.text,
                time: t.time,
                completed: t.completed,
            })),
        };
    },
});

// --- Edit Task ---
export const editTask = tool({
    description: 'Edit a task by number, ID, or text. Can update text, completion status, or datetime.',
    inputSchema: z.object({
        taskIdentifier: z.string().optional(),
        newText: z.string().optional(),
        completed: z.boolean().optional(),
        time: z.string().optional(),
    }),
    execute: async ({ taskIdentifier, newText, completed, time }) => {
        const tasks = await getUserTasks();
        if (!tasks.length) {
            return { success: false, message: "You have no tasks to edit." };
        }

        if (!taskIdentifier) {
            return {
                success: false,
                message: "No task specified. Provide an ID, text snippet, or task number.",
                tasks,
            };
        }

        let task = tasks.find((t: any) => t.id === taskIdentifier || t.text.toLowerCase().includes(taskIdentifier.toLowerCase()));
        if (!task) {
            const index = parseInt(taskIdentifier);
            if (!isNaN(index) && index > 0 && index <= tasks.length) {
                task = tasks[index - 1];
            }
        }
        if (!task) return { success: false, message: "Task not found." };

        let parsedTime;
        if (time) {
            parsedTime = parseDateTime(time);
            if (!parsedTime) {
                return { success: false, message: "Could not understand the datetime. Try 'tomorrow 14:00', etc." };
            }
        }

        if (!newText && completed === undefined && !parsedTime) {
            return { success: false, message: "Provide new text, completion status, or new datetime." };
        }

        const ctx = await createContext();
        const caller = appRouter.createCaller(ctx);
        const updated = await caller.todo.edit({
            id: task.id,
            data: { text: newText, completed, time: parsedTime },
        });

        return {
            success: true,
            message: `Task updated: "${updated.text}" on ${updated.time} [${updated.completed ? "✔ Completed" : "❌ Pending"}]`,
            task: updated,
        };
    },
});

// --- Delete Task ---
export const deleteTask = tool({
    description: 'Delete a task by number, ID, or text snippet.',
    inputSchema: z.object({
        taskIdentifier: z.string().optional(),
    }),
    execute: async ({ taskIdentifier }) => {
        const tasks = await getUserTasks();
        if (!tasks.length) return { success: false, message: "You have no tasks to delete." };

        if (!taskIdentifier) {
            return {
                success: false,
                message: "No task specified. Provide an ID, text snippet, or task number.",
                tasks,
            };
        }

        let task = tasks.find((t: any) => t.id === taskIdentifier || t.text.toLowerCase().includes(taskIdentifier.toLowerCase()));
        if (!task) {
            const index = parseInt(taskIdentifier);
            if (!isNaN(index) && index > 0 && index <= tasks.length) task = tasks[index - 1];
        }
        if (!task) return { success: false, message: "Task not found." };

        const ctx = await createContext();
        const caller = appRouter.createCaller(ctx);
        await caller.todo.delete(task.id);

        return {
            success: true,
            message: `Deleted task: "${task.text}" on ${task.time}`,
            task,
        };
    },
});

// --- Toggle All Tasks ---
export const toggleAllTasks = tool({
    description: 'Mark all tasks as completed or pending.',
    inputSchema: z.object({ completed: z.boolean() }),
    execute: async ({ completed }) => {
        const ctx = await createContext();
        const caller = appRouter.createCaller(ctx);
        await caller.todo.toggleAll({ completed });
        return {
            success: true,
            message: `All tasks are now marked as ${completed ? "✔ Completed" : "❌ Pending"}.`,
        };
    },
});

// --- Clear Completed Tasks ---
export const clearCompletedTasks = tool({
    description: 'Delete all completed tasks.',
    inputSchema: z.object({}),
    execute: async () => {
        const ctx = await createContext();
        const caller = appRouter.createCaller(ctx);
        await caller.todo.clearCompleted();
        return { success: true, message: "All completed tasks have been cleared." };
    },
});
