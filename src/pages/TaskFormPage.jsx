import React from 'react';
import * as Yup from 'yup';
import FormikForm from '../components/FormikForm';
import api from '../services/api';

const TaskForm = ({ onTaskAdded }) => {
  const initialValues = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('A title is required').min(3, 'Title is too short'),
    description: Yup.string(),
    priority: Yup.string().oneOf(['low', 'medium', 'high']),
    dueDate: Yup.date()
      .nullable()
      .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Date cannot be in the past'),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await api.post('/tasks', values);
      if (onTaskAdded) onTaskAdded(res.data);
      resetForm(); // Clear form after success

      // ✅ Global storage: activity points added directly to backend
      try {
        await api.post('/activity/add', { actionType: 'dailyTask', points: 3 });
        console.log('✅ +3 points for creating a new task');
      } catch (activityErr) {
        console.error('Failed to add activity points:', activityErr);
      }

      return res.data;
    } catch (err) {
      console.error("Task creation failed", err);
      throw err; // FormikForm can handle the error message
    }
  };

  const fields = [
    { 
      name: 'title', 
      label: 'Task Title', 
      type: 'text', 
      placeholder: 'What needs to be done?', 
      required: true 
    },
    { 
      name: 'description', 
      label: 'Notes & Details', 
      type: 'textarea', 
      placeholder: 'Add any extra context here...', 
      rows: 3 
    },
    { 
      name: 'priority', 
      label: 'Set Priority', 
      type: 'select', 
      options: [
        { value: 'low', label: '🟢 Low Priority' },
        { value: 'medium', label: '🟡 Medium Priority' },
        { value: 'high', label: '🔴 High Priority' },
      ] 
    },
    { 
      name: 'dueDate', 
      label: 'Deadline', 
      type: 'date' 
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Form Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">New Task</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace / Personal</p>
            </div>
          </div>
        </div>

        {/* Formik Wrapper */}
        <div className="p-6 md:p-10">
          <div className="task-form-custom-styles">
            <FormikForm
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              fields={fields}
              submitLabel="Create Task"
              successMessage="Task captured successfully!"
            />
          </div>
        </div>

        {/* Footer Hint */}
        <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-50">
          <p className="text-xs text-slate-400 text-center font-medium">
            <span className="mr-1">💡</span>
            Tasks with high priority will be pinned to the top of your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;