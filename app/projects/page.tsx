'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Plus, Trash2, Edit2, ExternalLink, FolderGit2, X, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { motion, AnimatePresence } from 'motion/react';
import SmartImport from '@/components/SmartImport';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', techStack: '', role: '', outcome: '', link: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/projects`);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const projectId = formData.id || uuidv4();
    const projectRef = doc(db, 'users', user.uid, 'projects', projectId);

    const techStackArray = formData.techStack.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await setDoc(projectRef, {
        uid: user.uid,
        name: formData.name,
        description: formData.description,
        techStack: techStackArray,
        role: formData.role,
        outcome: formData.outcome,
        link: formData.link,
        createdAt: formData.id ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setIsModalOpen(false);
      setFormData({ id: '', name: '', description: '', techStack: '', role: '', outcome: '', link: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/projects/${projectId}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'projects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/projects/${id}`);
    }
  };

  const openEditModal = (project: any) => {
    setFormData({
      id: project.id,
      name: project.name,
      description: project.description,
      techStack: (project.techStack || []).join(', '),
      role: project.role || '',
      outcome: project.outcome || '',
      link: project.link || '',
    });
    setIsModalOpen(true);
  };

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Registry</h1>
          <p className="text-slate-500 mt-1">Document what you&apos;ve built and the impact it had.</p>
        </div>
        <div className="flex items-center gap-3">
          <SmartImport />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFormData({ id: '', name: '', description: '', techStack: '', role: '', outcome: '', link: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-5 h-5" /> Add Project
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id} 
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all relative group flex flex-col h-full"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(project)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <FolderGit2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(project.techStack || []).map((tech: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200/50">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6 flex-1 leading-relaxed">{project.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-auto pt-4 border-t border-slate-100">
                {project.role && (
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Your Role</span>
                    <p className="text-slate-600">{project.role}</p>
                  </div>
                )}
                {project.outcome && (
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Outcome / Impact</span>
                    <p className="text-slate-600">{project.outcome}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {projects.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <FolderGit2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects added yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Start documenting your work to build a strong portfolio for your applications.</p>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{formData.id ? 'Edit Project' : 'Add Project'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none" placeholder="e.g. Expense Tracker" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link (Optional)</label>
                    <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none" placeholder="https://github.com/..." />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tech Stack (comma separated)</label>
                  <input type="text" value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none" placeholder="React, Node.js, MongoDB" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none h-28 resize-none" placeholder="What is this project? What problem does it solve?" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Role (Optional)</label>
                    <textarea value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none h-28 resize-none" placeholder="What specifically did you build or design?" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Outcome / Impact (Optional)</label>
                    <textarea value={formData.outcome} onChange={e => setFormData({...formData, outcome: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all outline-none h-28 resize-none" placeholder="e.g. Reduced load time by 40%, 100+ active users." />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20">Save Project</motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
