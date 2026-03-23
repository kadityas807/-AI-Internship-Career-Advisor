'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Search, MapPin, Building2, ExternalLink, BookmarkPlus, Loader2, Sparkles, AlertCircle, BriefcaseIcon, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  created: string;
  redirect_url: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [role, setRole] = useState('software intern');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  // Pre-fill role from user's skills
  useEffect(() => {
    if (!user) return;
    const fetchSkills = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'skills'));
        const skills = snap.docs.map(d => d.data().name as string).slice(0, 5);
        if (skills.length > 0) {
          setSkillSuggestions(skills);
        }
      } catch {}
    };
    fetchSkills();
  }, [user]);

  const searchJobs = async () => {
    setLoading(true);
    setError(null);
    setNotConfigured(false);
    setSearched(true);
    try {
      const params = new URLSearchParams({ role, location });
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs?${params.toString()}`);

      // Guard: always check content-type before parsing JSON to avoid rendering raw HTML
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setNotConfigured(true);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'ADZUNA_NOT_CONFIGURED') {
          setNotConfigured(true);
          return;
        }
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      if (data.error === 'ADZUNA_NOT_CONFIGURED') {
        setNotConfigured(true);
        return;
      }

      setJobs(data.results || []);
      setTotalCount(data.count || 0);
    } catch (e: any) {
      setError(e.message || 'Failed to load jobs. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const saveToTracker = async (job: Job) => {
    if (!user) return;
    setSavingJobId(job.id);
    try {
      const appId = uuidv4();
      await setDoc(doc(db, 'users', user.uid, 'applications', appId), {
        uid: user.uid,
        company: job.company,
        role: job.title,
        status: 'Draft',
        applicationDate: new Date().toISOString().split('T')[0],
        notes: `Found via Job Board\n${job.redirect_url}\n\n${job.description?.slice(0, 200)}...`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSavedJobIds(prev => new Set([...prev, job.id]));
    } catch (e) {
      console.error('Error saving job:', e);
    } finally {
      setSavingJobId(null);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `from ${fmt(min)}`;
    return `up to ${fmt(max!)}`;
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <BriefcaseIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Job Board</h1>
            <p className="text-slate-500 mt-1">Discover real internships & jobs matched to your skills.</p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchJobs()}
              placeholder="Role (e.g. frontend intern, data scientist)"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-slate-50"
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchJobs()}
              placeholder="Location (e.g. London)"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-slate-50"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={searchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </motion.button>
        </div>

        {/* Skill suggestions */}
        {skillSuggestions.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3" />From your skills:</span>
            {skillSuggestions.map(s => (
              <button
                key={s}
                onClick={() => setRole(`${s} intern`)}
                className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Not Configured Banner */}
      {notConfigured && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4"
        >
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Adzuna API Not Configured</h3>
            <p className="text-sm text-amber-800">
              To enable live job listings, register for a free API key at{' '}
              <a href="https://developer.adzuna.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                developer.adzuna.com
              </a>{' '}
              (no credit card required), then add <code className="bg-amber-100 px-1 rounded">ADZUNA_APP_ID</code> and{' '}
              <code className="bg-amber-100 px-1 rounded">ADZUNA_APP_KEY</code> to <code className="bg-amber-100 px-1 rounded">backend/.env</code>.
            </p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="h-16 bg-slate-100 rounded mb-4" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && jobs.length === 0 && !notConfigured && !error && (
        <div className="text-center py-16 text-slate-400">
          <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try a different role or location</p>
        </div>
      )}

      {!loading && searched && jobs.length > 0 && (
        <div className="mb-4 text-sm text-slate-500">
          Found <strong>{totalCount.toLocaleString()}</strong> jobs · showing top {jobs.length}
        </div>
      )}

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, i) => {
            const salary = formatSalary(job.salaryMin, job.salaryMax);
            const isSaved = savedJobIds.has(job.id);
            const isSaving = savingJobId === job.id;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight">{job.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shrink-0"
                    title="Open job listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {job.location && (
                    <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                  )}
                  {salary && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                      <DollarSign className="w-3 h-3" />{salary}
                    </span>
                  )}
                  {job.created && (
                    <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(job.created), { addSuffix: true })}
                    </span>
                  )}
                </div>

                {job.description && (
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{job.description}</p>
                )}

                <button
                  onClick={() => saveToTracker(job)}
                  disabled={isSaved || isSaving}
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSaved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  } disabled:opacity-60`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <>✓ Saved to Tracker</>
                  ) : (
                    <><BookmarkPlus className="w-4 h-4" /> Save to Tracker</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Pre-search state */}
      {!searched && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Search for your next opportunity</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">Enter a role above to discover live internship and job listings from thousands of companies.</p>
        </motion.div>
      )}
    </AppLayout>
  );
}
