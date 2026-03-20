'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { GoogleGenAI, Type } from '@google/genai';
import { Map, Loader2, ArrowRight, CheckCircle2, Target, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';

interface RoadmapData {
  totalWeeks: number;
  readinessScore: number;
  breakdown: {
    skills: string[];
    projects: string[];
    interviewPrep: string[];
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

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const prompt = `
        You are an expert technical career coach.
        The user wants to become a: ${targetRole}
        Their current skills: ${skills.join(', ')}
        Their current projects: ${JSON.stringify(projects)}

        Generate a personalized "Time-to-Ready Forecast" and roadmap.
        Be realistic about the time required.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalWeeks: { type: Type.INTEGER, description: 'Estimated weeks to be interview-ready' },
              readinessScore: { type: Type.INTEGER, description: 'Current readiness score out of 100' },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  interviewPrep: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['skills', 'projects', 'interviewPrep']
              },
              weeklyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['week', 'focus', 'tasks']
                }
              }
            },
            required: ['totalWeeks', 'readinessScore', 'breakdown', 'weeklyPlan']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      await setDoc(doc(db, 'users', user.uid, 'roadmap', 'current'), {
        ...data,
        targetRole,
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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
          <label className="block text-sm font-medium text-slate-700 mb-2">What is your target role?</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Junior React Developer, Data Scientist"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Skills to Learn
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.breakdown.skills.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> {item}
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
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> {item}
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
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Weekly Plan
              </h2>
              <div className="space-y-6">
                {roadmap.weeklyPlan.map((week) => (
                  <div key={week.week} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {week.week}
                      </div>
                      <div className="w-px h-full bg-slate-200 my-2" />
                    </div>
                    <div className="pb-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{week.focus}</h3>
                      <ul className="space-y-2">
                        {week.tasks.map((task, i) => (
                          <li key={i} className="text-slate-600 flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
