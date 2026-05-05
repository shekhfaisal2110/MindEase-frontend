// src/components/CopingCards/CreateEditModal.jsx
import React, { useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

const CreateEditModal = ({ editingCard, formData, setFormData, stepInput, setStepInput, categories, onClose, onSave }) => {
  const addStep = () => {
    if (stepInput.trim()) {
      setFormData(prev => ({ ...prev, steps: [...prev.steps, stepInput.trim()] }));
      setStepInput('');
    }
  };
  const removeStep = (idx) => setFormData(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">{editingCard ? 'Edit Card' : 'Create Coping Card'}</h2>
          <button onClick={onClose} className="p-1 touch-manipulation"><FaTimes size={24} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <input type="text" placeholder="Title *" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} className="w-full border rounded-xl p-2 text-sm" required />
          <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full border rounded-xl p-2 text-sm" required>
            <option value="">Select category *</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <textarea placeholder="When to use this card? *" value={formData.whenToUse} onChange={e => handleInputChange('whenToUse', e.target.value)} rows="2" className="w-full border rounded-xl p-2 text-sm" required />
          <div>
            <label className="block font-bold mb-1 text-sm">Steps (at least one) *</label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input type="text" value={stepInput} onChange={e => setStepInput(e.target.value)} placeholder="Add a step" className="flex-1 border rounded-xl p-2 text-sm" />
              <button type="button" onClick={addStep} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold">Add</button>
            </div>
            {formData.steps.map((step, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl mb-1 text-sm">
                <span className="break-words flex-1">{step}</span>
                <button type="button" onClick={() => removeStep(idx)} className="text-rose-500 p-1 rounded-full">✖</button>
              </div>
            ))}
          </div>
          <textarea placeholder="Why it helps (optional)" value={formData.whyItHelps} onChange={e => handleInputChange('whyItHelps', e.target.value)} rows="2" className="w-full border rounded-xl p-2 text-sm" />
          <textarea placeholder="Emergency note (optional)" value={formData.emergencyNote} onChange={e => handleInputChange('emergencyNote', e.target.value)} rows="2" className="w-full border rounded-xl p-2 text-sm" />
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.sharePublic} onChange={e => handleInputChange('sharePublic', e.target.checked)} id="sharePublic" />
            <label htmlFor="sharePublic">Submit this card to be considered for public sharing (admin approval required)</label>
          </div>
          <button type="submit" className="bg-indigo-600 text-white w-full py-2 rounded-xl font-bold text-sm">{editingCard ? 'Update' : 'Create'}</button>
        </form>
      </div>
    </div>
  );
};

CreateEditModal.displayName = 'CreateEditModal';
export default CreateEditModal;