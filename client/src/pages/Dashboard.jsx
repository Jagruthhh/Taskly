import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import Sidebar from '../components/Sidebar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import TaskList from '../components/TaskList.jsx';
import { 
  Plus, 
  Search, 
  Filter, 
  Folder, 
  Flag,
  Calendar,
  X,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { 
    tasks, 
    fetchTasks, 
    addTask, 
    updateTask, 
    isTasksLoading,
    user
  } = useAuthStore();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | specific category

  // Quick-add task title state
  const [quickTitle, setQuickTitle] = useState('');

  // Task Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null means "creating a new task"
  const [modalForm, setModalForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'Personal',
    dueDate: ''
  });

  // Re-fetch tasks whenever the authenticated user changes (handles logout/login cycles).
  // Guarded by user.id so it never fires before Firebase confirms the session,
  // eliminating the 401 race condition.
  useEffect(() => {
    if (!user?.id) return;
    // Small delay ensures Firebase auth token is fully settled before Firestore read
    const timer = setTimeout(() => fetchTasks(), 300);
    return () => clearTimeout(timer);
  }, [user?.id]);

  // Update modal form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setModalForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'MEDIUM',
        category: editingTask.category || 'Personal',
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setModalForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'Personal',
        dueDate: ''
      });
    }
  }, [editingTask]);

  // Handle Quick Add task submission
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      // Open full task specifications creator modal if input is empty
      openCreateModal();
      return;
    }

    const result = await addTask({
      title: quickTitle,
      priority: 'MEDIUM',
      category: 'Personal'
    });

    if (result.success) {
      setQuickTitle('');
    }
  };

  // Open modal in create mode
  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Close editor modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Handle modal submit (Create or Edit)
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const payload = {
      title: modalForm.title,
      description: modalForm.description || null,
      priority: modalForm.priority,
      category: modalForm.category,
      dueDate: modalForm.dueDate ? new Date(modalForm.dueDate).toISOString() : null
    };

    if (editingTask) {
      // Edit mode
      const result = await updateTask(editingTask.id, payload);
      if (result.success) {
        toast.success('Task updated successfully');
        closeModal();
      }
    } else {
      // Create mode
      const result = await addTask(payload);
      if (result.success) {
        closeModal();
      }
    }
  };

  // Extract all unique categories present in the tasks list to build our filter pill options
  const uniqueCategories = ['ALL', ...new Set(tasks.map(t => t.category).filter(Boolean))];

  // Filters logic applied to task list
  const filteredTasks = tasks.filter(task => {
    // 1. Search term match
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status match
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = !task.isCompleted;
    if (statusFilter === 'COMPLETED') matchesStatus = task.isCompleted;

    // 3. Priority match
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    // 4. Category match
    const matchesCategory = categoryFilter === 'ALL' || task.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Calculate statistics for the dynamic top header
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex bg-brand-dark min-h-screen text-slate-100 relative">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main dashboard content */}
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* Dynamic header summary banner */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
          {/* Accent light decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 glow-mesh-1 opacity-60 pointer-events-none" />
          
          <div className="text-center sm:text-left z-10">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-indigo font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 animate-float" />
              Focus & Productivity
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-2">
              My Productivity Hub
            </h1>
            <p className="text-sm text-brand-grayText max-w-sm leading-relaxed">
              {totalCount === 0 
                ? "No tasks logged yet. Create your first item below to start ticking off goals!" 
                : `You have completed ${completedCount} of ${totalCount} active tasks for today. Keep up the momentum!`}
            </p>
          </div>

          <div className="shrink-0 z-10">
            <ProgressRing percentage={completionPercentage} size={110} strokeWidth={7} />
          </div>
        </section>

        {/* Quick Task Creation bar */}
        <section aria-labelledby="quick-add-heading">
          <h2 id="quick-add-heading" className="sr-only">Add a New Task</h2>
          <form onSubmit={handleQuickAdd} className="flex gap-3 mb-8 w-full">
            <input
              type="text"
              placeholder="⚡ Quick-add a task and press Enter..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 py-3.5 px-5 rounded-2xl text-slate-200 glass-input font-medium placeholder-slate-500 shadow-sm"
            />
            <button
              type="submit"
              onClick={handleQuickAdd}
              className="p-3.5 rounded-2xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold transition-all shadow-indigo-glow hover:shadow-[0_0_20px_rgba(99,102,241,0.55)] flex items-center justify-center shrink-0"
              title="Create Task"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </form>
        </section>

        {/* Filter controls panel */}
        <section aria-labelledby="tasklist-heading" className="glass-card rounded-2xl border border-white/5 p-4 sm:p-5 mb-6">
          <h2 id="tasklist-heading" className="sr-only">Your Task List</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl text-slate-200 glass-input"
              />
            </div>

            {/* Filter Pill Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Selector */}
              <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
                {['ALL', 'ACTIVE', 'COMPLETED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === status 
                        ? 'bg-brand-indigo text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Priority Selector */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-950/40 border border-white/5 text-xs rounded-xl py-2 pl-3 pr-8 text-slate-300 font-bold hover:border-brand-indigo transition-colors appearance-none cursor-pointer"
                >
                  <option value="ALL">Priority: All</option>
                  <option value="HIGH">High Only</option>
                  <option value="MEDIUM">Medium Only</option>
                  <option value="LOW">Low Only</option>
                </select>
                <Flag className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
              </div>

              {/* Category Selector */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950/40 border border-white/5 text-xs rounded-xl py-2 pl-3 pr-8 text-slate-300 font-bold hover:border-brand-indigo transition-colors appearance-none cursor-pointer"
                >
                  <option value="ALL">Category: All</option>
                  {uniqueCategories.filter(c => c !== 'ALL').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Folder className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

          </div>
        </section>

        {/* Task List container */}
        <section className="relative min-h-[250px]">
          {isTasksLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
              <div className="w-10 h-10 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold tracking-wider">Syncing database...</span>
            </div>
          ) : (
            <TaskList tasks={filteredTasks} onEditTask={openEditModal} />
          )}
        </section>

        {/* Footer citation signal */}
        <footer className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            &copy; 2026 Taskly — Built to help you stay organized and productive every day.
          </p>
        </footer>

      </main>

      {/* Floating Action Button (FAB) for mobile & desktop shortcuts */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-indigo hover:bg-indigo-600 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(99,102,241,0.55)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.7)] transition-all transform hover:scale-105 active:scale-95 z-30"
        title="Create detailed task"
      >
        <Plus className="w-8 h-8 stroke-[3]" />
      </button>

      {/* Full Task Editor Modal Container */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div 
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal content body */}
          <div className="relative z-10 glass-card rounded-3xl w-full max-w-lg border border-white/10 shadow-glass overflow-hidden animate-float">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="font-heading font-extrabold text-xl text-slate-100 flex items-center gap-2">
                <ClipboardList className="w-5.5 h-5.5 text-brand-indigo" />
                {editingTask ? 'Edit Task Specifications' : 'Draft New Task'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              
              {/* Title input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="What needs doing?"
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-slate-200 glass-input text-sm"
                  required
                />
              </div>

              {/* Description input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Description / Notes
                </label>
                <textarea
                  placeholder="Capture specific files, URLs, or requirements..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl text-slate-200 glass-input text-sm resize-none"
                />
              </div>

              {/* Meta config fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={modalForm.priority}
                      onChange={(e) => setModalForm({ ...modalForm, priority: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/5 text-sm rounded-xl py-2.5 pl-3 pr-8 text-slate-300 font-bold hover:border-brand-indigo transition-colors appearance-none cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <Flag className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Category tag */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Work, Health, Personal..."
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input text-sm font-bold placeholder-slate-600"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={modalForm.dueDate}
                      onChange={(e) => setModalForm({ ...modalForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 text-slate-200 glass-input text-sm font-bold cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/3 text-slate-300 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold text-sm shadow-indigo-glow transition-all"
                >
                  {editingTask ? 'Save Specifications' : 'Establish Task'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
