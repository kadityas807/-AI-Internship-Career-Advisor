'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Map, Loader2, ArrowRight, CheckCircle2, Target, Calendar, Award, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import Loader3D from '@/components/Loader3D';

interface RoadmapData {
  totalWeeks: number;
  readinessScore: number;
  breakdown: {
    skills: string[];
    projects: string[];
    interviewPrep: string[];
    certifications?: { name: string; url: string; }[];
  };
  weeklyPlan: {
    week: number;
    focus: string;
    tasks: string[];
  }[];
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [targetDuration, setTargetDuration] = useState('12');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchRoadmap = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'roadmap', 'current');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRoadmap(docSnap.data() as RoadmapData);
          setTargetRole(docSnap.data().targetRole || '');
          setTargetDuration(docSnap.data().targetDuration || '12');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/roadmap/current`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, [user]);

  const generateRoadmap = async () => {
    if (!user || !targetRole.trim()) return;
    setIsGenerating(true);

    try {
      const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
      const skills = skillsSnap.docs.map(d => d.data().name);

      if (skills.length === 0) {
        setError("Please add some skills in the Dashboard first so we can build your roadmap!");
        setIsGenerating(false);
        return;
      }

      const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
      const projects = projectsSnap.docs.map(d => ({ title: d.data().title, description: d.data().description }));

      const prompt = `
        You are an expert technical career coach.
        The user wants to become a: ${targetRole} within exactly ${targetDuration} weeks.
        Their current skills: ${skills.join(', ')}
        Their current projects: ${JSON.stringify(projects)}

        Generate a personalized ${targetDuration}-week "Time-to-Ready Forecast" and roadmap.
        You MUST provide exactly ${targetDuration} weeks in the weeklyPlan array, mapping out realistic progression. 
        Adjust the pacing to fit the ${targetDuration}-week timeframe.
        Also, suggest 2-3 highly relevant certifications for this role and provide valid, official URLs for them.
      `;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'OBJECT',
            properties: {
              totalWeeks: { type: 'INTEGER', description: 'Estimated weeks to be interview-ready' },
              readinessScore: { type: 'INTEGER', description: 'Current readiness score out of 100' },
              breakdown: {
                type: 'OBJECT',
                properties: {
                  skills: { type: 'ARRAY', items: { type: 'STRING' } },
                  projects: { type: 'ARRAY', items: { type: 'STRING' } },
                  interviewPrep: { type: 'ARRAY', items: { type: 'STRING' } },
                  certifications: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        name: { type: 'STRING' },
                        url: { type: 'STRING', description: 'Official URL for the certification' }
                      },
                      required: ['name', 'url']
                    }
                  }
                },
                required: ['skills', 'projects', 'interviewPrep', 'certifications']
              },
              weeklyPlan: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    week: { type: 'INTEGER' },
                    focus: { type: 'STRING' },
                    tasks: { type: 'ARRAY', items: { type: 'STRING' } }
                  },
                  required: ['week', 'focus', 'tasks']
                }
              }
            },
            required: ['totalWeeks', 'readinessScore', 'breakdown', 'weeklyPlan']
          }
        })
      });

      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      const data = JSON.parse(text || '{}');
      
      await setDoc(doc(db, 'users', user.uid, 'roadmap', 'current'), {
        ...data,
        targetRole,
        targetDuration,
        updatedAt: new Date().toISOString()
      });

      setRoadmap(data);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader3D text="LOADING ROADMAP..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-500" />
            Time-to-Ready Forecast
          </h1>
          <p className="text-slate-600 mt-2">Generate a personalized roadmap to reach your target role.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">What is your target role and timeline?</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Junior React Developer, Data Scientist"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="4">4 Weeks (Crash Course)</option>
              <option value="8">8 Weeks (Accelerated)</option>
              <option value="12">12 Weeks (Standard)</option>
              <option value="24">24 Weeks (Comprehensive)</option>
            </select>
            <button
              onClick={generateRoadmap}
              disabled={isGenerating || !targetRole.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              Generate Roadmap
            </button>
          </div>
        </div>

        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">{roadmap.totalWeeks}</div>
                <div className="text-slate-600 font-medium">Weeks to Interview-Ready</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-lg font-semibold text-slate-900 mb-4">Current Readiness</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-slate-900">{roadmap.readinessScore}</span>
                  <span className="text-slate-500 mb-1">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${roadmap.readinessScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Preparation Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Skills to Learn
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.breakdown.skills.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> Projects to Build
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.breakdown.projects.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Interview Prep
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.breakdown.interviewPrep.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" /> Certifications
                  </h3>
                  <ul className="space-y-3">
                    {roadmap.breakdown.certifications?.map((cert, i) => (
                      <li key={i} className="text-sm">
                        <a 
                          href={cert.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group flex flex-col gap-1 p-2 -mx-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                        >
                          <span className="font-medium text-slate-700 group-hover:text-indigo-600 flex items-center gap-1">
                            {cert.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </span>
                          <span className="text-xs text-slate-400 line-clamp-1">{cert.url}</span>
                        </a>
                      </li>
                    ))}
                    {(!roadmap.breakdown.certifications || roadmap.breakdown.certifications.length === 0) && (
                      <li className="text-sm text-slate-500 italic">No specific certifications required.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <h2 className="text-xl font-bold text-slate-900 mb-12 flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-500" /> Timeline Tree
              </h2>

              <div className="relative max-w-3xl mx-auto">
                {/* Central vertical line */}
                <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-indigo-100 md:-translate-x-1/2 rounded-full z-0" />
                
                <div className="space-y-12">
                  {roadmap.weeklyPlan.map((week, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <div key={week.week} className={`relative z-10 flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''} gap-6 md:gap-0`}>
                        
                        {/* Timeline Node Content Block */}
                        <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-start pl-20 md:pl-10 md:pr-0' : 'md:justify-end md:pr-10 pl-20 md:pl-0'}`}>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm w-full transition-all hover:shadow-md hover:border-indigo-200 text-left">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{week.focus}</h3>
                            <ul className="space-y-2">
                              {week.tasks.map((task, i) => (
                                <li key={i} className="text-slate-600 flex items-start gap-2 text-sm justify-start">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Center Dot and Week Label */}
                        <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-12 h-12 rounded-full bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center font-bold text-white z-20">
                          W{week.week}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
