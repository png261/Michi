'use client';
import ListItem from "@/components/ListItem";

export function AllTask({ tasks }: { tasks: any[] }) {
  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <ListItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
