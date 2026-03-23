'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Upload, Loader2, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParsedData {
  skills: string[];
  projects: { name: string; description: string; techStack?: string[] }[];
}

async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  // Use local worker from public dir to avoid CDN dependency
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

export default function ResumeUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setStatus('idle');
    setErrorMsg('');
    setParsed(null);

    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }

      if (!text.trim()) throw new Error('Could not extract text from file');

      const prompt = `Parse this resume into structured data. Extract all skills (technical tools, languages, frameworks) and projects (with name, description, tech stack).\n\nResume text:\n${text.slice(0, 5000)}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'OBJECT',
            properties: {
              skills: { type: 'ARRAY', items: { type: 'STRING' } },
              projects: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    name: { type: 'STRING' },
                    description: { type: 'STRING' },
                    techStack: { type: 'ARRAY', items: { type: 'STRING' } },
                  },
                  required: ['name', 'description'],
                },
              },
            },
            required: ['skills', 'projects'],
          },
        }),
      });

      if (!res.ok) throw new Error('AI parse error');
      const { text: resultText } = await res.json();
      const data: ParsedData = JSON.parse(resultText || '{}');
      if (!data.skills?.length && !data.projects?.length) throw new Error('No content found in resume');
      setParsed(data);
    } catch (error: any) {
      console.error('Error parsing resume:', error);
      setStatus('error');
      setErrorMsg(error.message || 'Failed to parse resume');
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const confirmImport = async () => {
    if (!parsed || !user) return;
    setSaving(true);
    try {
      for (const skill of (parsed.skills || [])) {
        await addDoc(collection(db, 'users', user.uid, 'skills'), {
          uid: user.uid,
          name: skill,
          category: 'Technical',
          proficiency: 3,
          evidence: 'Extracted from resume',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const project of (parsed.projects || [])) {
        await addDoc(collection(db, 'users', user.uid, 'projects'), {
          uid: user.uid,
          name: project.name,
          description: project.description,
          techStack: project.techStack || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setStatus('success');
      setParsed(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setErrorMsg('Failed to save to database');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileUpload}
        className="hidden"
        id="resume-upload"
        disabled={loading}
      />
      <label
        htmlFor="resume-upload"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
          status === 'success' ? 'bg-emerald-600 text-white' :
          status === 'error' ? 'bg-red-500 text-white' :
          'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {loading ? 'Parsing...' : status === 'success' ? 'Imported!' : status === 'error' ? 'Error' : 'Upload Resume (PDF/TXT)'}
      </label>

      {/* Preview Modal */}
      <AnimatePresence>
        {parsed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setParsed(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Resume Parsed!</h2>
                    <p className="text-xs text-slate-500">Review and confirm before importing</p>
                  </div>
                </div>
                <button onClick={() => setParsed(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-80 overflow-y-auto space-y-4">
                {parsed.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {parsed.skills.length} Skills Found
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {parsed.projects.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {parsed.projects.length} Projects Found
                    </h3>
                    <div className="space-y-2">
                      {parsed.projects.map((p, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                          {p.techStack && p.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {p.techStack.map((t, j) => <span key={j} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">{t}</span>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => setParsed(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmImport}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? 'Importing...' : 'Import All'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {status === 'error' && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 right-0 z-10 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
