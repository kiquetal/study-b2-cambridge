import { useState, useEffect } from 'react';
import type { PhrasalVerb } from '../lib/types';

export default function PhrasalVerbs() {
  const [verbs, setVerbs] = useState<PhrasalVerb[]>([]);
  const [verb, setVerb] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadVerbs();
  }, []);

  const loadVerbs = async () => {
    const res = await fetch('/api/phrasal-verbs');
    setVerbs(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/phrasal-verbs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verb, meaning, example })
    });
    setVerb('');
    setMeaning('');
    setExample('');
    await loadVerbs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this phrasal verb?')) return;
    await fetch('/api/phrasal-verbs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    await loadVerbs();
  };

  const filteredVerbs = verbs.filter(v => 
    !filter || 
    v.verb.toLowerCase().includes(filter.toLowerCase()) || 
    v.meaning.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Form */}
      <div className="w-96 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <span className="material-symbols-outlined text-sm">book</span>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Add Phrasal Verb</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Phrasal Verb</span>
            <input
              type="text"
              value={verb}
              onChange={(e) => setVerb(e.target.value)}
              required
              placeholder="e.g., look up"
              className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Meaning</span>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              placeholder="e.g., to search for information"
              className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1 flex-1">
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Example</span>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              required
              rows={4}
              placeholder="e.g., I need to look up this word in the dictionary."
              className="w-full px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none"
            />
          </label>

          <button
            type="submit"
            className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:opacity-90 transition-opacity"
          >
            Add Phrasal Verb
          </button>
        </form>
      </div>

      {/* Right: List */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-sm">list</span>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">My Phrasal Verbs ({filteredVerbs.length})</h3>
          </div>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
            className="w-64 px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
          />
        </div>

        {filteredVerbs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inbox</span>
            <p className="text-sm">No phrasal verbs yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {filteredVerbs.map(v => (
              <div key={v.id} className="p-5 rounded-lg bg-black/60 border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-2xl text-primary uppercase tracking-tight">{v.verb}</h4>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-slate-300 mb-3 font-medium">{v.meaning}</p>
                <p className="text-xs text-slate-400 italic border-l-2 border-primary/20 pl-3">"{v.example}"</p>
                <p className="text-[10px] text-slate-600 mt-3 font-mono">{new Date(v.createdDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
