'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { BookOpen, Briefcase, FileText, ArrowRight, Sparkles, Activity, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { motion } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import PopulateDemoData from '@/components/PopulateDemoData';
import SmartImport from '@/components/SmartImport';
import CohortRanking from '@/components/CohortRanking';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ skills: 0, projects: 0, applications: 0 });
  const [loading, setLoading] = useState(true);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
        const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
        const appsSnap = await getDocs(collection(db, 'users', user.uid, 'applications'));
        const benchmarkSnap = await getDoc(doc(db, 'users', user.uid, 'benchmark', 'current'));

        setStats({
          skills: skillsSnap.size,
          projects: projectsSnap.size,
          applications: appsSnap.size,
        });
        setApplications(appsSnap.docs.map(d => d.data()));

        if (benchmarkSnap.exists()) {
          setBenchmark(benchmarkSnap.data());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/dashboard_stats`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Check for Rejection Intelligence
  const staleApplications = applications.filter(app => 
    app.status === 'Rejected' || (app.status === 'Applied' && new Date().getTime() - new Date(app.applicationDate).getTime() > 10 * 24 * 60 * 60 * 1000)
  );

  const generateBenchmark = async () => {
    if (!user) return;
    setIsGeneratingBenchmark(true);

    try {
      const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
      const skills = skillsSnap.docs.map(d => d.data().name);

      const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
      const projects = projectsSnap.docs.map(d => ({ title: d.data().title, description: d.data().description }));

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const prompt = `
        You are an expert technical recruiter and career coach.
        Analyze the student's current profile:
        Skills: ${skills.join(', ')}
        Projects: ${JSON.stringify(projects)}

        Compare them against similar-level candidates in the tech industry.
        Provide a peer benchmark report.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              standing: { type: Type.STRING, description: 'e.g. Above Average, Average, Below Average' },
              summary: { type: Type.STRING },
              specificGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              topStudentDifferences: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['standing', 'summary', 'specificGaps', 'topStudentDifferences']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setBenchmark(data);

      await setDoc(doc(db, 'users', user.uid, 'benchmark', 'current'), {
        ...data,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating benchmark:', error);
      setError('Failed to generate benchmark. Please try again.');
    } finally {
      setIsGeneratingBenchmark(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-display tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}
        </h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-slate-500 text-lg">Here is an overview of your career journey.</p>
          <div className="flex gap-2">
            <SmartImport />
            <PopulateDemoData />
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-md p-1"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
      </motion.div>

      {/* Readiness Score + Cohort Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-indigo-500" /> Readiness Score
          </h2>
          <div className="text-5xl font-bold text-indigo-600 mb-2">74%</div>
          <p className="text-slate-600 mb-6">You need 2 more projects to reach 90% readiness.</p>
          <div className="w-full bg-slate-100 rounded-full h-4">
            <div className="bg-indigo-600 h-4 rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>
        <CohortRanking />
      </div>

      {/* Rejection Intelligence Alert */}
      {staleApplications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-red-50 border border-red-200 rounded-3xl p-8"
        >
          <h2 className="text-xl font-bold text-red-900 mb-2">Rejection Intelligence</h2>
          <p className="text-red-700 mb-4">You have {staleApplications.length} application(s) that need attention. Let me analyze them for you.</p>
          <Link href="/mentor" className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
            Analyze Applications
          </Link>
        </motion.div>
      )}
      
      {/* AI Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-emerald-900 shadow-sm"
      >
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-600" /> Mentor&#39;s Note
        </h2>
        <p className="text-emerald-800">Welcome back. You have an interview with Stripe in 4 days. I&#39;d suggest spending today on system design. Here&#39;s where to start.</p>
      </motion.div>

      {/* Today's Focus Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-10 bg-indigo-600 rounded-3xl p-8 text-white shadow-lg flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold mb-2">Today&#39;s Focus</h2>
          <p className="text-indigo-100">Complete your System Design gap — you&#39;re 3 weeks behind your target.</p>
        </div>
        <Link href="/roadmap" className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
          Start Task
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse mb-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 h-40"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={item} className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 font-display">Skills Ledger</h2>
            </div>
            <div className="mt-auto flex items-end justify-between">
              <span className="text-5xl font-light text-slate-900 tracking-tight">{stats.skills}</span>
              <Link href="/skills" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div variants={item} className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 font-display">Project Registry</h2>
            </div>
            <div className="mt-auto flex items-end justify-between">
              <span className="text-5xl font-light text-slate-900 tracking-tight">{stats.projects}</span>
              <Link href="/projects" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div variants={item} className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 font-display">Applications</h2>
            </div>
            <div className="mt-auto flex items-end justify-between">
              <span className="text-5xl font-light text-slate-900 tracking-tight">{stats.applications}</span>
              <Link href="/applications" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" /> Peer Benchmarking
          </h2>
          <button
            onClick={generateBenchmark}
            disabled={isGeneratingBenchmark}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {isGeneratingBenchmark ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {benchmark ? 'Update Benchmark' : 'Generate Benchmark'}
          </button>
        </div>

        {benchmark ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                benchmark.standing.includes('Above') ? 'bg-emerald-100 text-emerald-700' :
                benchmark.standing.includes('Below') ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {benchmark.standing}
              </div>
              <p className="text-slate-600 flex-1">{benchmark.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Identified Gaps</h3>
                <ul className="space-y-2">
                  {benchmark.specificGaps.map((gap: string, i: number) => (
                    <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" /> {gap}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">What Top Students Do Differently</h3>
                <ul className="space-y-2">
                  {benchmark.topStudentDifferences.map((diff: string, i: number) => (
                    <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> {diff}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">See How You Compare</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Generate a peer benchmark to see how your skills and projects stack up against other candidates in the industry.</p>
            <button
              onClick={generateBenchmark}
              disabled={isGeneratingBenchmark}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isGeneratingBenchmark ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Benchmark
            </button>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-900 rounded-3xl border border-slate-800 p-8 md:p-10 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Insights</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-display tracking-tight">Talk to your AI Mentor</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Your mentor remembers everything you&apos;ve added to your skills, projects, and applications. Ask it for resume feedback, interview prep, or a skill gap analysis.
            </p>
          </div>
          <Link 
            href="/mentor"
            className="group shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all hover:scale-105"
          >
            Start Chat <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </AppLayout>
  );
}
