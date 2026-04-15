import React from 'react';

const TaskCard = ({ task, onToggleComplete, onDelete }) => {
  const priorityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return (
    <div 
      className={`
        group relative bg-white rounded-2xl p-5 transition-all duration-300 border-2
        ${task.completed 
          ? 'border-transparent bg-gray-50/50 opacity-80' 
          : isOverdue ? 'border-rose-100 shadow-md' : 'border-slate-50 shadow-sm hover:shadow-md hover:border-indigo-100'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Custom Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <label className="relative flex items-center justify-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => onToggleComplete(task._id, !task.completed)} 
              className="peer sr-only" 
            />
            <div className="w-6 h-6 border-2 border-slate-200 rounded-lg transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center">
              <svg 
                className={`w-4 h-4 text-white transition-transform duration-300 ${task.completed ? 'scale-100' : 'scale-0'}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </label>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={`text-base font-bold truncate transition-all ${
              task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}>
              {task.title}
            </h3>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className={`text-sm leading-relaxed mb-3 line-clamp-2 ${
              task.completed ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {task.description}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center space-x-4">
            {dueDate && (
              <div className={`flex items-center text-xs font-semibold ${
                isOverdue ? 'text-rose-500' : 'text-slate-400'
              }`}>
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isOverdue ? `Overdue • ${dueDate}` : dueDate}
              </div>
            )}
          </div>
        </div>

        {/* Delete Action - Visible on Hover (Desktop) / Always (Mobile) */}
        <button 
          onClick={() => onDelete(task._id)} 
          className="flex-shrink-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
          aria-label="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;