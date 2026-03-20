'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Plus, Trash2, Edit2, Building2, BrainCircuit, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { GoogleGenAI, Type } from '@google/genai';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analyzingAppId, setAnalyzingAppId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [formData, setFormData] = useState({ id: '', company: '', role: '', status: 'Draft', applicationDate: '', notes: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'applications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date descending (client side for simplicity)
      data.sort((a: any, b: any) => {
        const dateA = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
        const dateB = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
        return dateB - dateA;
      });
      setApps(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/applications`);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const appId = formData.id || uuidv4();
    const appRef = doc(db, 'users', user.uid, 'applications', appId);

    try {
      await setDoc(appRef, {
        uid: user.uid,
        company: formData.company,
        role: formData.role,
        status: formData.status,
        applicationDate: formData.applicationDate || null,
        notes: formData.notes,
        createdAt: formData.id ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setIsModalOpen(false);
      setFormData({ id: '', company: '', role: '', status: 'Draft', applicationDate: '', notes: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/applications/${appId}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'applications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/applications/${id}`);
    }
  };

  const openEditModal = (app: any) => {
    setFormData({
      id: app.id,
      company: app.company,
      role: app.role,
      status: app.status,
      applicationDate: app.applicationDate || '',
      notes: app.notes || '',
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Draft': return 'bg-slate-100 text-slate-700';
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'Interviewing': return 'bg-amber-100 text-amber-700';
      case 'Offer': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Ghosted': return 'bg-slate-200 text-slate-600';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const analyzeRejection = async (app: any) => {
    if (!user) return;
    setAnalyzingAppId(app.id);
    setIsAnalysisModalOpen(true);
    setAnalysisResult(null);

    try {
      const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
      const skills = skillsSnap.docs.map(d => d.data().name);

      const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
      const projects = projectsSnap.docs.map(d => ({ title: d.data().title, description: d.data().description }));

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const prompt = `
        You are an expert technical career coach.
        The user applied for a ${app.role} role at ${app.company} and was ${app.status.toLowerCase()}.
        Their notes on the application: ${app.notes || 'None'}
        Their current skills: ${skills.join(', ')}
        Their current projects: ${JSON.stringify(projects)}

        Diagnose the likely reason for rejection/ghosting based on their profile vs the role.
        Suggest what they should have done differently.
        Provide a concrete, actionable fix for future applications.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              likelyReason: { type: Type.STRING },
              whatShouldHaveBeenDone: { type: Type.STRING },
              actionableFix: { type: Type.STRING }
            },
            required: ['likelyReason', 'whatShouldHaveBeenDone', 'actionableFix']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setAnalysisResult(data);

      // Save analysis to the application document
      await setDoc(doc(db, 'users', user.uid, 'applications', app.id), {
        analysis: data
      }, { merge: true });

    } catch (error) {
      console.error('Error analyzing rejection:', error);
      setAnalysisResult({ error: 'Failed to analyze rejection.' });
    } finally {
      setAnalyzingAppId(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Application Tracker</h1>
          <p className="text-slate-600 mt-1">Log your applications and track your progress.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ id: '', company: '', role: '', status: 'Draft', applicationDate: new Date().toISOString().split('T')[0], notes: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Company</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Role</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-900">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{app.role}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {app.applicationDate ? format(new Date(app.applicationDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(app.status === 'Rejected' || app.status === 'Ghosted') && (
                        <button onClick={() => analyzeRejection(app)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 bg-white border border-indigo-200 rounded-md shadow-sm flex items-center gap-1 text-xs font-medium" title="Analyze Rejection">
                          <BrainCircuit className="w-4 h-4" /> Analyze
                        </button>
                      )}
                      <button onClick={() => openEditModal(app)} className="p-1.5 text-slate-400 hover:text-amber-600 bg-white border border-slate-200 rounded-md shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-md shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No applications tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{formData.id ? 'Edit Application' : 'Add Application'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent" placeholder="e.g. Google, Startup Inc" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent" placeholder="e.g. Frontend Intern" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent">
                    <option value="Draft">Draft</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Ghosted">Ghosted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={formData.applicationDate} onChange={e => setFormData({...formData, applicationDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent h-24" placeholder="Interviewer names, next steps, feedback..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-indigo-500" /> Rejection Analysis
              </h2>
              <button onClick={() => setIsAnalysisModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            {analyzingAppId ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-slate-600">Analyzing application and profile...</p>
              </div>
            ) : analysisResult?.error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">{analysisResult.error}</div>
            ) : analysisResult ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Likely Reason</h3>
                  <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">{analysisResult.likelyReason}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">What Should Have Been Done</h3>
                  <p className="text-slate-800 bg-indigo-50 p-4 rounded-lg border border-indigo-100">{analysisResult.whatShouldHaveBeenDone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Actionable Fix</h3>
                  <p className="text-slate-800 bg-emerald-50 p-4 rounded-lg border border-emerald-100">{analysisResult.actionableFix}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
