'use client';

import { motion } from 'motion/react';
import { Target, TrendingUp, Trophy } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

export default function SkillsVisualizer({ skills }: { skills: Skill[] }) {
  if (!skills || skills.length === 0) return null;

  // 1. Calculate category distribution
  const categories = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSkills = skills.length;
  const categoryColors: Record<string, string> = {
    Technical: 'bg-indigo-500',
    Soft: 'bg-emerald-400',
    Domain: 'bg-amber-400',
  };

  // 2. Find top 5 skills by proficiency
  const topSkills = [...skills]
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 5);

  const averageProficiency = (skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Your Skills Portfolio</h2>
          <p className="text-sm text-slate-500">You&apos;ve secured <span className="font-bold text-indigo-600">{totalSkills}</span> distinct skills!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Side: Top Skills Graph */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Top Proficiencies
          </h3>
          <div className="space-y-4">
            {topSkills.map((skill, index) => (
              <div key={skill.id} className="relative">
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className="text-slate-800">{skill.name}</span>
                  <span className="text-slate-500">{skill.proficiency} / 5</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.proficiency / 5) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${categoryColors[skill.category] || 'bg-slate-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Category Breakdown & Stats */}
        <div className="flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Target className="w-4 h-4" /> Distribution
          </h3>
          
          {/* Stacked Bar */}
          <div className="h-4 w-full flex rounded-full overflow-hidden mb-6 bg-slate-100">
            {Object.entries(categories).map(([cat, count], index) => {
              const width = `${(count / totalSkills) * 100}%`;
              return (
                <motion.div
                  key={cat}
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 0.8, delay: 0.3 + (index * 0.1) }}
                  className={`h-full ${categoryColors[cat] || 'bg-slate-400'}`}
                  title={`${cat}: ${count}`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
               <div className="text-2xl font-black font-display text-slate-800">{averageProficiency}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Rating</div>
            </div>
            {Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${categoryColors[cat] || 'bg-slate-400'}`}></div>
                  <div className="text-2xl font-black font-display text-slate-800">{count}</div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full text-center">{cat}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
