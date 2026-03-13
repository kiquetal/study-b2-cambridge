import { useStore } from '@nanostores/react';
import { sessionsStore, addSession } from '../lib/store';
import type { SkillArea } from '../lib/types';
import { useState } from 'react';

export default function StudyForm() {
  const [skillArea, setSkillArea] = useState<SkillArea>('Reading');
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [duration, setDuration] = useState('');
  const [exerciseCount, setExerciseCount] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('3');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(duration),
      skillArea,
      topic,
      source,
      notes,
      exerciseCount: parseInt(exerciseCount),
      confidenceLevel: parseInt(confidenceLevel),
    });
    setTopic('');
    setSource('');
    setDuration('');
    setExerciseCount('');
    setConfidenceLevel('3');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
      <h2>Log Study Session</h2>
      
      <label>
        Skill Area:
        <select value={skillArea} onChange={(e) => setSkillArea(e.target.value as SkillArea)} required>
          <option value="Reading">Reading</option>
          <option value="Writing">Writing</option>
          <option value="Listening">Listening</option>
          <option value="Speaking">Speaking</option>
        </select>
      </label>

      <label>
        Topic:
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
      </label>

      <label>
        Source:
        <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required />
      </label>

      <label>
        Duration (minutes):
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required min="1" />
      </label>

      <label>
        Exercises Completed:
        <input type="number" value={exerciseCount} onChange={(e) => setExerciseCount(e.target.value)} required min="0" />
      </label>

      <label>
        Confidence Level (1-5):
        <input type="number" value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} required min="1" max="5" />
      </label>

      <label>
        Notes:
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </label>

      <button type="submit" style={{ padding: '10px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Save Session
      </button>
    </form>
  );
}
