import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useAuthStore } from '../store/useAuthStore.js';
import TaskCard from './TaskCard.jsx';
import { CheckSquare } from 'lucide-react';

export default function TaskList({ tasks, onEditTask }) {
  const { reorderTasks } = useAuthStore();

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // Allows standard button/checkbox click operations without starting drag instantly
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const reorderedList = arrayMove(tasks, oldIndex, newIndex);
    
    // Assign correct order numbers (0-indexed based on new array order)
    const finalizedList = reorderedList.map((task, index) => ({
      ...task,
      order: index
    }));

    // Dispatch reorder action
    reorderTasks(finalizedList);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-3xl border border-white/5 bg-slate-900/10">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 mb-4 border border-white/5">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold font-heading text-slate-300 mb-1">No tasks found</h3>
        <p className="text-sm text-brand-grayText max-w-xs">
          Create a new task, choose categories, dates, and priorities to organize your workflow.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
