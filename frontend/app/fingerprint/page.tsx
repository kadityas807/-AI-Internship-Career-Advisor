'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Fingerprint, Loader2, Sparkles, Brain, Users, BookOpen, Target, Share2, Copy, Check } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { motion, AnimatePresence } from 'motion/react';
import Loader3D from '@/components/Loader3D';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Derive radar scores from fingerprint text signals
function deriveRadarScores(fp: FingerprintData): number[] {
  const text = [
    fp.thinkingStyle, fp.collaborationSignature, fp.narrativeVoice,
    fp.uniqueValueProposition, fp.narrativeArc?.theme,
    ...(fp.softSkills || []).map(s => s.skill + ' ' + s.evidence)
  ].join(' ').toLowerCase();

  const score = (keywords: string[]) => {
    const hits = keywords.filter(k => text.includes(k)).length;
    return Math.min(5, 2 + hits);
  };

  return [
    score(['problem', 'analytic', 'debug', 'solve', 'root cause', 'critical']),
    score(['engineer', 'code', 'build', 'tech', 'system', 'architect', 'software']),
    score(['communicat', 'present', 'document', 'explain', 'articulate', 'narrative']),
    score(['creat', 'innovat', 'design', 'invent', 'novel', 'originat']),
    score(['team', 'collaborat', 'cross', 'pair', 'mentor', 'support']),
    score(['deliver', 'ship', 'execut', 'launch', 'complet', 'producti']),
  ];
}

interface FingerprintData {
  thinkingStyle: string;
  collaborationSignature: string;
  narrativeVoice: string;
  uniqueValueProposition: string;
  narrativeArc: {
    theme: string;
    storyFrames: Array<{ audience: string; frame: string }>;
  };
  softSkills: Array<{ skill: string; evidence: string }>;
}

export default function FingerprintPage() {
  const { user } = useAuth();
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchFingerprint = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'fingerprint', 'current');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFingerprint(docSnap.data() as FingerprintData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/fingerprint/current`);
      } finally {
        setLoading(false);
      }
    };
    fetchFingerprint();
  }, [user]);

  const generateFingerprint = async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      // 1. Fetch all user data
      const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
      const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
      
      const skills = skillsSnap.docs.map(d => d.data());
      const projects = projectsSnap.docs.map(d => d.data());

      if (skills.length === 0 && projects.length === 0) {
        setError("Please add some skills and projects first so we can analyze your profile!");
        setIsGenerating(false);
        return;
      }

      const profileData = `
        Skills: ${JSON.stringify(skills)}
        Projects: ${JSON.stringify(projects)}
      `;

      // 2. Call Generation API
      const prompt = `Analyze the following user profile (skills and projects) and generate a "Career Fingerprint". 
        Extract their unique thinking style, collaboration signature, and narrative voice. 
        Build a narrative arc with story frames for different audiences. 
        Mine their projects for concrete evidence of soft skills.
        
        Profile Data:
        ${profileData}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'OBJECT',
            properties: {
              thinkingStyle: { type: 'STRING', description: "e.g., Systems thinker, rapid prototyper, depth-first learner." },
              collaborationSignature: { type: 'STRING', description: "e.g., Independent deep work, collaborative breadth." },
              narrativeVoice: { type: 'STRING', description: "How they naturally frame problems and solutions." },
              uniqueValueProposition: { type: 'STRING', description: "What makes them genuinely distinct from thousands of others." },
              narrativeArc: {
                type: 'OBJECT',
                properties: {
                  theme: { type: 'STRING', description: "The recurring theme or through-line of their experiences." },
                  storyFrames: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        audience: { type: 'STRING', description: "e.g., Fintech Startup, Large Tech Company" },
                        frame: { type: 'STRING', description: "How to tell the story to this audience." }
                      },
                      required: ["audience", "frame"]
                    }
                  }
                },
                required: ["theme", "storyFrames"]
              },
              softSkills: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    skill: { type: 'STRING' },
                    evidence: { type: 'STRING', description: "Concrete evidence extracted from their projects." }
                  },
                  required: ["skill", "evidence"]
                }
              }
            },
            required: ["thinkingStyle", "collaborationSignature", "narrativeVoice", "uniqueValueProposition", "narrativeArc", "softSkills"]
          }
        })
      });

      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      const result = JSON.parse(text || '{}') as FingerprintData;

      // 3. Save to Firestore
      await setDoc(doc(db, 'users', user.uid, 'fingerprint', 'current'), {
        ...result,
        updatedAt: serverTimestamp()
      });

      setFingerprint(result);
    } catch (error) {
      console.error("Error generating fingerprint:", error);
      setError("Failed to generate fingerprint. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
           <Loader3D text="LOADING SIGNATURE..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200/50">
            <Fingerprint className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Career Fingerprint™</h1>
            <p className="text-slate-500 mt-1">Discover your multi-dimensional professional signature.</p>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between w-full md:w-auto">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateFingerprint}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-70"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {fingerprint ? 'Regenerate Fingerprint' : 'Generate Fingerprint'}
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {!fingerprint && !isGenerating ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 max-w-3xl mx-auto"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
              <Fingerprint className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">Uncover Your Unique Signature</h3>
            <p className="text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
              Most career tools treat you like a template. The Career Fingerprint analyzes your skills and projects to find what makes you genuinely distinct, helping you lean into your unique strengths.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateFingerprint}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              Analyze My Profile
            </motion.button>
          </motion.div>
        ) : isGenerating ? (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center"
          >
            <Loader3D text="EXTRACTING SIGNATURE..." />
            <p className="text-slate-500 animate-pulse mt-4">Mining projects, analyzing skills, building narrative arcs.</p>
          </motion.div>
        ) : fingerprint ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {(() => {
              const scores = deriveRadarScores(fingerprint);
              const dims = ['Problem Solving','Technical','Communication','Creativity','Collaboration','Execution'];
              const topIdx = scores.indexOf(Math.max(...scores));
              const topDim = dims[topIdx];

              return (
                <>
                  {/* BIG HERO CARD (8 cols) */}
                  <div className="lg:col-span-8 bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 cursor-default">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 transition-transform duration-700 group-hover:translate-x-1/4 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 group-hover:-translate-y-1/4 transition-transform duration-700"></div>

                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/5">
                          <Fingerprint className="w-4 h-4 text-indigo-300" />
                        </div>
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Unique Value Proposition</span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-display font-medium leading-relaxed text-slate-100 italic drop-shadow-sm">
                        &quot;{fingerprint.uniqueValueProposition}&quot;
                      </h2>
                    </div>

                    <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                          <Target className="w-5 h-5 text-indigo-200" />
                        </div>
                        <div>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Top Strength</p>
                          <p className="text-sm font-bold text-white">{topDim}</p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-400">careermentor.ai</div>
                    </div>
                  </div>

                  {/* RADAR CHART (4 cols) */}
                  <div className="lg:col-span-4 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-indigo-500/20 shadow-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                    
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                      <svg className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                      Strength Radar
                    </h3>
                    
                    <div className="flex-1 min-h-[380px] w-full relative z-10 -mt-2">
                      <Radar
                        data={{
                          labels: ['Problem Solving', 'Technical', 'Communication', 'Creativity', 'Collaboration', 'Execution'],
                          datasets: [{
                            label: 'Strength',
                            data: scores,
                            backgroundColor: 'rgba(99,102,241,0.35)',
                            borderColor: 'rgba(129,140,248,1)',
                            borderWidth: 2,
                            pointBackgroundColor: '#818cf8',
                            pointHoverBackgroundColor: '#ffffff',
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            fill: true,
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              min: 0, max: 5,
                              ticks: { stepSize: 1, display: false },
                              pointLabels: { 
                                font: { size: 13, weight: 'bold', family: "'Inter', sans-serif" }, 
                                color: '#e2e8f0',
                              },
                              grid: { color: 'rgba(255,255,255,0.08)' },
                              angleLines: { color: 'rgba(255,255,255,0.08)' },
                            },
                          },
                          plugins: { 
                            legend: { display: false }, 
                            tooltip: { 
                              enabled: true, 
                              backgroundColor: 'rgba(15,23,42,0.95)', 
                              titleColor: '#fff', 
                              bodyColor: '#fff', 
                              padding: 12, 
                              cornerRadius: 8, 
                              displayColors: false,
                              borderColor: 'rgba(129,140,248,0.4)',
                              borderWidth: 1.5
                            } 
                          },
                        }}
                      />
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-1.5 justify-center relative z-10">
                      {scores.map((s, i) => (
                         s >= 4 && (
                           <span key={i} className="px-2.5 py-1 bg-indigo-500/20 backdrop-blur-md text-indigo-300 text-[10px] font-bold uppercase rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-transform duration-300 group-hover:scale-105 cursor-default">
                             {dims[i]}
                           </span>
                         )
                      ))}
                    </div>
                  </div>

                  {/* THE 3 SIGNATURE TRAITS (4 cols each) */}
                  <div className="lg:col-span-4 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:bg-white/80 shrink-0">
                    <div className="w-12 h-12 bg-white/80 shadow-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-100 backdrop-blur-sm">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-3">Thinking Style</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{fingerprint.thinkingStyle}</p>
                  </div>

                  <div className="lg:col-span-4 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:bg-white/80 shrink-0">
                    <div className="w-12 h-12 bg-white/80 shadow-sm rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 backdrop-blur-sm">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-3">Collaboration</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{fingerprint.collaborationSignature}</p>
                  </div>

                  <div className="lg:col-span-4 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:bg-white/80 shrink-0">
                    <div className="w-12 h-12 bg-white/80 shadow-sm rounded-2xl flex items-center justify-center mb-6 border border-amber-100 backdrop-blur-sm">
                      <BookOpen className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-3">Narrative Voice</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{fingerprint.narrativeVoice}</p>
                  </div>

                  {/* NARRATIVE ARC (6 cols) */}
                  <div className="lg:col-span-6 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:-translate-y-1 hover:bg-white/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-slate-200/50">
                        <Share2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 font-display">Narrative Arc</h3>
                    </div>
                    
                    <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm mb-6 transition-colors hover:bg-white">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Core Theme</p>
                      <p className="text-slate-800 font-medium">{fingerprint.narrativeArc.theme}</p>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      {fingerprint.narrativeArc.storyFrames.map((frame, i) => (
                        <div key={i} className="pl-5 border-l-[3px] border-indigo-300/50 py-1 transition-all hover:border-indigo-400">
                          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Target: {frame.audience}</div>
                          <p className="text-slate-600 text-sm leading-relaxed">{frame.frame}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MINED SOFT SKILLS (6 cols) */}
                  <div className="lg:col-span-6 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:-translate-y-1 hover:bg-white/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-teal-100 shadow-sm">
                        <Sparkles className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 font-display">Mined Soft Skills</h3>
                        <p className="text-xs text-slate-500 mt-1">Extracted from your project history</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      {fingerprint.softSkills.map((skill, i) => (
                        <div key={i} className="group p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 hover:border-teal-200/60 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
                          <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                             <Check className="w-4 h-4 text-teal-500 transition-transform group-hover:scale-110" />
                             {skill.skill}
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed pl-6">
                            {skill.evidence}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppLayout>
  );
}
