import { addSession } from '../lib/store';
import type { SkillArea } from '../lib/types';
import { useState } from 'react';

export default function StudyForm() {
  const [title, setTitle] = useState('');
  const [skillArea, setSkillArea] = useState<SkillArea>('Reading');
  const [topicsInput, setTopicsInput] = useState('');
  const [source, setSource] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const topics = topicsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    await addSession({ title, skillArea, topics, source });
    setTitle('');
    setTopicsInput('');
    setSource('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Session Title</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Present Perfect Tense" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
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
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Topics (comma-separated)</span>
        <input type="text" value={topicsInput} onChange={(e) => setTopicsInput(e.target.value)} required placeholder="e.g., grammar, present perfect, since/for" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Source</span>
        <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required placeholder="e.g., Cambridge Grammar in Use" className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" />
      </label>

      <button type="submit" className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity mt-2">
        Create Session
      </button>
    </form>
  );
}
