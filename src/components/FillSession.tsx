import { useStore } from '@nanostores/react';
import { sessionsStore, logsStore, loadSessions, loadLogs, addLog, updateLog, deleteLog, updateSessionMetadata } from '../lib/store';
import { useEffect, useState } from 'react';

export default function FillSession() {
  const sessions = useStore(sessionsStore);
  const logs = useStore(logsStore);
  const [selectedSession, setSelectedSession] = useState('');
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editingSessionMeta, setEditingSessionMeta] = useState(false);
  const [topicsInput, setTopicsInput] = useState('');
  const [sourceInput, setSourceInput] = useState('');
  const [duration, setDuration] = useState('');
  const [exerciseCount, setExerciseCount] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('3');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [sessionExerciseCount, setSessionExerciseCount] = useState(0);

  useEffect(() => {
    loadSessions();
    loadLogs();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetch(`/api/exercises?sessionId=${selectedSession}`)
        .then(r => r.json())
        .then(data => setSessionExerciseCount(data.length));
    } else {
      setSessionExerciseCount(0);
    }
  }, [selectedSession]);

  // Auto-load most recent log when session is selected
  useEffect(() => {
    if (selectedSession) {
      const sessionLogs = Object.values(logs)
        .filter(l => l.sessionId === selectedSession)
        .sort((a, b) => b.date.localeCompare(a.date));
      
      if (sessionLogs.length > 0) {
        handleEdit(sessionLogs[0].id);
      } else {
        handleCancelEdit();
      }
    }
  }, [selectedSession, logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLog) {
      await updateLog(editingLog, {
        duration: parseInt(duration),
        exerciseCount: parseInt(exerciseCount),
        confidenceLevel: parseInt(confidenceLevel),
        notes,
      });
      setEditingLog(null);
    } else {
      await addLog({
        sessionId: selectedSession,
        date: new Date().toISOString().split('T')[0],
        duration: parseInt(duration),
        exerciseCount: parseInt(exerciseCount),
        confidenceLevel: parseInt(confidenceLevel),
        notes,
      });
    }
    
    setDuration('');
    setExerciseCount('');
    setConfidenceLevel('3');
    setNotes('');
    await loadLogs();
  };

  const handleEdit = (logId: string) => {
    const log = logs[logId];
    if (log) {
      setEditingLog(logId);
      setDuration(log.duration.toString());
      setExerciseCount(log.exerciseCount.toString());
      setConfidenceLevel(log.confidenceLevel.toString());
      setNotes(log.notes);
    }
  };

  const handleDelete = async (logId: string) => {
    if (confirm('Delete this log?')) {
      await deleteLog(logId);
    }
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setDuration('');
    setExerciseCount('');
    setConfidenceLevel('3');
    setNotes('');
  };

  const sessionList = Object.values(sessions)
    .filter(s => !filter || s.title.toLowerCase().includes(filter.toLowerCase()) || s.topics.some(t => t.toLowerCase().includes(filter.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.createdDate.localeCompare(a.createdDate);
    });
  
  const selectedSessionData = sessions[selectedSession];
  const selectedSessionLogs = Object.values(logs)
    .filter(l => l.sessionId === selectedSession)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleEditSessionMeta = () => {
    if (selectedSessionData) {
      setTopicsInput(selectedSessionData.topics.join(', '));
      setSourceInput(selectedSessionData.source);
      setEditingSessionMeta(true);
    }
  };

  const handleSaveSessionMeta = async () => {
    const topics = topicsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    await updateSessionMetadata(selectedSession, topics, sourceInput);
    setEditingSessionMeta(false);
  };

  const handleCancelSessionMeta = () => {
    setEditingSessionMeta(false);
    setTopicsInput('');
    setSourceInput('');
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSession) return;

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('sessionId', selectedSession);

    try {
      await fetch('/api/upload-pdf', { method: 'POST', body: formData });
      await loadSessions();
    } catch (error) {
      alert('Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession || !confirm('Delete this session and all its logs?')) return;
    
    await fetch('/api/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedSession })
    });
    
    setSelectedSession('');
    await loadSessions();
    await loadLogs();
  };

  const handleDeleteExercises = async () => {
    if (!selectedSession || !confirm('Delete all exercises for this session?')) return;
    await fetch('/api/exercises', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: selectedSession })
    });
    setSessionExerciseCount(0);
  };

  const goToExercises = () => {
    const tab = document.querySelector('[data-tab="exercises"]') as HTMLElement;
    tab?.click();
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Session List */}
      <div className="w-80 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Select Session</h2>
          <p className="text-sm text-slate-400 mb-4">Choose which session you studied</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
            className="flex-1 px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
            className="px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 focus:outline-none focus:border-primary"
          >
            <option value="recent">Recent</option>
            <option value="title">A-Z</option>
          </select>
        </div>

        {sessionList.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No sessions found</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {sessionList.map(s => {
              const logCount = Object.values(logs).filter(l => l.sessionId === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSession(s.id);
                    handleCancelEdit();
                    setEditingSessionMeta(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSession === s.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-black/40 border-primary/20 hover:border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-slate-100">{s.title}</p>
                    {logCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{logCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{s.skillArea}</p>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {s.topics.map((topic, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {topic}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">{s.createdDate}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Middle: Form */}
      <div className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-30">arrow_back</span>
              <p className="text-sm">Select a session to fill</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-100">
                  {selectedSessionData?.title}
                </h2>
                {editingLog && logs[editingLog] && (
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-mono">
                    Editing: {logs[editingLog].date}
                  </span>
                )}
                {!editingSessionMeta && (
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={handleEditSessionMeta}
                      className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                    >
                      Edit Session
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSession}
                      className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {editingSessionMeta ? (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded space-y-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Topics (comma-separated)</span>
                    <input
                      type="text"
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Source</span>
                    <input
                      type="text"
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveSessionMeta}
                      className="flex-1 px-3 py-1.5 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSessionMeta}
                      className="flex-1 px-3 py-1.5 bg-slate-700 text-white rounded text-[10px] font-bold uppercase hover:opacity-90"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded text-xs text-slate-400">
                  <p><strong className="text-primary">Skill:</strong> {selectedSessionData?.skillArea}</p>
                  <div className="mt-2">
                    <strong className="text-primary">Topics:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSessionData?.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2"><strong className="text-primary">Source:</strong> {selectedSessionData?.source}</p>
                  {selectedSessionData?.pdfPath && (
                    <p className="mt-2">
                      <strong className="text-primary">PDF:</strong>{' '}
                      <a href={selectedSessionData.pdfPath} target="_blank" className="text-primary hover:underline">
                        View PDF
                      </a>
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <label className="cursor-pointer inline-block px-3 py-1.5 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30">
                      {uploadingPdf ? 'Uploading...' : selectedSessionData?.pdfPath ? 'Replace PDF' : 'Upload PDF'}
                      <input type="file" accept=".pdf" onChange={handlePdfUpload} disabled={uploadingPdf} className="hidden" />
                    </label>
                    {sessionExerciseCount > 0 ? (
                      <>
                        <button type="button" onClick={goToExercises}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold uppercase hover:bg-green-500/30">
                          Exercises ({sessionExerciseCount})
                        </button>
                        <button type="button" onClick={handleDeleteExercises}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase hover:bg-red-500/30">
                          Delete Exercises
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-600 italic">No exercises — generate via Kiro CLI</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Duration (min)</span>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  min="1"
                  placeholder="45"
                  className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Exercises</span>
                <input
                  type="number"
                  value={exerciseCount}
                  onChange={(e) => setExerciseCount(e.target.value)}
                  required
                  min="0"
                  placeholder="10"
                  className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Confidence (1-5)</span>
                <input
                  type="number"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(e.target.value)}
                  required
                  min="1"
                  max="5"
                  placeholder="4"
                  className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="What did you learn today?"
                className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none"
              />
            </label>

            <div className="flex gap-2">
              {editingLog && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:opacity-90 transition-opacity"
              >
                {editingLog ? 'Update Log' : 'Save Study Log'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right: Recent Logs for Selected Session */}
      <div className="w-80 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-1">Recent Logs</h3>
          <p className="text-xs text-slate-500">For this session</p>
        </div>

        {!selectedSession ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-xs">Select a session</p>
          </div>
        ) : selectedSessionLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-xs">No logs yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {selectedSessionLogs.map(log => (
              <div key={log.id} className={`p-3 rounded-lg border text-xs ${
                editingLog === log.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-black/40 border-primary/20'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-primary">{log.date}</span>
                  <span className="font-bold text-slate-100">{log.duration}min</span>
                </div>
                <div className="flex gap-2 text-slate-500 mb-2">
                  <span>{log.exerciseCount} ex</span>
                  <span>•</span>
                  <span>Conf: {log.confidenceLevel}/5</span>
                </div>
                {log.notes && (
                  <p className="text-slate-400 text-xs italic border-l-2 border-primary/20 pl-2 mb-2">{log.notes}</p>
                )}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleEdit(log.id)}
                    className="flex-1 px-2 py-1 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="flex-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
