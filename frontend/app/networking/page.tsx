'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Users, Plus, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Status = 'Pending' | 'Replied' | 'No Response';

interface Contact {
  id?: string;
  name: string;
  company: string;
  dateContacted: string;
  status: Status;
  notes: string;
}

interface FollowUp {
  contactId: string;
  message: string;
}

export default function NetworkingPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [generatingFollowUp, setGeneratingFollowUp] = useState<string | null>(null);
  const [form, setForm] = useState<Contact>({ name: '', company: '', dateContacted: new Date().toISOString().split('T')[0], status: 'Pending', notes: '' });

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'contacts')).then(snap => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contact)));
      setLoading(false);
    });
  }, [user]);

  const addContact = async () => {
    if (!user || !form.name.trim() || !form.company.trim()) return;
    const docRef = await addDoc(collection(db, 'users', user.uid, 'contacts'), form);
    setContacts(prev => [...prev, { ...form, id: docRef.id }]);
    setForm({ name: '', company: '', dateContacted: new Date().toISOString().split('T')[0], status: 'Pending', notes: '' });
    setShowForm(false);
  };

  const updateStatus = async (id: string, status: Status) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'contacts', id), { status });
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'contacts', id));
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const generateFollowUp = async (contact: Contact) => {
    if (!contact.id) return;
    setGeneratingFollowUp(contact.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a brief, friendly follow-up message (max 80 words) from a student who reached out to ${contact.name} at ${contact.company} on ${contact.dateContacted} but hasn't received a reply. The message should be polite, add value, and have a clear ask. Return only the message text.`,
          schema: { type: 'STRING' },
        }),
      });
      const { text } = await res.json();
      setFollowUps(prev => [...prev.filter(f => f.contactId !== contact.id), { contactId: contact.id!, message: text?.replace(/^"|"$/g, '') || '' }]);
    } catch { /* ignore */ }
    setGeneratingFollowUp(null);
  };

  const statusColors: Record<Status, string> = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Replied': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'No Response': 'bg-red-100 text-red-600 border-red-200',
  };

  const [now] = useState(() => Date.now());
  const daysSince = (date: string) => Math.floor((now - new Date(date).getTime()) / 86400000);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Networking Tracker</h1>
              <p className="text-slate-500 mt-1">Track your outreach and get AI-suggested follow-ups.</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm shrink-0">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4">
              <h3 className="font-bold text-slate-900">Add Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name *" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Company *" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input type="date" value={form.dateContacted} onChange={e => setForm(p => ({ ...p, dateContacted: e.target.value }))} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Status }))} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>Pending</option><option>Replied</option><option>No Response</option>
                </select>
              </div>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm">Cancel</button>
                <button onClick={addContact} disabled={!form.name || !form.company} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 text-sm transition-colors">Save Contact</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No contacts yet</p>
            <p className="text-sm">Add your first networking contact to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => {
              const fu = followUps.find(f => f.contactId === contact.id);
              const days = daysSince(contact.dateContacted);
              const needsFollowUp = contact.status === 'No Response' && days >= 7;
              return (
                <motion.div key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-white border rounded-2xl p-5 shadow-sm ${needsFollowUp ? 'border-amber-200' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-slate-900">{contact.name}</h3>
                      <p className="text-sm text-slate-500">{contact.company} · {days}d ago</p>
                      {contact.notes && <p className="text-xs text-slate-400 mt-1">{contact.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={contact.status} onChange={e => updateStatus(contact.id!, e.target.value as Status)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusColors[contact.status]} outline-none cursor-pointer`}>
                        <option>Pending</option><option>Replied</option><option>No Response</option>
                      </select>
                      {needsFollowUp && (
                        <button onClick={() => generateFollowUp(contact)} disabled={generatingFollowUp === contact.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full hover:bg-amber-200 transition-colors font-semibold">
                          {generatingFollowUp === contact.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                          Follow Up
                        </button>
                      )}
                      <button onClick={() => deleteContact(contact.id!)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {fu && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                      <p className="text-xs font-semibold text-amber-600 mb-1">💬 Suggested Follow-Up:</p>
                      {fu.message}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
