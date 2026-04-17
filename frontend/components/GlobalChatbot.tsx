'use client';

import { useState, useRef, useEffect } from 'react';
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

  // Build minimal context without updating state continuously
  useEffect(() => {
    if (!user || !isOpen) return;
    
    const fetchProfileData = async () => {
      try {
        const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
        const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
        const appsSnap = await getDocs(collection(db, 'users', user.uid, 'applications'));
        const roadmapSnap = await getDoc(doc(db, 'users', user.uid, 'roadmap', 'current'));
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
You are the AI Career Mentor embedded directly on the user's dashboard.
Follow all your standard systems and protocols.
Provide direct, short, concise, and highly actionable answers since you are in a floating widget.

HERE IS THE STUDENT'S DATA:
Skills: ${skills.map(s => s.name).join(', ')}
Projects: ${projects.map(p => p.name).join(', ')}
Apps: ${apps.map(a => `${a.company} (${a.status})`).join(', ')}
GitHub Repos:
${githubReposText}
`;
        setProfileContext(context);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfileData();
  }, [user, isOpen]);

  // Listen to messages
  useEffect(() => {
    if (!user || !isOpen) return;
    const q = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const grouped = new Map<string, any[]>();
      msgs.forEach(m => {
        const sid = m.sessionId || 'legacy';
        if (!grouped.has(sid)) grouped.set(sid, []);
        grouped.get(sid)!.push(m);
      });

      // Find the most recent session
      let latestSession = '';
      let latestTime = 0;
      grouped.forEach((groupMsgs, sid) => {
        const t = groupMsgs[groupMsgs.length - 1].createdAt?.toMillis() || 0;
        if (t > latestTime) {
          latestTime = t;
          latestSession = sid;
        }
      });

      setMessages(msgs);
      setActiveSessionId(prev => prev || latestSession || uuidv4());
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [user, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // If we are already on the mentor page, don't show the floating widget
  if (pathname === '/mentor') return null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !profileContext) return;

    const userMessageText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsgId = uuidv4();
    try {
      await setDoc(doc(db, 'users', user.uid, 'messages', userMsgId), {
        uid: user.uid, role: 'user', content: userMessageText, createdAt: serverTimestamp(), sessionId: activeSessionId
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userMessageText, history: messages, profileContext, userId: user.uid }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { text: modelText } = await res.json();
      
      const finalModelText = await processAgentActions(modelText || 'I am sorry, I could not generate a response.', user.uid, db);

      await setDoc(doc(db, 'users', user.uid, 'messages', uuidv4()), {
        uid: user.uid, role: 'model', content: finalModelText, createdAt: serverTimestamp(), sessionId: activeSessionId
      });
    } catch (error) {
      await setDoc(doc(db, 'users', user.uid, 'messages', uuidv4()), {
        uid: user.uid, role: 'model', content: 'Sorry, I encountered an error. Please try again.', createdAt: serverTimestamp(), sessionId: activeSessionId
      }).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  const activeMessages = messages.filter(m => (m.sessionId || 'legacy') === (activeSessionId || 'legacy'));

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Mentor"
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white z-50 hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display tracking-tight">AI Mentor</h3>
                  <p className="text-[10px] text-indigo-200 font-medium">Global Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Mentor"
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {activeMessages.length === 0 && (
                <div className="text-center py-10 opacity-60">
                  <Bot className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Hi! Paste your GitHub profile or resume link, and ask me to add your skills automatically!</p>
                </div>
              )}
              {activeMessages.map((msg) => (
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
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <label htmlFor="chatbot-input" className="sr-only">Chat message</label>
                <input
                  id="chatbot-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me to extract skills..."
                  disabled={isLoading || !profileContext}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!input.trim() || isLoading || !profileContext}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
