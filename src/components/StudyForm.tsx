import { addSession, sessionsStore, loadSessions } from '../lib/store';
import type { SkillArea } from '../lib/types';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';

export default function StudyForm() {
  const sessions = useStore(sessionsStore);
  const [title, setTitle] = useState('');
  const [skillArea, setSkillArea] = useState<SkillArea>('Reading');
  const [topicsInput, setTopicsInput] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const topics = topicsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    await addSession({ title, skillArea, topics, source });
    setTitle('');
    setTopicsInput('');
    setSource('');
  };

  // Get all unique tags from existing sessions
  const allTags = Array.from(
    new Set(
      Object.values(sessions).flatMap(s => s.topics)
    )
  ).sort();

  const tagCounts = Object.values(sessions).reduce((acc, s) => {
    s.topics.forEach(t => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Form */}
      <div className="flex-1">
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
      </div>

      {/* Right: Existing Tags */}
      <div className="w-80 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-1">Existing Tags</h3>
          <p className="text-xs text-slate-500">Click to copy, reuse to group sessions</p>
        </div>

        {allTags.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-xs">No tags yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tag);
                  }}
                  className="px-3 py-1.5 rounded bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors flex items-center gap-1"
                  title="Click to copy"
                >
                  {tag}
                  <span className="text-[10px] opacity-60">×{tagCounts[tag]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
