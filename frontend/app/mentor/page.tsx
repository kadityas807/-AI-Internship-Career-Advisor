'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState, useRef } from 'react';
import { collection, query, getDocs, getDoc, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Send, Bot, User as UserIcon, Loader2, Paperclip, FileText, Sparkles, Mic, Gauge } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import ReactMarkdown from 'react-markdown';
import { processAgentActions } from '@/lib/agent-actions';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';
import { toast } from '@/components/Toast';

export default function MentorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<{ id: string, title: string, preview: string, date: Date }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileContext, setProfileContext] = useState('');
  const [summary, setSummary] = useState<{
    skillsCount: number;
    projectsCount: number;
    targetRole: string;
    topSkills: string[];
    githubLinked?: boolean;
  }>({ skillsCount: 0, projectsCount: 0, targetRole: '', topSkills: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('Voice input is not supported in this browser', 'warning');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
      toast('Voice captured!', 'success');
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast('Voice input failed. Please try again.', 'error');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    toast('Listening... Speak now', 'info');
  };

  // Fetch user profile data to build context
  useEffect(() => {
    if (!user) return;
    
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
        const roadmap = roadmapSnap.exists() ? roadmapSnap.data() : null;
        const platforms = platformsSnap.exists() ? platformsSnap.data() : {};
        
        let githubReposText = 'No GitHub profile linked.';
        if (platforms.github) {
          try {
            const username = platforms.github.split('/').filter(Boolean).pop();
            if (username) {
              const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
              if (res.ok) {
                const repos = await res.json();
                githubReposText = repos.map((r: any) => `- ${r.name} (${r.language || 'N/A'}): ${r.description || 'No description'} | Stars: ${r.stargazers_count}`).join('\n');
              } else {
                githubReposText = 'Could not fetch repositories.';
              }
            }
          } catch (e) {
            githubReposText = 'Error fetching repositories.';
          }
        }

        setSummary({
          skillsCount: skills.length,
          projectsCount: projects.length,
          targetRole: roadmap?.targetRole || 'Not set',
          topSkills: skills.sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0)).slice(0, 3).map(s => s.name),
          githubLinked: !!platforms.github
        });

        const context = `
You are an advanced AI Career Advisor designed to help students become highly competitive candidates for internships and high-paying jobs.

Your goal is NOT to give generic advice. Your goal is to deeply analyze each student and provide personalized, data-driven, and actionable guidance.

You must operate using the following 7 core systems:

---

1. CAREER FINGERPRINT SYSTEM
Analyze the student’s inputs (skills, projects, behavior, communication style, goals) and generate a “Career Fingerprint”.
This must include:
- Thinking style (e.g., problem-solver, systems thinker, fast executor)
- Learning style (depth-first vs breadth-first)
- Strength pattern (technical, communication, execution, creativity)
- Unique combinations (e.g., tech + business mindset)
Output:
- A clear identity statement: “You are a ___ type of candidate”
- What makes the student DIFFERENT from others

---

2. REJECTION INTELLIGENCE ENGINE
Whenever the student shares:
- Rejections
- No responses
- Failed interviews
You must:
- Diagnose the likely reason
- Compare with job expectations
- Provide a corrected version (resume/project/approach)
Output:
- “Likely reason of rejection”
- “What should have been done instead”
- “Actionable fix for next attempt”

---

3. CONFIDENCE CALIBRATION SYSTEM
Compare:
- Student’s self-belief
- Actual skill level
If underconfident:
→ Provide evidence they are ready
If overconfident:
→ Highlight missing gaps clearly
Output:
- Honest reality check
- What level they should apply for

---

4. NARRATIVE ARC BUILDER
Convert student’s experiences into a strong personal story.
Output:
- 2–3 versions of their story:
  - Resume version (short)
  - Interview version (detailed)
  - LinkedIn version (impactful)
Focus on:
- Growth
- Consistency
- Problem-solving journey

---

5. PEER BENCHMARKING SYSTEM
Compare student with similar-level candidates.
Output:
- “You are above average / average / below average”
- Specific gaps (projects, skills, experience)
- What top students are doing differently

---

6. SOFT SKILL EVIDENCE MINING
Extract proof of soft skills from student’s activities.
Map:
- Teamwork
- Leadership
- Communication
- Adaptability
Output:
- Real examples (not generic claims)
- Convert into resume bullet points

---

7. TIME-TO-READY FORECAST SYSTEM
Estimate how long student needs to reach target job.
Output:
- Total weeks required
- Breakdown:
  - Skills
  - Projects
  - Interview prep
- Weekly roadmap

---

GENERAL RULES:
- Do NOT give generic advice
- Always give SPECIFIC, ACTIONABLE steps
- Speak clearly and simply
- Act like a mentor + analyst
- Prioritize real-world results (internship/job readiness)

---

INPUT FORMAT:
Student will provide:
- Skills
- Projects
- Goals
- Current problems

HERE IS THE CURRENT STUDENT'S DATA:
Name: ${user.displayName || 'Student'}

Skills:
${skills.map(s => `- ${s.name} (${s.category}, Proficiency: ${s.proficiency}/5). Evidence: ${s.evidence || 'None'}`).join('\n')}

Projects:
${projects.map(p => `- ${p.name}: ${p.description}. Tech Stack: ${(p.techStack || []).join(', ')}. Role: ${p.role || 'N/A'}. Outcome: ${p.outcome || 'N/A'}`).join('\n')}

Applications (Rejection Intelligence Data):
${apps.map(a => `- ${a.role} at ${a.company}. Status: ${a.status}. Date: ${a.applicationDate || 'N/A'}. Notes: ${a.notes || 'None'}`).join('\n')}

Linked Platform Profiles:
${Object.entries(platforms).filter(([k, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Recent GitHub Repositories:
${githubReposText}

---

OUTPUT FORMAT:
When the user asks for a full profile review or general analysis, use this exact format:
1. Career Fingerprint
2. Current Level Analysis
3. Gaps Identified
4. Action Plan
5. Time-to-Ready Estimate
6. Personal Story
7. Next 3 Immediate Actions

For specific questions (e.g., "Why did I get rejected?", "Am I ready for a senior role?"), apply the relevant core systems directly to answer their question while maintaining your persona.

---

Your mission:
Turn an average student into a top 1% candidate.
        `;
        setProfileContext(context);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    };

    fetchProfileData();
  }, [user]);

  // Listen to chat messages
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const grouped = new Map<string, any[]>();
      msgs.forEach(m => {
        const sid = m.sessionId || 'legacy';
        if (!grouped.has(sid)) grouped.set(sid, []);
        grouped.get(sid)!.push(m);
      });

      const sessionList: { id: string, title: string, preview: string, date: Date }[] = [];
      grouped.forEach((groupMsgs, sid) => {
        const firstUserMsg = groupMsgs.find(m => m.role === 'user');
        const txt = firstUserMsg ? firstUserMsg.content : 'New Conversation';
        const rawDate = groupMsgs[groupMsgs.length - 1].createdAt;
        const date = rawDate?.toDate ? rawDate.toDate() : new Date();
        sessionList.push({ id: sid, title: txt.slice(0, 30) + (txt.length > 30 ? '...' : ''), preview: txt.slice(0, 50), date });
      });
      sessionList.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setSessions(sessionList);
      setMessages(msgs);
      
      setActiveSessionId(prev => {
        if (prev) return prev;
        return sessionList.length > 0 ? sessionList[0].id : uuidv4();
      });

      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/messages`);
    });
    return () => unsubscribe();
  }, [user]);

  const startNewChat = () => {
    setActiveSessionId(uuidv4());
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !profileContext) return;

    const userMessageText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsgId = uuidv4();
    const userMsgRef = doc(db, 'users', user.uid, 'messages', userMsgId);

    try {
      // Save user message
      await setDoc(userMsgRef, {
        uid: user.uid,
        role: 'user',
        content: userMessageText,
        createdAt: serverTimestamp(),
        sessionId: activeSessionId,
      });

      // Call the server-side API route (handles Hindsight memory + Gemini)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMessageText,
          history: messages,
          profileContext,
          userId: user.uid,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { text: modelText } = await res.json();
      
      const finalModelText = await processAgentActions(modelText || 'I am sorry, I could not generate a response.', user.uid, db);

      // Save model message
      const modelMsgId = uuidv4();
      const modelMsgRef = doc(db, 'users', user.uid, 'messages', modelMsgId);
      await setDoc(modelMsgRef, {
        uid: user.uid,
        role: 'model',
        content: finalModelText,
        createdAt: serverTimestamp(),
        sessionId: activeSessionId,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback error message
      const errorMsgId = uuidv4();
      await setDoc(doc(db, 'users', user.uid, 'messages', errorMsgId), {
        uid: user.uid,
        role: 'model',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        createdAt: serverTimestamp(),
        sessionId: activeSessionId,
      }).catch(e => {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/messages/${errorMsgId}`);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.uid);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload file');
      
      // Add a system confirmation message to the chat
      const msgId = uuidv4();
      await setDoc(doc(db, 'users', user.uid, 'messages', msgId), {
        uid: user.uid,
        role: 'model',
        content: `📄 **File uploaded successfully:** \`${file.name}\`. \n\nI have saved this document to my memory. Feel free to ask me questions about it!`,
        createdAt: serverTimestamp(),
        sessionId: activeSessionId,
      });
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendQuickMessage = async (message: string) => {
    if (!user || !profileContext || isLoading) return;
    setIsLoading(true);
    setInput('');

    const userMsgId = uuidv4();
    try {
      await setDoc(doc(db, 'users', user.uid, 'messages', userMsgId), {
        uid: user.uid, role: 'user', content: message, createdAt: serverTimestamp(), sessionId: activeSessionId
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: message, history: messages, profileContext, userId: user.uid }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { text: modelText } = await res.json();
      const finalModelText = await processAgentActions(modelText || 'I am sorry, I could not generate a response.', user.uid, db);
      const modelMsgId = uuidv4();
      await setDoc(doc(db, 'users', user.uid, 'messages', modelMsgId), {
        uid: user.uid, role: 'model',
        content: finalModelText,
        createdAt: serverTimestamp(), sessionId: activeSessionId
      });
    } catch (error: any) {
      const errorMsgId = uuidv4();
      const msg = error?.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Sorry, I encountered an error. Please try again.';
      await setDoc(doc(db, 'users', user.uid, 'messages', errorMsgId), {
        uid: user.uid, role: 'model', content: msg, createdAt: serverTimestamp(), sessionId: activeSessionId
      }).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  const activeMessages = messages.filter(m => (m.sessionId || 'legacy') === (activeSessionId || 'legacy'));

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">AI Career Mentor</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Memory Active
            </span>
          </div>
          <p className="text-slate-600 mt-1">Your personalized advisor that remembers your journey.</p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* History Sidebar */}
          <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hidden md:flex">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Chat History</h3>
              <button onClick={startNewChat} className="text-[10px] px-2.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">NEW CHAT</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sessions.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full text-left p-3 rounded-xl mb-1 transition-colors ${activeSessionId === s.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                >
                  <div className="text-sm font-medium text-slate-800 truncate">{s.title}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{s.preview}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Hello, {user?.displayName?.split(' ')[0]}!</h3>
                <p className="text-slate-600">
                  I&apos;m your AI Career Mentor. I have access to your skills, projects, and applications. Ask me for resume feedback, interview prep, or a skill gap analysis!
                </p>
              </div>
            )}

            {activeMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-100' : 'bg-indigo-100'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-100 text-slate-800'}`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-indigo">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="text-sm text-slate-500 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            {/* Context Summary */}
            <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Mentor Context</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                I&apos;m analyzing your profile for <span className="font-semibold text-slate-900">{summary.targetRole}</span> roles. 
                I see <span className="font-semibold text-slate-900">{summary.skillsCount} skills</span> (top: {summary.topSkills.join(', ')}{summary.skillsCount === 0 ? '' : ''}) 
                and <span className="font-semibold text-slate-900">{summary.projectsCount} projects</span>.
                {summary.githubLinked && <span className="mx-1 px-1.5 py-0.5 bg-indigo-200/50 text-indigo-700 font-medium rounded-md whitespace-nowrap">✓ GitHub connected</span>}
                Ask me anything about your journey!
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                {
                  label: '📄 Generate Resume',
                  msg: `Generate a complete ATS-ready resume for me based on my uploaded CV and all details you know about me. Format it in clean markdown with sections: Summary, Skills, Projects, Education, Experience.`
                },
                {
                  label: '⚡ Optimize for ATS',
                  msg: `Look at my uploaded CV from memory and optimize it for ATS systems used in internship and campus placement selection. Rewrite bullet points with strong action verbs, quantify achievements, and add relevant technical keywords. Show me the improved version.`
                },
                {
                  label: '🎤 Interview Prep',
                  msg: `Based on my uploaded CV and background, give me the top 10 interview questions a recruiter would ask me, and for each question give me a strong sample answer tailored to my actual experience.`
                },
                {
                  label: '📊 Skill Gap Analysis',
                  msg: `Based on my CV and background in memory, compare my current skills against what top candidates for software engineering / tech internships have. List exactly what I should learn next and in what order.`
                },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendQuickMessage(action.msg)}
                  disabled={isLoading || isUploading}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  {action.label}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="p-3 bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                title="Upload resume or document"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={toggleVoice}
                disabled={isLoading || isUploading}
                className={`p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-300' 
                    : 'bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask for resume feedback, interview prep, or career advice...'}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent focus:bg-white transition-all outline-none"
                disabled={isLoading || isUploading}
              />
              <button
                id="mentor-send-btn"
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
