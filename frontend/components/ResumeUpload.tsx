'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Upload, Loader2, FileText } from 'lucide-react';

export default function ResumeUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      // For now, we assume text-based resume upload for simplicity in this environment
      const text = await file.text();

      const prompt = `Parse this resume into structured data: ${text}`;
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
                    techStack: { type: 'ARRAY', items: { type: 'STRING' } }
                  },
                  required: ['name', 'description']
                }
              }
            },
            required: ['skills', 'projects']
          }
        })
      });

      if (!res.ok) throw new Error('API Error');
      const { text: resultText } = await res.json();
      const data = JSON.parse(resultText || '{}');

      // Save to Firestore
      for (const skill of data.skills) {
        await addDoc(collection(db, 'users', user.uid, 'skills'), {
          uid: user.uid,
          name: skill,
          category: 'Technical',
          proficiency: 3,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const project of data.projects) {
        await addDoc(collection(db, 'users', user.uid, 'projects'), {
          uid: user.uid,
          ...project,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error parsing resume:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="hidden"
        id="resume-upload"
        disabled={loading}
      />
      <label
        htmlFor="resume-upload"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
          status === 'success' ? 'bg-emerald-600 text-white' : 
          status === 'error' ? 'bg-red-600 text-white' : 
          'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {loading ? 'Parsing...' : status === 'success' ? 'Parsed!' : status === 'error' ? 'Error!' : 'Upload Resume (TXT)'}
      </label>
    </div>
  );
}
