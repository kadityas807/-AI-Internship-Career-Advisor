'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, serverTimestamp, getDocs, getDoc, orderBy } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, X, Bot, User as UserIcon, Loader2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion } from 'motion/react';
import { processAgentActions } from '@/lib/agent-actions';

export default function GlobalChatbot() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileContext, setProfileContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) setIsOpen(false);
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!user || !isOpen) return;
    const fetchData = async () => {
      try {
        const [sk, pr, ap, pl] = await Promise.all([
          getDocs(collection(db, 'users', user.uid, 'skills')),
          getDocs(collection(db, 'users', user.uid, 'projects')),
          getDocs(collection(db, 'users', user.uid, 'applications')),
          getDoc(doc(db, 'users', user.uid, 'fingerprint', 'platform_profiles'))
        ]);
        const platforms = pl.exists() ? pl.data() : {};
        let githubText = 'None.';
        if (platforms.github) {
          const user = platforms.github.split('/').filter(Boolean).pop();
          const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=5`);
          if (res.ok) githubText = (await res.json()).map((r: any) => `- ${r.name}`).join('\n');
        }
        setProfileContext(`Skills: ${sk.docs.map(d => d.data().name).join(', ')}\nProjects: ${pr.docs.map(d => d.data().name).join(', ')}\nApps: ${ap.docs.map(d => d.data().company).join(', ')}\nGitHub: ${githubText}`);
      } catch (e) {}
    };
    fetchData();
  }, [user, isOpen]);

  useEffect(() => {
    if (!user || !isOpen) return;
    return onSnapshot(query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc')), (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      const latest = msgs.reduce((a, b) => (b.createdAt?.toMillis() || 0) > (a.createdAt?.toMillis() || 0) ? b : a, msgs[0]);
      setMessages(msgs);
      setActiveSessionId(prev => prev || latest?.sessionId || uuidv4());
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, [user, isOpen]);

  if (pathname === '/mentor') return null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !profileContext) return;
    const txt = input.trim();
    setInput('');
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'messages', uuidv4()), { uid: user.uid, role: 'user', content: txt, createdAt: serverTimestamp(), sessionId: activeSessionId });
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userMessage: txt, history: messages, profileContext, userId: user.uid }) });
      const { text } = await res.json();
      const content = await processAgentActions(text || 'Error.', user.uid, db);
      await setDoc(doc(db, 'users', user.uid, 'messages', uuidv4()), { uid: user.uid, role: 'model', content, createdAt: serverTimestamp(), sessionId: activeSessionId });
    } catch (e) {
      await setDoc(doc(db, 'users', user.uid, 'messages', uuidv4()), { uid: user.uid, role: 'model', content: 'Error.', createdAt: serverTimestamp(), sessionId: activeSessionId }).catch(() => {});
    } finally { setIsLoading(false); }
  };

  const activeMsgs = messages.filter(m => (m.sessionId || 'legacy') === (activeSessionId || 'legacy'));

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Mentor"
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-slate-900 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-lg"><Bot className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="font-bold text-sm">AI Mentor</h3>
                  <p className="text-[10px] text-indigo-200">Global Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Close AI Mentor" className="p-1.5 hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {activeMsgs.length === 0 && (
                <div className="text-center py-10 opacity-60"><Bot className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">Hi! How can I help you today?</p></div>
              )}
              {activeMsgs.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                    {msg.role === 'user' ? msg.content : <div className="prose prose-sm prose-indigo"><ReactMarkdown>{msg.content}</ReactMarkdown></div>}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-indigo-600" /></div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" /><span className="text-xs text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <label htmlFor="chatbot-input" className="sr-only">Chat input</label>
                <input ref={inputRef} id="chatbot-input" type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." disabled={isLoading || !profileContext} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
                <button type="submit" aria-label="Send message" disabled={!input.trim() || isLoading || !profileContext} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"><Send className="w-5 h-5" /></button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
