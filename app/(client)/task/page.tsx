'use client';

import { useEffect, useState, useMemo } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { trpc } from '@/app/_trpc/client';
import ListItem from '@/components/ListItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { ChevronDown, ChevronRight } from 'lucide-react';

const filters = ['all', 'active', 'completed'] as const;

export default function TodosPage() {
    const { user } = useUser();
    const [filter, setFilter] = useState<typeof filters[number]>('all');
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState<Date | null>(new Date());
    const [timeValue, setTimeValue] = useState(
        newTaskDate ? format(newTaskDate, 'HH:mm') : ''
    );
    const [overDate, setOverDate] = useState<string | null>(null);

    const allTasks = trpc.todo.all.useQuery(undefined, { staleTime: 5000 });
    const utils = trpc.useUtils();

    // Add task
    const addTask = trpc.todo.add.useMutation({
        async onMutate({ text, time }) {
            await utils.todo.all.cancel();
            const tasks = allTasks.data ?? [];
            if (!user) return;

            utils.todo.all.setData(undefined, [
                ...tasks,
                {
                    id: `${Math.random()}`,
                    completed: false,
                    text,
                    time: time || new Date().toISOString(),
                    userId: user.id,
                },
            ]);
        },
    });

    // Update task time
    const updateTaskTime = trpc.todo.updateTime.useMutation({
        async onMutate({ id, time }) {
            await utils.todo.all.cancel();
            utils.todo.all.setData(
                undefined,
                (allTasks.data ?? []).map(t =>
                    t.id === id ? { ...t, time: time.toISOString() } : t
                )
            );
        },
    });

    // Clear completed
    const clearCompleted = trpc.todo.clearCompleted.useMutation({
        async onMutate() {
            await utils.todo.all.cancel();
            utils.todo.all.setData(
                undefined,
                (allTasks.data ?? []).filter(t => !t.completed)
            );
        },
    });

    const mutatingCount = useIsMutating();
    useEffect(() => {
        if (mutatingCount === 0) void utils.todo.all.invalidate();
    }, [mutatingCount, utils]);

    // Filtered tasks
    const filteredTasks = useMemo(
        () =>
            allTasks.data?.filter(t =>
                filter === 'completed' ? t.completed : filter === 'active' ? !t.completed : true
            ) ?? [],
        [allTasks.data, filter]
    );

    // Group tasks by date
    const groupedTasks = useMemo(() => {
        const groups: Record<string, typeof filteredTasks> = {};
        filteredTasks.forEach(t => {
            const key = format(new Date(t.time), 'yyyy-MM-dd');
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return groups;
    }, [filteredTasks]);

    // Collapsed groups state
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (date: string) => {
        setCollapsedGroups(prev => ({ ...prev, [date]: !prev[date] }));
    };

    // Handle create task
    const handleCreateTask = () => {
        if (!newTaskText.trim() || !user || !newTaskDate) return;
        addTask.mutate({ text: newTaskText.trim(), time: newTaskDate.toISOString() });
        setNewTaskText('');
        const resetDate = new Date();
        setNewTaskDate(resetDate);
        setTimeValue(format(resetDate, 'HH:mm'));
    };

    // Drag and drop
    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setOverDate(null);
        if (!over) return;

        const task = allTasks.data?.find(t => t.id === active.id);
        if (!task) return;

        const oldTime = new Date(task.time);
        const newTime = new Date(over.id as string);
        newTime.setHours(oldTime.getHours());
        newTime.setMinutes(oldTime.getMinutes());

        if (format(oldTime, 'yyyy-MM-dd') !== format(newTime, 'yyyy-MM-dd')) {
            updateTaskTime.mutate({ id: task.id, time: newTime });
        }
    };

    const tasksLeft = filteredTasks.filter(t => !t.completed).length;

    return (
        <div className="flex justify-center py-6 min-h-screen">
            <div className="w-full max-w-2xl p-6">
                {/* Header */}
                <header className="flex flex-col space-y-4">
                    {/* Input + Date & Time picker */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                        <Input
                            placeholder="Task description"
                            value={newTaskText}
                            onChange={e => setNewTaskText(e.target.value)}
                            className="flex-1"
                        />

                        {/* Date Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-2 sm:mt-0">
                                    {newTaskDate ? format(newTaskDate, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={newTaskDate ?? undefined}
                                    onSelect={date => {
                                        if (!date) {
                                            setNewTaskDate(null);
                                            setTimeValue('');
                                            return;
                                        }
                                        const newDate = new Date(date);
                                        if (newTaskDate) {
                                            newDate.setHours(newTaskDate.getHours());
                                            newDate.setMinutes(newTaskDate.getMinutes());
                                        }
                                        setNewTaskDate(newDate);
                                        setTimeValue(format(newDate, 'HH:mm'));
                                    }}
                                    required
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Time Picker */}
                        <Input
                            type="time"
                            value={timeValue}
                            onChange={e => {
                                const value = e.target.value;
                                setTimeValue(value);

                                if (/^\d{2}:\d{2}$/.test(value) && newTaskDate) {
                                    const [hours, minutes] = value.split(':').map(Number);
                                    const newDate = new Date(newTaskDate);
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    setNewTaskDate(newDate);
                                }
                            }}
                            className="mt-2 sm:mt-0 w-[120px]"
                        />
                    </div>

                    {/* Create Task button */}
                    <Button
                        onClick={handleCreateTask}
                        size="sm"
                        className="mt-2 sm:mt-0 max-w-[100px]"
                    >
                        Create
                    </Button>

                    <div className="flex items-center justify-between mt-4">
                        {/* Left side (filters) */}
                        <Tabs
                            value={filter}
                            onValueChange={val => setFilter(val as typeof filters[number])}
                        >
                            <TabsList>
                                {filters.map(f => (
                                    <TabsTrigger key={f} value={f}>
                                        {f[0].toUpperCase() + f.slice(1)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        {/* Right side (tasks left) */}
                        <span className="text-sm text-muted-foreground">
                            <strong>{tasksLeft}</strong>{' '}
                            {tasksLeft === 1 ? 'task left' : 'tasks left'}
                        </span>
                    </div>
                </header>

                {/* Task List */}
                <section className="space-y-4 mt-6">
                    {filteredTasks.length ? (
                        <DndContext
                            sensors={sensors}
                            onDragOver={e => setOverDate(e.over?.id?.toString() ?? null)}
                            onDragEnd={handleDragEnd}
                        >
                            {Object.entries(groupedTasks).map(([date, tasks]) => {
                                const collapsed = collapsedGroups[date] ?? false;

                                return (
                                    <div
                                        key={date}
                                        id={date}
                                        className={cn(
                                            'border rounded-md transition-colors',
                                            overDate === date ? 'bg-slate-100' : 'bg-white'
                                        )}
                                    >
                                        {/* Date header with collapse toggle */}
                                        <button
                                            onClick={() => toggleGroup(date)}
                                            className="flex items-center justify-between w-full px-3 py-2 font-semibold hover:bg-muted rounded-t-md"
                                        >
                                            <span className="flex items-center space-x-2">
                                                {collapsed ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                                <span>{format(new Date(date), 'PPP')}</span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                            </span>
                                        </button>

                                        {/* Collapsible task list */}
                                        {!collapsed && (
                                            <ul className="space-y-1 p-3 pt-2">
                                                {tasks.map(t => (
                                                    <ListItem key={t.id} task={t} />
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </DndContext>
                    ) : (
                        <p className="text-center text-muted-foreground">No tasks yet</p>
                    )}
                </section>

                {/* Footer */}
                <footer className="flex justify-between items-center mt-6 text-sm text-muted-foreground">
                    {filteredTasks.some(t => t.completed) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearCompleted.mutate()}
                        >
                            Clear completed
                        </Button>
                    )}
                </footer>
            </div>
        </div>
    );
}
