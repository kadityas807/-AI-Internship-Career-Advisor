'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Plus, Trash2, Edit2, Building2, BrainCircuit, Loader2, ExternalLink, Code2, Github, Linkedin, Trophy, BookOpen, Globe, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';

// ── Platform definitions ──────────────────────────────────────────────────────
const PLATFORMS = [
  { key: 'leetcode',     label: 'LeetCode',     color: 'bg-orange-50 border-orange-200',   iconColor: 'text-orange-500',   placeholder: 'https://leetcode.com/u/yourname',    icon: Code2 },
  { key: 'hackerrank',   label: 'HackerRank',   color: 'bg-green-50 border-green-200',     iconColor: 'text-green-600',    placeholder: 'https://hackerrank.com/yourname',    icon: Trophy },
  { key: 'hackerearth',  label: 'HackerEarth',  color: 'bg-purple-50 border-purple-200',   iconColor: 'text-purple-600',   placeholder: 'https://hackerearth.com/@yourname',  icon: Trophy },
  { key: 'github',       label: 'GitHub',       color: 'bg-slate-50 border-slate-300',     iconColor: 'text-slate-800',    placeholder: 'https://github.com/yourname',        icon: Github },
  { key: 'linkedin',     label: 'LinkedIn',     color: 'bg-blue-50 border-blue-200',       iconColor: 'text-blue-600',     placeholder: 'https://linkedin.com/in/yourname',   icon: Linkedin },
  { key: 'codechef',     label: 'CodeChef',     color: 'bg-amber-50 border-amber-200',     iconColor: 'text-amber-700',    placeholder: 'https://codechef.com/users/yourname', icon: Code2 },
  { key: 'codeforces',   label: 'Codeforces',   color: 'bg-red-50 border-red-200',         iconColor: 'text-red-600',      placeholder: 'https://codeforces.com/profile/yourname', icon: Code2 },
  { key: 'geeksforgeeks',label: 'GeeksForGeeks',color: 'bg-green-50 border-green-300',     iconColor: 'text-green-700',    placeholder: 'https://geeksforgeeks.org/user/yourname', icon: BookOpen },
  { key: 'portfolio',    label: 'Portfolio',    color: 'bg-indigo-50 border-indigo-200',   iconColor: 'text-indigo-600',   placeholder: 'https://yourportfolio.com',          icon: Globe },
];

// ── Live Stats Subcomponent ──────────────────────────────────────────────────
const extractUsername = (url: string, key: string) => {
  try {
    const cleanUrl = url.trim().replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    let lastPart = parts[parts.length - 1];

    if (key === 'leetcode') return cleanUrl.includes('/u/') ? cleanUrl.split('/u/')[1] : lastPart;
    if (key === 'codechef') return cleanUrl.includes('/users/') ? cleanUrl.split('/users/')[1] : lastPart;
    if (key === 'codeforces') return cleanUrl.includes('/profile/') ? cleanUrl.split('/profile/')[1] : lastPart;
    if (key === 'hackerearth') return lastPart.replace('@', '');
    
    return lastPart;
  } catch { return null; }
};

const LiveStats = ({ platform, url }: { platform: string, url: string }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const username = extractUsername(url, platform);
      if (!username) { setLoading(false); return; }

      try {
        if (platform === 'github') {
          const res = await fetch(`https://api.github.com/users/${username}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) setStats({ repos: data.public_repos, followers: data.followers });
          }
        } else if (platform === 'leetcode') {
          const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && isMounted) {
              setStats({ solved: data.totalSolved, easy: data.easySolved, medium: data.mediumSolved, hard: data.hardSolved });
            }
          }
        } else if (platform === 'codeforces') {
          const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'OK' && isMounted) {
              setStats({ rating: data.result[0].rating, rank: data.result[0].rank });
            }
          }
        }
      } catch (e) {
        console.error(`Failed to fetch ${platform} stats`, e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [platform, url]);

  if (loading) return <div className="h-4 w-12 bg-slate-200/50 animate-pulse rounded mt-2"></div>;
  if (!stats) return null;

  return (
    <div className="mt-2 text-xs flex flex-wrap gap-1.5 focus:outline-none select-none">
      {platform === 'github' && (
        <>
          <span className="bg-white text-slate-700 px-2 py-1 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200"><strong>{stats.repos}</strong> repos</span>
          <span className="bg-white text-slate-700 px-2 py-1 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200"><strong>{stats.followers}</strong> followers</span>
        </>
      )}
      {platform === 'leetcode' && (
        <div className="flex flex-col gap-1.5 w-full">
          <span className="bg-white text-orange-700 px-2 py-1 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-orange-200 inline-block w-max"><strong>{stats.solved}</strong> solved</span>
          <div className="flex gap-0.5 w-full mt-1">
            <div title="Easy" className="h-1.5 bg-emerald-400 rounded-l-full" style={{ width: `${(stats.easy / stats.solved) * 100}%` }}></div>
            <div title="Medium" className="h-1.5 bg-amber-400" style={{ width: `${(stats.medium / stats.solved) * 100}%` }}></div>
            <div title="Hard" className="h-1.5 bg-rose-500 rounded-r-full" style={{ width: `${(stats.hard / stats.solved) * 100}%` }}></div>
          </div>
        </div>
      )}
      {platform === 'codeforces' && (
        <div className="w-full">
          <span className="bg-white text-red-700 px-2 py-1 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-red-200 inline-block mb-1 w-max">Rating: <strong>{stats.rating || 'N/A'}</strong></span>
          <span className="bg-white text-red-700 px-2 py-1 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-red-200 font-medium capitalize w-max block truncate max-w-full">{stats.rank || 'Unranked'}</span>
        </div>
      )}
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { user } = useAuth();

  // ── Job Applications ────────────────────────────────────────────────────────
  const [apps, setApps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailText, setEmailText] = useState('');
  const [isScanningEmail, setIsScanningEmail] = useState(false);
  const [emailScanResult, setEmailScanResult] = useState<any>(null);
  const [analyzingAppId, setAnalyzingAppId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [formData, setFormData] = useState({ id: '', company: '', role: '', status: 'Draft', applicationDate: '', notes: '' });

  // ── Platform Profiles ───────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [profileInput, setProfileInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Load job applications
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'applications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const dateA = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
        const dateB = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
        return dateB - dateA;
      });
      setApps(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/applications`);
    });
    return () => unsubscribe();
  }, [user]);

  // Load platform profiles
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'fingerprint', 'platform_profiles'), (snap) => {
      if (snap.exists()) setProfiles(snap.data() as Record<string, string>);
    }, (error) => {
      console.error('Error fetching profiles:', error);
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/fingerprint/platform_profiles`);
    });
    return () => unsubscribe();
  }, [user]);

  const saveProfile = async (key: string) => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'fingerprint', 'platform_profiles'), {
        [key]: profileInput.trim(),
      }, { merge: true });
      setEditingProfile(null);
      setProfileInput('');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Failed to save profile: ${error.message}`);
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/fingerprint/platform_profiles`);
    } finally {
      setSavingProfile(false);
    }
  };

  const removeProfile = async (key: string) => {
    if (!user) return;
    const updated = { ...profiles };
    delete updated[key];
    try {
      await setDoc(doc(db, 'users', user.uid, 'fingerprint', 'platform_profiles'), { [key]: '' }, { merge: true });
      setProfiles(prev => { const next = { ...prev }; delete next[key]; return next; });
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      alert(`Failed to remove profile: ${error.message}`);
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/fingerprint/platform_profiles`);
    }
  };

  // ── Job application handlers ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const appId = formData.id || uuidv4();
    const appRef = doc(db, 'users', user.uid, 'applications', appId);
    try {
      await setDoc(appRef, {
        uid: user.uid,
        company: formData.company,
        role: formData.role,
        status: formData.status,
        applicationDate: formData.applicationDate || null,
        notes: formData.notes,
        createdAt: formData.id ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setIsModalOpen(false);
      setFormData({ id: '', company: '', role: '', status: 'Draft', applicationDate: '', notes: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/applications/${appId}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'applications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/applications/${id}`);
    }
  };

  const openEditModal = (app: any) => {
    setFormData({ id: app.id, company: app.company, role: app.role, status: app.status, applicationDate: app.applicationDate || '', notes: app.notes || '' });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-700';
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'Interviewing': return 'bg-amber-100 text-amber-700';
      case 'Offer': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Ghosted': return 'bg-slate-200 text-slate-600';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const analyzeRejection = async (app: any) => {
    if (!user) return;
    setAnalyzingAppId(app.id);
    setIsAnalysisModalOpen(true);
    setAnalysisResult(null);
    try {
      const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
      const skills = skillsSnap.docs.map(d => d.data().name);
      const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
      const projects = projectsSnap.docs.map(d => ({ title: d.data().title, description: d.data().description }));
      const prompt = `You are a career coach. The user applied for ${app.role} at ${app.company} and was ${app.status.toLowerCase()}. Notes: ${app.notes || 'None'}. Skills: ${skills.join(', ')}. Projects: ${JSON.stringify(projects)}. Diagnose the likely reason, what should have been done differently, and a concrete actionable fix.`;
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'OBJECT',
            properties: {
              likelyReason: { type: 'STRING' },
              whatShouldHaveBeenDone: { type: 'STRING' },
              actionableFix: { type: 'STRING' }
            },
            required: ['likelyReason', 'whatShouldHaveBeenDone', 'actionableFix']
          }
        })
      });

      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      const data = JSON.parse(text || '{}');
      setAnalysisResult(data);
      await setDoc(doc(db, 'users', user.uid, 'applications', app.id), { analysis: data }, { merge: true });
    } catch (error) {
      console.error('Error analyzing rejection:', error);
      setAnalysisResult({ error: 'Failed to analyze rejection.' });
    } finally {
      setAnalyzingAppId(null);
    }
  };

  const scanEmail = async () => {
    if (!user || !emailText.trim()) return;
    setIsScanningEmail(true);
    setEmailScanResult(null);
    try {
      const trackedApps = apps.map(app => ({ id: app.id, company: app.company, role: app.role }));
      
      const prompt = `
        You are an autonomous AI recruiter agent. 
        Read the following email received by the candidate:
        "${emailText}"

        The candidate is currently tracking these applications:
        ${JSON.stringify(trackedApps)}

        Analyze the email.
        1. Does it match the company of any tracked application? If so, output the matchedId. If it represents a new company not in the list, set matchedId to null.
        2. What is the new status of this application? Choose EXACTLY one of: "Interviewing", "Offer", "Rejected", "Ghosted", "Applied".
        3. Extract the company Name.
        4. Write a 1-sentence summary of the email (e.g., "Invited to next technical screening round").
      `;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'OBJECT',
            properties: {
              companyName: { type: 'STRING' },
              matchedId: { type: 'STRING', description: 'The UUID from the tracked applications list, or null if no match.' },
              newStatus: { type: 'STRING' },
              summary: { type: 'STRING' }
            },
            required: ['companyName', 'newStatus', 'summary']
          }
        })
      });

      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      const data = JSON.parse(text || '{}');
      
      if (data.matchedId && apps.find(a => a.id === data.matchedId)) {
        await setDoc(doc(db, 'users', user.uid, 'applications', data.matchedId), {
          status: data.newStatus,
          notes: data.summary,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setEmailScanResult({ ...data, action: 'updated' });
      } else {
        setEmailScanResult({ error: `No matching application found in your tracker for ${data.companyName || 'this company'}.` });
      }
    } catch (e) {
      console.error(e);
      setEmailScanResult({ error: 'Failed to scan email. Please try again.' });
    } finally {
      setIsScanningEmail(false);
    }
  };

  return (
    <AppLayout>
      {/* ── Platform Profiles Section ────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Platform Profiles</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track your coding and professional profiles in one place.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const url = profiles[p.key];
            const isEditing = editingProfile === p.key;

            return (
              <div key={p.key} className={`relative rounded-2xl border p-4 flex flex-col gap-3 transition-all ${p.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${p.iconColor}`} />
                    <span className="text-sm font-semibold text-slate-800">{p.label}</span>
                  </div>
                  {url && !isEditing && (
                    <div className="flex gap-1">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => removeProfile(p.key)} className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-white transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <input
                      autoFocus
                      type="url"
                      value={profileInput}
                      onChange={e => setProfileInput(e.target.value)}
                      placeholder={p.placeholder}
                      className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => saveProfile(p.key)}
                        disabled={savingProfile || !profileInput.trim()}
                        className="flex-1 text-xs py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {savingProfile ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingProfile(null); setProfileInput(''); }}
                        className="flex-1 text-xs py-1.5 bg-white text-slate-600 rounded-lg font-medium hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : url ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-500 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => { setEditingProfile(p.key); setProfileInput(url); }}>
                      {url.replace(/^https?:\/\//, '')}
                    </p>
                    <LiveStats platform={p.key} url={url} />
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingProfile(p.key); setProfileInput(''); }}
                    className="text-xs text-slate-400 hover:text-indigo-600 transition-colors text-left flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add profile
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Job Applications Section ─────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Application Tracker</h2>
          <p className="text-slate-500 text-sm mt-0.5">Log your job applications and track your progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEmailText(''); setEmailScanResult(null); setIsEmailModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm"
          >
            <Mail className="w-4 h-4" /> Scan Email Update
          </button>
          <button
            onClick={() => {
              setFormData({ id: '', company: '', role: '', status: 'Draft', applicationDate: new Date().toISOString().split('T')[0], notes: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Company</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Role</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-900">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{app.role}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {app.applicationDate ? format(new Date(app.applicationDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No applications tracked yet. Click <strong>+ Add Application</strong> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add/Edit Application Modal ───────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{formData.id ? 'Edit Application' : 'Add Application'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none" placeholder="e.g. Google, Startup Inc" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input required type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none" placeholder="e.g. Frontend Intern" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none">
                    <option value="Draft">Draft</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Ghosted">Ghosted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={formData.applicationDate} onChange={e => setFormData({ ...formData, applicationDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none h-24 resize-none" placeholder="Interviewer names, next steps, feedback..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rejection Analysis Modal ─────────────────────────────────────────── */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-indigo-500" /> Rejection Analysis
              </h2>
              <button onClick={() => setIsAnalysisModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            {analyzingAppId ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-slate-600">Analyzing application and profile...</p>
              </div>
            ) : analysisResult?.error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">{analysisResult.error}</div>
            ) : analysisResult ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Likely Reason</h3>
                  <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">{analysisResult.likelyReason}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">What Should Have Been Done</h3>
                  <p className="text-slate-800 bg-indigo-50 p-4 rounded-lg border border-indigo-100">{analysisResult.whatShouldHaveBeenDone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Actionable Fix</h3>
                  <p className="text-slate-800 bg-emerald-50 p-4 rounded-lg border border-emerald-100">{analysisResult.actionableFix}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Email Parser Modal ─────────────────────────────────────────────── */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-6 h-6 text-indigo-500" /> AI Email Scanner
              </h2>
              <button disabled={isScanningEmail} onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            {!emailScanResult ? (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  Paste an email from a recruiter (like a rejection, interview invite, or offer letter). The AI will autonomously read it, find the matching application, and update its status instantly.
                </p>
                <textarea
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                  placeholder="Dear candidate, we are thrilled to offer you..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-48 resize-none mb-6 text-sm bg-slate-50/50"
                  disabled={isScanningEmail}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsEmailModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors" disabled={isScanningEmail}>Cancel</button>
                  <button onClick={scanEmail} disabled={isScanningEmail || !emailText.trim()} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 group">
                    {isScanningEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {isScanningEmail ? 'Scanning Inbox...' : 'Scan & Update Database'}
                  </button>
                </div>
              </>
            ) : emailScanResult.error ? (
               <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
                 {emailScanResult.error}
                 <button onClick={() => setEmailScanResult(null)} className="mt-4 block mx-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-red-200">Try Again</button>
               </div>
            ) : emailScanResult.newStatus === 'Offer' ? (
               <div className="p-8 bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500 text-amber-950 rounded-2xl border-2 border-yellow-300 text-center shadow-xl relative overflow-hidden">
                 <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: [0, 1.2, 1], rotate: [0, -10, 10, 0] }} 
                    transition={{ duration: 0.6 }}
                    className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/50 text-white"
                 >
                   <Trophy className="w-12 h-12" />
                 </motion.div>
                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                   <h3 className="text-3xl font-black mb-2 tracking-tight text-white drop-shadow-md">CONGRATULATIONS! 🎉</h3>
                   <p className="text-xl font-bold mb-6 text-yellow-900">You received an offer from {emailScanResult.companyName}!</p>
                   
                   <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/40 inline-block text-left relative overflow-hidden shadow-sm">
                     <p className="text-amber-950 font-medium z-10 relative">"{emailScanResult.summary}"</p>
                   </div>
                   
                   <p className="text-sm text-yellow-800 font-semibold mt-6 max-w-sm mx-auto opacity-80 uppercase tracking-widest">Database Automatically Updated</p>
                   <button onClick={() => setIsEmailModalOpen(false)} className="mt-6 px-10 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 border border-orange-100">Claim Victory</button>
                 </motion.div>
               </div>
            ) : (
               <div className="p-8 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 text-center shadow-inner">
                 <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200 text-emerald-600">
                   <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-bold mb-4">Database {emailScanResult.action === 'updated' ? 'Updated' : 'Created'}!</h3>
                 <div className="bg-white p-4 rounded-xl border border-emerald-100 inline-block text-left relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                   <p className="text-slate-800 mb-1 pl-2"><strong>Company:</strong> {emailScanResult.companyName}</p>
                   <p className="text-slate-800 mb-1 pl-2"><strong>New Status:</strong> <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">{emailScanResult.newStatus}</span></p>
                 </div>
                 <p className="text-base text-emerald-700 mt-6 max-w-sm mx-auto">"{emailScanResult.summary}"</p>
                 <button onClick={() => setIsEmailModalOpen(false)} className="mt-8 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md transition-transform hover:scale-105">Continue</button>
               </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
