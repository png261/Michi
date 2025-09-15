'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { trpc } from '@/app/_trpc/client';
import { useClickOutside } from '@/utils/use-click-outside';
import type { inferProcedureOutput } from '@trpc/server';
import type { AppRouter } from '@/app/server/routers';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

type TaskFromTRPC = inferProcedureOutput<AppRouter['todo']['all']>[number];

export type Task = Omit<TaskFromTRPC, 'time'> & {
    time: string; // force Date type
};

export default function ListItem({ task }: { task: Task }) {
    const [editing, setEditing] = useState(false);
    const wrapperRef = useRef<HTMLLIElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [text, setText] = useState(task.text);

    const utils = trpc.useUtils();

    useEffect(() => {
        setText(task.text);
    }, [task.text]);

    const editTask = trpc.todo.edit.useMutation({
        async onMutate({ id, data }) {
            await utils.todo.all.cancel();
            const allTasks = utils.todo.all.getData();
            if (!allTasks) return;

            utils.todo.all.setData(
                undefined,
                allTasks.map((t) => (t.id === id ? { ...t, ...data } : t))
            );
        },
    });

    const deleteTask = trpc.todo.delete.useMutation({
        async onMutate() {
            await utils.todo.all.cancel();
            const allTasks = utils.todo.all.getData();
            if (!allTasks) return;

            utils.todo.all.setData(
                undefined,
                allTasks.filter((t) => t.id !== task.id)
            );
        },
    });

    useClickOutside({
        ref: wrapperRef,
        enabled: editing,
        callback() {
            editTask.mutate({
                id: task.id,
                data: { text },
            });
            setEditing(false);
        },
    });

    // format time
    const formattedTime = new Date(task.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <li
            ref={wrapperRef}
            className={clsx(
                'flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors',
                editing && 'bg-muted',
                task.completed && 'opacity-60'
            )}
        >
            {!editing ? (
                <>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            className="rounded-full"
                            checked={task.completed}
                            onCheckedChange={(checked) =>
                                editTask.mutate({
                                    id: task.id,
                                    data: { completed: Boolean(checked) },
                                })
                            }
                        />
                        <label
                            onDoubleClick={() => {
                                setEditing(true);
                                inputRef.current?.focus();
                            }}
                            className={clsx(
                                'cursor-pointer select-none',
                                task.completed && 'line-through'
                            )}
                        >
                            {text}
                        </label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{formattedTime}</span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditing(true)}>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deleteTask.mutate(task.id)}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            ) : (
                <Input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            editTask.mutate({
                                id: task.id,
                                data: { text },
                            });
                            setEditing(false);
                        }
                    }}
                />
            )}
        </li>
    );
}
