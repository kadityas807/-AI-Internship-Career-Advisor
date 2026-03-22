'use client';

import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Loader2, Github, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SmartImport() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!input.trim() || !user) return;

    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const isUrl = input.trim().startsWith('http');
      
      let prompt = '';
      let tools: any[] = [];

      if (isUrl) {
        prompt = `Analyze this GitHub repository or professional profile URL and extract skills and projects: ${input.trim()}. 
        Return the data in the specified JSON format.`;
        tools = [{ urlContext: {} }];
      } else {
        prompt = `Parse this resume text and extract skills and projects: ${input.trim()}. 
        Return the data in the specified JSON format.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: tools.length > 0 ? tools : undefined,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skills: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'e.g. Technical, Soft, Tool' },
                    proficiency: { type: Type.INTEGER, description: '1-5 scale' },
                    evidence: { type: Type.STRING, description: 'Brief proof from the text' }
                  },
                  required: ['name', 'category', 'proficiency']
                }
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                    role: { type: Type.STRING },
                    outcome: { type: Type.STRING }
                  },
                  required: ['name', 'description']
                }
              }
            },
            required: ['skills', 'projects']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');

      // Save to Firestore
      const skillsBatch = data.skills.map((skill: any) => 
        addDoc(collection(db, 'users', user.uid, 'skills'), {
          uid: user.uid,
          ...skill,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      const projectsBatch = data.projects.map((project: any) => 
        addDoc(collection(db, 'users', user.uid, 'projects'), {
          uid: user.uid,
          ...project,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      await Promise.all([...skillsBatch, ...projectsBatch]);

      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setInput('');
      }, 2000);
    } catch (err: any) {
      console.error('Error in Smart Import:', err);
      setError(err.message || 'Failed to import data. Please try again.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md font-medium"
      >
        <Sparkles className="w-4 h-4" />
        Smart Import
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Smart Import</h2>
                    <p className="text-sm text-slate-500">AI-powered skill & project extraction</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close smart import"
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="import-input"
                      className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Paste Resume Text or GitHub URL
                    </label>
                    <textarea
                      id="import-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste your resume content here, or a link to your GitHub profile/repository..."
                      className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-700"
                      disabled={loading}
                    />
                    <div className="mt-2 flex gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Skills Extraction
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Project Details
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Tech Stack Mapping
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={loading || !input.trim()}
                      className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-200/50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                        status === 'success' ? 'bg-emerald-600 text-white' : 
                        'bg-indigo-600 text-white hover:bg-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing Profile...
                        </>
                      ) : status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Imported Successfully!
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Start AI Import
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 border-t border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700">Pro Tip:</span> Pasting a GitHub URL allows the AI to analyze your repositories, languages used, and contribution patterns to build a more accurate technical profile.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
