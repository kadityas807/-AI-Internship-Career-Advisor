'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Trophy, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
  requirement: string;
}

export default function BadgesPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [skillsSnap, projectsSnap, appsSnap, roadmapSnap, contactsSnap] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'skills')),
        getDocs(collection(db, 'users', user.uid, 'projects')),
        getDocs(collection(db, 'users', user.uid, 'applications')),
        getDocs(collection(db, 'users', user.uid, 'roadmap')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'users', user.uid, 'contacts')).catch(() => ({ docs: [] })),
      ]);
      const skillCount = skillsSnap.docs.length;
      const projectCount = projectsSnap.docs.length;
      const appCount = appsSnap.docs.length;
      const hasRoadmap = roadmapSnap.docs.length > 0;
      const roadmapScore = hasRoadmap ? (roadmapSnap.docs[0]?.data()?.readinessScore || 0) : 0;
      const contactCount = contactsSnap.docs.length;

      const badgeList: Badge[] = [
        { id: '1', emoji: '🌱', name: 'First Step', description: 'Added your first skill', unlocked: skillCount >= 1, requirement: 'Add 1 skill' },
        { id: '2', emoji: '🧠', name: 'Skill Builder', description: 'Added 5 or more skills', unlocked: skillCount >= 5, requirement: 'Add 5 skills' },
        { id: '3', emoji: '⚡', name: 'Power User', description: 'Added 10+ skills', unlocked: skillCount >= 10, requirement: 'Add 10 skills' },
        { id: '4', emoji: '🚀', name: 'Builder', description: 'Added your first project', unlocked: projectCount >= 1, requirement: 'Add 1 project' },
        { id: '5', emoji: '🏗️', name: 'Portfolio Pro', description: 'Added 3 or more projects', unlocked: projectCount >= 3, requirement: 'Add 3 projects' },
        { id: '6', emoji: '📬', name: 'First Application', description: 'Applied to your first job', unlocked: appCount >= 1, requirement: 'Apply to 1 job' },
        { id: '7', emoji: '🎯', name: 'Hustler', description: 'Applied to 5 or more jobs', unlocked: appCount >= 5, requirement: 'Apply to 5 jobs' },
        { id: '8', emoji: '🗺️', name: 'Planner', description: 'Generated your career roadmap', unlocked: hasRoadmap, requirement: 'Generate a roadmap' },
        { id: '9', emoji: '💎', name: 'Interview Ready', description: 'Roadmap readiness score above 80', unlocked: roadmapScore >= 80, requirement: 'Readiness score ≥ 80' },
        { id: '10', emoji: '🤝', name: 'Networker', description: 'Tracked your first connection', unlocked: contactCount >= 1, requirement: 'Add 1 contact' },
        { id: '11', emoji: '🌐', name: 'Network Builder', description: 'Tracked 5 or more connections', unlocked: contactCount >= 5, requirement: 'Add 5 contacts' },
        { id: '12', emoji: '👑', name: 'Career Champion', description: 'Unlocked 8 or more badges', unlocked: false, requirement: 'Unlock 8 badges' },
      ];

      const unlockedCount = badgeList.filter(b => b.unlocked && b.id !== '12').length;
      badgeList[11].unlocked = unlockedCount >= 8;

      setBadges(badgeList);
      setLoading(false);
    };
    load();
  }, [user]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Achievement Badges</h1>
              <p className="text-slate-500 mt-1">Earn badges as you build your career. {!loading && `${unlockedCount}/${badges.length} unlocked.`}</p>
            </div>
          </div>
          {!loading && (
            <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(unlockedCount / badges.length) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" />
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(12).fill(0).map((_, i) => <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-5 border text-center transition-all duration-300 ${badge.unlocked ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}
              >
                <div className="text-4xl mb-3">{badge.emoji}</div>
                <p className={`font-bold text-sm ${badge.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>{badge.name}</p>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{badge.unlocked ? badge.description : <span className="flex items-center justify-center gap-1"><Lock className="w-3 h-3" />{badge.requirement}</span>}</p>
                {badge.unlocked && <div className="mt-2 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full" />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
