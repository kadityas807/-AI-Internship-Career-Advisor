'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Github, Loader2, CheckCircle2, X, ChevronRight, Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Repo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  languages: string[];
  topics: string[];
  updatedAt: string;
}

export default function GitHubImport() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async () => {
    if (!username.trim()) return;
    setFetching(true);
    setError(null);
    setRepos([]);
    setSelected(new Set());
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github/repos/${username.trim()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'GitHub user not found');
      }
      const data = await res.json();
      if (!data.repos?.length) throw new Error('No public repositories found');
      setRepos(data.repos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const importSelected = async () => {
    if (!user || selected.size === 0) return;
    setImporting(true);
    try {
      const toImport = repos.filter(r => selected.has(r.id));
      for (const repo of toImport) {
        const techStack = [...new Set([...repo.languages, ...repo.topics])].slice(0, 8);
        await addDoc(collection(db, 'users', user.uid, 'projects'), {
          uid: user.uid,
          title: repo.name,
          description: repo.description || `GitHub repository by ${username}`,
          techStack,
          githubUrl: repo.url,
          stars: repo.stars,
          source: 'github',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setImported(true);
      setTimeout(() => {
        setIsOpen(false);
        setImported(false);
        setRepos([]);
        setUsername('');
        setSelected(new Set());
      }, 1800);
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-full font-medium hover:bg-slate-700 transition-colors shadow-sm text-sm"
      >
        <Github className="w-4 h-4" />
        Import from GitHub
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                      <Github className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Import from GitHub</h2>
                      <p className="text-xs text-slate-500">Auto-detect your tech stack</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 mt-5">
                  <div className="relative flex-1">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && fetchRepos()}
                      placeholder="GitHub username"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm bg-slate-50"
                    />
                  </div>
                  <button
                    onClick={fetchRepos}
                    disabled={fetching || !username.trim()}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Fetch
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              {repos.length > 0 && (
                <div className="max-h-72 overflow-y-auto">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{repos.length} repositories</span>
                    <button
                      onClick={() => setSelected(new Set(repos.map(r => r.id)))}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Select all
                    </button>
                  </div>
                  {repos.map(repo => {
                    const isSelected = selected.has(repo.id);
                    const langs = [...new Set([...repo.languages, ...repo.topics])].slice(0, 4);
                    return (
                      <div
                        key={repo.id}
                        onClick={() => toggleSelect(repo.id)}
                        className={`flex items-start gap-3 px-5 py-4 cursor-pointer border-b border-slate-100 transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm truncate">{repo.name}</span>
                            {repo.stars > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-amber-600 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{repo.stars}
                              </span>
                            )}
                          </div>
                          {repo.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{repo.description}</p>}
                          {langs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {langs.map(l => (
                                <span key={l} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">{l}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {repos.length > 0 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">{selected.size} selected</span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={importSelected}
                    disabled={selected.size === 0 || importing || imported}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      imported
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
                    }`}
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : imported ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {imported ? 'Imported!' : importing ? 'Importing...' : `Import ${selected.size} Project${selected.size !== 1 ? 's' : ''}`}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
