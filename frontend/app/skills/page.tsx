'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Plus, Trash2, Edit2, Star, BookOpen, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { motion, AnimatePresence } from 'motion/react';
import SmartImport from '@/components/SmartImport';
import SkillsVisualizer from '@/components/SkillsVisualizer';
import SkillsGap from '@/components/SkillsGap';

export default function SkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', category: 'Technical', proficiency: 3, evidence: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'skills'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const skillsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSkills(skillsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/skills`);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const skillId = formData.id || uuidv4();
    const skillRef = doc(db, 'users', user.uid, 'skills', skillId);

    try {
      await setDoc(skillRef, {
        uid: user.uid,
        name: formData.name,
        category: formData.category,
        proficiency: Number(formData.proficiency),
        evidence: formData.evidence,
        createdAt: formData.id ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setIsModalOpen(false);
      setFormData({ id: '', name: '', category: 'Technical', proficiency: 3, evidence: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/skills/${skillId}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'skills', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/skills/${id}`);
    }
  };

  const openEditModal = (skill: any) => {
    setFormData({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      evidence: skill.evidence || '',
    });
    setIsModalOpen(true);
  };

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Skills Ledger</h1>
            <p className="text-slate-500 mt-1">Track what you know and how you learned it.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SmartImport />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFormData({ id: '', name: '', category: 'Technical', proficiency: 3, evidence: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/20"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </motion.button>
        </div>
      </motion.div>

      <SkillsVisualizer skills={skills} />

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {skills.map((skill, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              key={skill.id} 
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                <button onClick={() => openEditModal(skill)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(skill.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                {skill.category}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{skill.name}</h3>
              
              <div className="flex items-center gap-1 mb-5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= skill.proficiency ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>

              {skill.evidence && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-1">Evidence</span> 
                    {skill.evidence}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {skills.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">No skills added yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Start building your ledger by adding your first technical or soft skill.</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">{formData.id ? 'Edit Skill' : 'Add New Skill'}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Skill Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" placeholder="e.g. React, Python, Public Speaking" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none">
                    <option value="Technical">Technical</option>
                    <option value="Soft">Soft</option>
                    <option value="Domain">Domain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Proficiency (1-5)</label>
                  <input type="range" min="1" max="5" value={formData.proficiency} onChange={e => setFormData({...formData, proficiency: Number(e.target.value)})} className="w-full accent-indigo-600" />
                  <div className="text-center text-sm font-bold text-indigo-600 mt-2 bg-indigo-50 py-1 rounded-lg w-16 mx-auto">{formData.proficiency} / 5</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Evidence (Optional)</label>
                  <textarea value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none h-28 resize-none" placeholder="How did you learn or demonstrate this? e.g. Built a full-stack app, took a Coursera course." />
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">Save Skill</motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SkillsGap userSkills={skills.map((s: any) => s.name)} />
    </AppLayout>
  );
}
