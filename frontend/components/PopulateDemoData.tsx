'use client';

import { useState } from 'react';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';
import { Loader2, Database } from 'lucide-react';

export default function PopulateDemoData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const populate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Skills
      const skills = [
        { name: 'React.js', category: 'Technical', proficiency: 5, evidence: 'Expense Tracker, Portfolio site' },
        { name: 'Node.js / Express', category: 'Technical', proficiency: 4, evidence: 'Expense Tracker backend' },
        { name: 'Python', category: 'Technical', proficiency: 4, evidence: 'Sentiment Analysis model' },
        { name: 'MySQL', category: 'Technical', proficiency: 4, evidence: 'Used in 2 projects' },
        { name: 'Git / GitHub', category: 'Technical', proficiency: 5, evidence: 'Active public repos' },
        { name: 'REST API Design', category: 'Technical', proficiency: 2, evidence: '' },
        { name: 'System Design', category: 'Technical', proficiency: 2, evidence: '' },
        { name: 'Docker', category: 'Technical', proficiency: 2, evidence: '' },
        { name: 'Machine Learning (BERT)', category: 'Technical', proficiency: 4, evidence: 'Sentiment model, 89% accuracy' },
        { name: 'TypeScript', category: 'Technical', proficiency: 2, evidence: '' },
      ];
      for (const skill of skills) {
        await addDoc(collection(db, 'users', user.uid, 'skills'), {
          ...skill,
          uid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 2. Projects
      const projects = [
        { name: 'Expense Tracker App', description: 'Manual budgeting was time-consuming for hostel students', techStack: ['React', 'Node.js', 'Express', 'MySQL'], role: 'Solo developer', outcome: 'Reduced budgeting time by 40% for 3 beta users', link: 'github.com/priyak/expense-tracker' },
        { name: 'Sentiment Analysis API', description: 'Analyze product review sentiment for e-commerce', techStack: ['Python', 'BERT', 'Flask', 'HuggingFace'], role: 'Solo developer', outcome: '89% accuracy on test set of 10,000 reviews', link: 'github.com/priyak/sentiment-api' },
        { name: 'Personal Portfolio Website', description: 'No online presence to share with recruiters', techStack: ['HTML', 'CSS', 'JavaScript'], role: 'Solo developer', outcome: '200+ visits since launch', link: 'priyakapoor.dev' },
      ];
      for (const project of projects) {
        await addDoc(collection(db, 'users', user.uid, 'projects'), {
          ...project,
          uid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 3. Applications
      const applications = [
        { company: 'Stripe', role: 'SDE Intern', status: 'Interviewing', applicationDate: '2025-03-12', notes: 'Phone screen scheduled' },
        { company: 'Razorpay', role: 'Backend Intern', status: 'Applied', applicationDate: '2025-03-05', notes: 'Under review' },
        { company: 'Swiggy', role: 'Full Stack Intern', status: 'Rejected', applicationDate: '2025-02-28', notes: '' },
        { company: 'Zepto', role: 'SDE Intern', status: 'Applied', applicationDate: '2025-02-20', notes: 'No response' },
        { company: 'Groww', role: 'Backend Intern', status: 'Applied', applicationDate: '2025-02-14', notes: 'No response' },
        { company: 'Cred', role: 'SDE Intern', status: 'Rejected', applicationDate: '2025-02-08', notes: 'Rejected after OA' },
        { company: 'PhonePe', role: 'Backend Intern', status: 'Rejected', applicationDate: '2025-02-01', notes: '' },
        { company: 'Meesho', role: 'Full Stack Intern', status: 'Applied', applicationDate: '2025-01-25', notes: 'No response' },
      ];
      for (const app of applications) {
        await addDoc(collection(db, 'users', user.uid, 'applications'), {
          ...app,
          uid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 4. Fingerprint
      await setDoc(doc(db, 'users', user.uid, 'fingerprint', 'current'), {
        collaborationSignature: 'Systems thinker with full-stack capability and strong product intuition from prior startup exposure',
        narrativeVoice: 'Mentor + Analyst',
        uniqueValueProposition: 'Tech + Business mindset',
        narrativeArc: {
          theme: 'Growth and Problem-solving',
          storyFrames: [{ audience: 'Recruiters', frame: 'Full-stack developer with ML depth' }]
        },
        softSkills: [{ skill: 'Teamwork', evidence: 'Collaborated with beta users' }, { skill: 'Communication', evidence: 'Portfolio site' }]
      });

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error populating demo data:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={populate}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
          status === 'success' ? 'bg-emerald-600 text-white' : 
          status === 'error' ? 'bg-red-600 text-white' : 
          'bg-slate-800 text-white hover:bg-slate-700'
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        {status === 'success' ? 'Populated!' : status === 'error' ? 'Error!' : 'Populate Demo Data'}
      </button>
    </div>
  );
}
