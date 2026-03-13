import { useStore } from '@nanostores/react';
import { templatesStore, logsStore, loadTemplates, loadLogs, addLog } from '../lib/store';
import { useEffect, useState } from 'react';

export default function LogTime() {
  const templates = useStore(templatesStore);
  const logs = useStore(logsStore);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [duration, setDuration] = useState('');
  const [exerciseCount, setExerciseCount] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('3');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadTemplates();
    loadLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLog({
      templateId: selectedTemplate,
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(duration),
      exerciseCount: parseInt(exerciseCount),
      confidenceLevel: parseInt(confidenceLevel),
      notes,
    });
    setDuration('');
    setExerciseCount('');
    setConfidenceLevel('3');
    setNotes('');
  };

  const templateList = Object.values(templates);
  const selectedTemplateData = templates[selectedTemplate];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-primary mb-2">
        <span className="material-symbols-outlined text-sm">schedule</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Log Study Time</h3>
      </div>

      {templateList.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No sessions created yet. Create a session first!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Select Session</span>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} required className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 focus:outline-none focus:border-primary transition-colors">
              <option value="">Choose a session...</option>
              {templateList.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.skillArea})</option>
              ))}
            </select>
          </label>

          {selectedTemplateData && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded text-xs text-slate-400">
              <p><strong className="text-primary">Topics:</strong> {selectedTemplateData.topic}</p>
              <p className="mt-1"><strong className="text-primary">Source:</strong> {selectedTemplateData.source}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Duration</span>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required min="1" placeholder="min" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Exercises</span>
              <input type="number" value={exerciseCount} onChange={(e) => setExerciseCount(e.target.value)} required min="0" placeholder="0" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Confidence</span>
              <input type="number" value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} required min="1" max="5" placeholder="1-5" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="What did you learn today?" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none transition-colors" />
          </label>

          <button type="submit" className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity mt-2">
            Log Study Time
          </button>
        </form>
      )}
    </div>
  );
}
