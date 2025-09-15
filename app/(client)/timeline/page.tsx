"use client";

import { useEffect, useState } from "react";
import {
    dateFnsLocalizer,
    Event as CalendarEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, startOfWeek, getDay, format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { trpc } from "@/app/_trpc/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import ShadcnBigCalendar from "@/components/shadcn-big-calendar/shadcn-big-calendar";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

const DragAndDropCalendar = withDragAndDrop(ShadcnBigCalendar);

interface Task {
    id: string;
    text: string;
    time: string;
    completed: boolean;
}

interface MyCalendarEvent extends CalendarEvent {
    id: string;
    completed: boolean;
}

export default function TaskCalendar() {
    const { data: tasks } = trpc.todo.all.useQuery();
    const updateTimeMutation = trpc.todo.updateTime.useMutation();
    const [events, setEvents] = useState<MyCalendarEvent[]>([]);

    useEffect(() => {
        if (tasks) {
            const mapped = tasks.map((task: Task) => ({
                id: task.id,
                title: task.text,
                start: new Date(task.time),
                end: new Date(task.time),
                allDay: false,
                completed: task.completed,
            }));
            setEvents(mapped);
        }
    }, [tasks]);

    const handleEventResize = ({ event, start }: any) => {
        updateTimeMutation.mutate({ id: event.id, time: start });
    };

    const handleEventDrop = ({ event, start }: any) => {
        updateTimeMutation.mutate({ id: event.id, time: start });
    };

    return (
        <div className="h-[700px] p-4">
            <DndProvider backend={HTML5Backend}>
                <DragAndDropCalendar
                    localizer={localizer}
                    events={events}
                    style={{ height: 650 }}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    resizable
                    popup
                />
            </DndProvider>
        </div>
    );
}
