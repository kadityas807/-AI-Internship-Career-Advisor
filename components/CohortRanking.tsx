'use client';

import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { Trophy, Loader2, ArrowUpCircle } from 'lucide-react';

export default function CohortRanking() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
        const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
        const appsSnap = await getDocs(collection(db, 'users', user.uid, 'applications'));
        
        const data = {
          skills: skillsSnap.docs.map(d => d.data()),
          projects: projectsSnap.docs.map(d => d.data()),
          applications: appsSnap.docs.map(d => d.data())
        };

        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Evaluate this student's rank among 100 similar students based on this data: ${JSON.stringify(data)}. Provide rank, tier, justification, gaps, missions, progression simulation, and motivational feedback.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rank: { type: Type.STRING },
                tier: { type: Type.STRING },
                justification: { type: Type.STRING },
                gaps: { type: Type.STRING },
                missions: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      task: { type: Type.STRING }, 
                      difficulty: { type: Type.STRING }, 
                      time: { type: Type.STRING }, 
                      reward: { type: Type.STRING } 
                    } 
                  } 
                },
                simulation: { type: Type.STRING },
                motivation: { type: Type.STRING }
              },
              required: ['rank', 'tier', 'justification', 'gaps', 'missions', 'simulation', 'motivation']
            }
          }
        });
        setRanking(JSON.parse(response.text || '{}'));
      } catch (error) {
        console.error('Error fetching ranking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [user]);

  if (loading) return <div className="p-6 bg-white rounded-3xl border border-slate-200 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (!ranking) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-amber-500" /> Cohort Ranking
      </h2>
      <div className="text-4xl font-bold text-slate-900 mb-2">{ranking.rank}</div>
      <div className="text-indigo-600 font-semibold mb-4">{ranking.tier}</div>
      <p className="text-slate-600 text-sm mb-6">{ranking.justification}</p>
      
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Rank-Up Missions</h3>
        {ranking.missions.map((m: any, i: number) => (
          <div key={i} className="bg-slate-50 p-3 rounded-lg mb-2 text-sm">
            <p className="font-medium">{m.task}</p>
            <p className="text-slate-500 text-xs">{m.difficulty} • {m.time} • {m.reward}</p>
          </div>
        ))}
      </div>
      
      <p className="text-sm italic text-slate-500">{ranking.motivation}</p>
    </div>
  );
}
