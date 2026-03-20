'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { processAgentActions } from '@/lib/agent-actions';

export default function SmartImport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleImport = async () => {
    if (!user) return;
    setLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      // 1. Fetch Profile Data (Context)
      const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
      const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
      const appsSnap = await getDocs(collection(db, 'users', user.uid, 'applications'));
      const platformsSnap = await getDoc(doc(db, 'users', user.uid, 'fingerprint', 'platform_profiles'));
      
      const skills = skillsSnap.docs.map(d => d.data());
      const projects = projectsSnap.docs.map(d => d.data());
      const apps = appsSnap.docs.map(d => d.data());
      const platforms = platformsSnap.exists() ? platformsSnap.data() : {};
      
      let githubReposText = 'No GitHub profile linked.';
      if (platforms.github) {
        try {
          const username = platforms.github.split('/').filter(Boolean).pop();
          if (username) {
            const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
            if (res.ok) {
              const repos = await res.json();
              githubReposText = repos.map((r: any) => `- ${r.name} (${r.language || 'N/A'}): ${r.description || 'No description'}`).join('\\n');
            }
          }
        } catch (e) {}
      }

      const context = `
HERE IS THE STUDENT'S DATA:
Skills: ${skills.map(s => s.name).join(', ')}
Projects: ${projects.map(p => p.name).join(', ')}
Apps: ${apps.map(a => `${a.company} (${a.status})`).join(', ')}
GitHub Repos:
${githubReposText}
`;

      // 2. Fetch from Mentor API
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           userMessage: "System Command: Analyze my context (especially my GitHub Repos and past experience). Extract ALL missing technical and soft skills, past job experiences as job applications, and major engineering projects. Output the corresponding JSON tags to automatically add them to my ledger. Respond with a summary of what you did.", 
           history: [], 
           profileContext: context, 
           userId: user.uid 
        }),
      });

      if (!res.ok) throw new Error('Failed to run Smart Import');
      const { text } = await res.json();

      // 3. Process Agent Actions
      const finalOutput = await processAgentActions(text, user.uid, db);
      
      // If the processed text includes 'Add' or 'Actions Performed', set success
      if (finalOutput.includes('Automated') || finalOutput.includes('Autonomous Actions') || finalOutput.includes('Added') || finalOutput.includes('Tracked')) {
        setStatus('success');
        setMessage(`Data successfully imported!`);
      } else {
        setStatus('error');
        setMessage('No new data found.');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to analyze profile.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleImport}
        disabled={loading || status === 'success'}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-sm shadow-indigo-200 ${
          status === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
          status === 'success' ? 'bg-emerald-500 text-white shadow-emerald-200' :
          'bg-indigo-600 text-white hover:bg-indigo-700'
        } disabled:opacity-70`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
         status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
         status === 'error' ? <AlertCircle className="w-4 h-4" /> : 
         <Sparkles className="w-4 h-4" />}
        
        {loading ? 'Analyzing...' : 
         status === 'success' ? message : 
         status === 'error' ? message : 
         'Smart Import'}
      </button>

      {status === 'idle' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center font-medium">
          1-Click automatic extraction from your connected platforms.
        </div>
      )}
    </div>
  );
}
