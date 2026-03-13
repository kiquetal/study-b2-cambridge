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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Title</span>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          placeholder="e.g., Present Perfect"
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
        />
      </label>
      
      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Skill Area</span>
        <select value={skillArea} onChange={(e) => setSkillArea(e.target.value as SkillArea)} required className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 focus:outline-none focus:border-primary transition-colors">
          <option value="Reading">Reading</option>
          <option value="Writing">Writing</option>
          <option value="Listening">Listening</option>
          <option value="Speaking">Speaking</option>
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Topics Covered</span>
        <input 
          type="text" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          required 
          placeholder="e.g., Usage with 'since' and 'for'"
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Source</span>
        <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required placeholder="e.g., Cambridge Grammar in Use" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
      </label>

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
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Additional observations..." className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none transition-colors" />
      </label>

      <button type="submit" className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity mt-2">
        Commit Session
      </button>
    </form>
  );
}
