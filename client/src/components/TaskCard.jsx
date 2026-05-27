import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday as isDateToday } from 'date-fns';
import { 
  GripVertical, 
  Calendar, 
  Trash2, 
  Tag, 
  Check, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';

export default function TaskCard({ task, onEdit }) {
  const { toggleTask, deleteTask } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  // Setup dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    await toggleTask(task.id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    await deleteTask(task.id);
  };

  // Priority color maps
  const priorityClasses = {
    HIGH: 'bg-red-500/10 text-red-400 border border-red-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    LOW: 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
  };

  // Due date formatting and overdue check
  let dueDateText = '';
  let isOverdue = false;
  let isToday = false;

  if (task.dueDate) {
    const dateObj = new Date(task.dueDate);
    isToday = isDateToday(dateObj);
    isOverdue = isPast(dateObj) && !isToday && !task.isCompleted;
    
    if (isToday) {
      dueDateText = 'Today';
    } else {
      dueDateText = format(dateObj, 'MMM d, yyyy');
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-2xl flex items-center p-4 gap-4 border border-white/5 relative transition-all group ${
        isDragging ? 'opacity-40 shadow-indigo-glow border-brand-indigo/50 scale-[1.01]' : 'glass-card-hover'
      } ${task.isCompleted ? 'bg-slate-900/40 border-emerald-500/10' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Complete Checkbox */}
      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
          task.isCompleted 
            ? 'bg-emerald-500 border-emerald-400 text-white' 
            : 'border-white/20 hover:border-brand-indigo bg-white/5 hover:bg-brand-indigo/5'
        }`}
      >
        {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div 
        onClick={() => onEdit(task)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className={`font-semibold text-sm sm:text-base leading-tight truncate ${
            task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-brand-indigo transition-colors'
          }`}>
            {task.title}
          </h3>
          
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Priority Badge */}
            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityClasses[task.priority] || priorityClasses.MEDIUM}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Task Description (if any) */}
        {task.description && (
          <p className={`text-xs sm:text-sm line-clamp-1 mb-2 ${task.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
            {task.description}
          </p>
        )}

        {/* Task Meta Footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-brand-grayText">
          {/* Category */}
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-medium">{task.category || 'Personal'}</span>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${
              isOverdue 
                ? 'text-red-400 font-bold' 
                : isToday && !task.isCompleted 
                  ? 'text-brand-indigo font-semibold' 
                  : ''
            }`}>
              {isOverdue ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : <Calendar className="w-3.5 h-3.5" />}
              <span>{dueDateText}</span>
              {isOverdue && <span className="text-[10px] uppercase font-bold tracking-wider">(Overdue)</span>}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center shrink-0">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-all"
          title="Delete task"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
