'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState, useRef } from 'react';
import { collection, query, getDocs, getDoc, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { handleFirestoreError, OperationType } from '@/lib/firestore-error';

export default function MentorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileContext, setProfileContext] = useState('');
  const [summary, setSummary] = useState<{
    skillsCount: number;
    projectsCount: number;
    targetRole: string;
    topSkills: string[];
  }>({ skillsCount: 0, projectsCount: 0, targetRole: '', topSkills: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user profile data to build context
  useEffect(() => {
    if (!user) return;
    
    const fetchProfileData = async () => {
      try {
        const skillsSnap = await getDocs(collection(db, 'users', user.uid, 'skills'));
        const projectsSnap = await getDocs(collection(db, 'users', user.uid, 'projects'));
        const appsSnap = await getDocs(collection(db, 'users', user.uid, 'applications'));
        const roadmapSnap = await getDoc(doc(db, 'users', user.uid, 'roadmap', 'current'));
        
        const skills = skillsSnap.docs.map(d => d.data());
        const projects = projectsSnap.docs.map(d => d.data());
        const apps = appsSnap.docs.map(d => d.data());
        const roadmap = roadmapSnap.exists() ? roadmapSnap.data() : null;

        setSummary({
          skillsCount: skills.length,
          projectsCount: projects.length,
          targetRole: roadmap?.targetRole || 'Not set',
          topSkills: skills.sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0)).slice(0, 3).map(s => s.name)
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
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/messages`);
    });
    return () => unsubscribe();
  }, [user]);

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
      });

      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Format history for Gemini
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Add the new user message to history
      history.push({ role: 'user', parts: [{ text: userMessageText }] });

      // Call Gemini
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: history,
        config: {
          systemInstruction: profileContext,
        }
      });

      const modelText = response.text || 'I am sorry, I could not generate a response.';

      // Save model message
      const modelMsgId = uuidv4();
      const modelMsgRef = doc(db, 'users', user.uid, 'messages', modelMsgId);
      await setDoc(modelMsgRef, {
        uid: user.uid,
        role: 'model',
        content: modelText,
        createdAt: serverTimestamp(),
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
      }).catch(e => {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/messages/${errorMsgId}`);
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">AI Career Mentor</h1>
          <p className="text-slate-600 mt-1">Your personalized advisor that remembers your journey.</p>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
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

            {messages.map((msg) => (
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
                I see <span className="font-semibold text-slate-900">{summary.skillsCount} skills</span> (top: {summary.topSkills.join(', ')}) 
                and <span className="font-semibold text-slate-900">{summary.projectsCount} projects</span>. 
                Ask me anything about your journey!
              </p>
            </div>

            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for resume feedback, interview prep, or career advice..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent focus:bg-white transition-all outline-none"
                disabled={isLoading}
              />
              <button
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
    </AppLayout>
  );
}
