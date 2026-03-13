import { addSession, addLog, loadSessions } from '../lib/store';
import type { SkillArea } from '../lib/types';
import { useState } from 'react';

export default function SimpleForm() {
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
    
    // Create session and log in one go
    const sessionData = { title, skillArea, topic, source };
    await addSession(sessionData);
    
    // Get the session ID (reload sessions to get the new one)
    await loadSessions();
    
    // For now, we'll use timestamp as ID since we just created it
    const sessionId = Date.now().toString();
    
    await addLog({
      sessionId,
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(duration),
      exerciseCount: parseInt(exerciseCount),
      confidenceLevel: parseInt(confidenceLevel),
      notes,
    });

    // Clear form
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
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Log Study Session</h2>
        <p className="text-sm text-slate-400">Fill in all details about your study session</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Session Title</span>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          placeholder="e.g., Present Perfect Tense"
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
        />
      </label>
      
      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Skill Area</span>
        <select 
          value={skillArea} 
          onChange={(e) => setSkillArea(e.target.value as SkillArea)} 
          required 
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 focus:outline-none focus:border-primary transition-colors"
        >
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
          placeholder="e.g., since/for, already/yet, just"
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Source</span>
        <input 
          type="text" 
          value={source} 
          onChange={(e) => setSource(e.target.value)} 
          required 
          placeholder="e.g., Cambridge Grammar in Use"
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
        />
      </label>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Duration (min)</span>
          <input 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            required 
            min="1" 
            placeholder="45"
            className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Exercises</span>
          <input 
            type="number" 
            value={exerciseCount} 
            onChange={(e) => setExerciseCount(e.target.value)} 
            required 
            min="0" 
            placeholder="10"
            className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Confidence (1-5)</span>
          <input 
            type="number" 
            value={confidenceLevel} 
            onChange={(e) => setConfidenceLevel(e.target.value)} 
            required 
            min="1" 
            max="5" 
            placeholder="4"
            className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" 
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Notes</span>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows={4} 
          placeholder="What did you learn today?"
          className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none transition-colors" 
        />
      </label>

      <button 
        type="submit" 
        className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity mt-2"
      >
        Save Study Session
      </button>
    </form>
  );
}
