'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Mail, Loader2, Copy, CheckCheck, Clock, Send, User, Building2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ColdEmailPage() {
  const { user } = useAuth();
  const [company, setCompany] = useState('');
  const [recruiter, setRecruiter] = useState('');
  const [role, setRole] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'skills')).then(s => setUserSkills(s.docs.map(d => d.data().name)));
    getDocs(collection(db, 'users', user.uid, 'projects')).then(s => setUserProjects(s.docs.map(d => d.data().title)));
    // Load last saved email
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'coldEmails', 'latest'));
        if (snap.exists()) {
          const d = snap.data();
          setGeneratedEmail(d.email || '');
          setSavedAt(d.generatedAt);
          if (d.company) setCompany(d.company);
          if (d.role) setRole(d.role);
          if (d.recruiter) setRecruiter(d.recruiter);
        }
      } catch (e) { console.error('Failed to load:', e); }
    })();
  }, [user]);

  const generate = async () => {
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert career coach. Write a highly personalized, concise cold outreach email (max 120 words) for a student reaching out to a recruiter.\n\nDetails:\n- Company: ${company}\n- Recruiter Name: ${recruiter || 'Hiring Manager'}\n- Target Role: ${role}\n- My Skills: ${userSkills.join(', ') || 'Not specified'}\n- My Projects: ${userProjects.join(', ') || 'Not specified'}\n\nWrite a professional, friendly, and specific cold email. Mention 1-2 relevant skills or projects. End with a clear call to action. Return only the email text, no subject line.`,
          schema: { type: 'STRING' },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      const email = text?.replace(/^"|"$/g, '') || '';
      setGeneratedEmail(email);
      const now = new Date().toISOString();
      setSavedAt(now);
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'coldEmails', 'latest'), {
          email, company, role, recruiter, generatedAt: now,
        });
      }
    } catch {
      setError('Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = generatedEmail.split(/\s+/).filter(Boolean).length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Cold Email Generator</h1>
              <p className="text-slate-500 mt-1">Stand out from the crowd with AI-crafted outreach emails.</p>
            </div>
          </div>
        </motion.div>

        {(userSkills.length > 0 || userProjects.length > 0) && (
          <div className="mb-5 p-4 bg-violet-50 border border-violet-200 rounded-xl">
            <p className="text-xs font-semibold text-violet-700 mb-2">✨ AI will personalize your email using your profile</p>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.slice(0, 4).map(s => <span key={s} className="text-xs px-2 py-0.5 bg-white text-violet-700 border border-violet-200 rounded-full">{s}</span>)}
              {userProjects.slice(0, 2).map(p => <span key={p} className="text-xs px-2 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded-full">📁 {p}</span>)}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {savedAt && !loading && generatedEmail && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Last generated: {new Date(savedAt).toLocaleString()}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Company Name *
              </label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe, OpenAI" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Recruiter Name (optional)
              </label>
              <input value={recruiter} onChange={e => setRecruiter(e.target.value)} placeholder="e.g. Sarah Johnson" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Target Role *
            </label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer Intern, ML Research Intern" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
          </div>
          <button onClick={generate} disabled={loading || !company.trim() || !role.trim()}
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Crafting your email...</> : <><Send className="w-4 h-4" /> Generate Cold Email</>}
          </button>
        </div>

        <AnimatePresence>
          {generatedEmail && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Email Preview Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">Your Cold Email</p>
                      <p className="text-xs text-slate-400">To: {recruiter || 'Hiring Manager'} at {company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 hidden sm:block">{wordCount} words</span>
                    <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors">
                      {copied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Email</>}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{generatedEmail}</p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-violet-700 mb-2">💡 Pro Tips</p>
                <ul className="text-xs text-violet-600 space-y-1">
                  <li>• Send between 7-9 AM in the recruiter&apos;s timezone</li>
                  <li>• Follow up in 3-5 days if no response</li>
                  <li>• Personalize further by mentioning a recent company news</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
