import { useStore } from '@nanostores/react';
import { sessionsStore, addSession } from '../lib/store';
import type { SkillArea } from '../lib/types';
import { useState } from 'react';

export default function StudyForm() {
  const [title, setTitle] = useState('');
  const [skillArea, setSkillArea] = useState<SkillArea>('Reading');
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [duration, setDuration] = useState('');
  const [exerciseCount, setExerciseCount] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('3');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSession({
      date: new Date().toISOString().split('T')[0],
      title,
      duration: parseInt(duration),
      skillArea,
      topic,
      source,
      notes,
      exerciseCount: parseInt(exerciseCount),
      confidenceLevel: parseInt(confidenceLevel),
    });
    setTitle('');
    setTopic('');
    setSource('');
    setDuration('');
    setExerciseCount('');
    setConfidenceLevel('3');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="size-8 bg-neon-yellow rounded flex items-center justify-center text-black">
          <span className="material-symbols-outlined font-bold">edit_note</span>
        </div>
        <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">Log Study Session</h2>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</span>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          placeholder="e.g., Present Perfect"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-primary" 
        />
      </label>
      
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skill Area</span>
        <select value={skillArea} onChange={(e) => setSkillArea(e.target.value as SkillArea)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary">
          <option value="Reading">Reading</option>
          <option value="Writing">Writing</option>
          <option value="Listening">Listening</option>
          <option value="Speaking">Speaking</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topics Covered</span>
        <input 
          type="text" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          required 
          placeholder="e.g., Usage with 'since' and 'for'"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-primary" 
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</span>
        <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration (min)</span>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required min="1" className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exercises</span>
          <input type="number" value={exerciseCount} onChange={(e) => setExerciseCount(e.target.value)} required min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence (1-5)</span>
        <input type="number" value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} required min="1" max="5" className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary resize-none" />
      </label>

      <button type="submit" className="flex items-center justify-center gap-2 px-4 py-3 rounded bg-primary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
        <span className="material-symbols-outlined text-sm">save</span>
        Save Session
      </button>
    </form>
  );
}
