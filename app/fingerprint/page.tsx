'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Fingerprint, Loader2, Sparkles, Brain, Users, BookOpen, Target } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { motion, AnimatePresence } from 'motion/react';

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

      // 2. Call Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the following user profile (skills and projects) and generate a "Career Fingerprint". 
        Extract their unique thinking style, collaboration signature, and narrative voice. 
        Build a narrative arc with story frames for different audiences. 
        Mine their projects for concrete evidence of soft skills.
        
        Profile Data:
        ${profileData}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thinkingStyle: { type: Type.STRING, description: "e.g., Systems thinker, rapid prototyper, depth-first learner." },
              collaborationSignature: { type: Type.STRING, description: "e.g., Independent deep work, collaborative breadth." },
              narrativeVoice: { type: Type.STRING, description: "How they naturally frame problems and solutions." },
              uniqueValueProposition: { type: Type.STRING, description: "What makes them genuinely distinct from thousands of others." },
              narrativeArc: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING, description: "The recurring theme or through-line of their experiences." },
                  storyFrames: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        audience: { type: Type.STRING, description: "e.g., Fintech Startup, Large Tech Company" },
                        frame: { type: Type.STRING, description: "How to tell the story to this audience." }
                      },
                      required: ["audience", "frame"]
                    }
                  }
                },
                required: ["theme", "storyFrames"]
              },
              softSkills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    evidence: { type: Type.STRING, description: "Concrete evidence extracted from their projects." }
                  },
                  required: ["skill", "evidence"]
                }
              }
            },
            required: ["thinkingStyle", "collaborationSignature", "narrativeVoice", "uniqueValueProposition", "narrativeArc", "softSkills"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}') as FingerprintData;

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
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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
            className="py-32 flex flex-col items-center justify-center text-center"
          >
            <div className="relative w-24 h-24 mb-8">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-indigo-200 rounded-full blur-xl"
              />
              <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center shadow-xl border border-indigo-100 z-10">
                <Fingerprint className="w-10 h-10 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Extracting Your Signature...</h3>
            <p className="text-slate-500 animate-pulse">Mining projects, analyzing skills, building narrative arcs.</p>
          </motion.div>
        ) : fingerprint ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Core Identity */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                  <Target className="w-3.5 h-3.5" /> Unique Value Proposition
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display leading-tight">
                  {fingerprint.uniqueValueProposition}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-slate-700/50">
                  <div>
                    <div className="text-indigo-400 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" /> Thinking Style
                    </div>
                    <p className="text-slate-300 leading-relaxed">{fingerprint.thinkingStyle}</p>
                  </div>
                  <div>
                    <div className="text-emerald-400 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Collaboration
                    </div>
                    <p className="text-slate-300 leading-relaxed">{fingerprint.collaborationSignature}</p>
                  </div>
                  <div>
                    <div className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Narrative Voice
                    </div>
                    <p className="text-slate-300 leading-relaxed">{fingerprint.narrativeVoice}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Narrative Arc Builder */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 font-display">Narrative Arc</h3>
                </div>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  <strong className="text-slate-900">Core Theme:</strong> {fingerprint.narrativeArc.theme}
                </p>
                
                <div className="space-y-4">
                  {fingerprint.narrativeArc.storyFrames.map((frame, i) => (
                    <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Audience: {frame.audience}</div>
                      <p className="text-slate-700 text-sm leading-relaxed">{frame.frame}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft Skill Evidence Mining */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 font-display">Mined Soft Skills</h3>
                </div>
                <p className="text-slate-500 mb-8 text-sm">
                  Technical skills are visible. Soft skills require evidence. Here is what your projects prove about you.
                </p>
                
                <div className="space-y-4">
                  {fingerprint.softSkills.map((skill, i) => (
                    <div key={i} className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <div className="font-bold text-slate-900 mb-1">{skill.skill}</div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        <span className="font-semibold text-emerald-700">Evidence:</span> {skill.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppLayout>
  );
}
