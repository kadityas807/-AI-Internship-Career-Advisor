'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MessageSquare, ArrowRight, Brain, Target, Briefcase, Sparkles, Github, Mic, Search, TrendingUp, Star, Zap, Shield, ChevronRight } from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring, animate } from 'motion/react';

// Animated counter hook
function useCounter(target: number, duration = 1.5) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

function AnimatedStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const { count, ref } = useCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-black text-white mb-1 tabular-nums">
        <span ref={ref}>{count}</span>{suffix}
      </div>
      <div className="text-indigo-300 text-sm font-medium">{label}</div>
    </motion.div>
  );
}

const features = [
  {
    icon: Search,
    title: "Real Job Board",
    desc: "Live internship listings matched to your skills. Discover and apply — all in one place.",
    color: "text-sky-600",
    bg: "from-sky-50 to-sky-100/50",
    border: "border-sky-200",
    accentBg: "bg-sky-600",
  },
  {
    icon: Brain,
    title: "AI Career Mentor",
    desc: "An AI that remembers your skills, projects, and rejections — and gives advice that actually fits your profile.",
    color: "text-violet-600",
    bg: "from-violet-50 to-violet-100/50",
    border: "border-violet-200",
    accentBg: "bg-violet-600",
  },
  {
    icon: Github,
    title: "GitHub Auto‑Import",
    desc: "One click to pull your repos with tech stack detection. No manual typing, ever.",
    color: "text-slate-700",
    bg: "from-slate-50 to-slate-100/50",
    border: "border-slate-200",
    accentBg: "bg-slate-800",
  },
  {
    icon: Briefcase,
    title: "Cover Letter Generator",
    desc: "Paste a JD, get a tailored cover letter in seconds. Every application has a personal touch.",
    color: "text-amber-600",
    bg: "from-amber-50 to-amber-100/50",
    border: "border-amber-200",
    accentBg: "bg-amber-500",
  },
  {
    icon: Mic,
    title: "Mock Interviews",
    desc: "AI-generated questions for your target role. Get graded answers with improvement tips.",
    color: "text-emerald-600",
    bg: "from-emerald-50 to-emerald-100/50",
    border: "border-emerald-200",
    accentBg: "bg-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Skills Gap Analysis",
    desc: "See exactly what's missing for your dream role. Visual chart, zero guessing.",
    color: "text-rose-600",
    bg: "from-rose-50 to-rose-100/50",
    border: "border-rose-200",
    accentBg: "bg-rose-600",
  },
];

export default function LandingPage() {
  const { user, loading, signIn, signInAsGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-slate-500 text-sm font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ────────────────────────────────────────────── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Career<span className="text-indigo-600">Mentor</span> AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={signInAsGuest}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors rounded-xl hover:bg-slate-50"
          >
            Try Demo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={signIn}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            Sign In →
          </motion.button>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 px-6 overflow-hidden">
        {/* background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-indigo-100/60 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-72 h-72 bg-violet-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-sky-100/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            AI-Powered Career Co‑Pilot
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-[72px] font-black text-slate-900 leading-[1.05] tracking-tight mb-6"
          >
            Your AI mentor that{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500">
              actually remembers you.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track skills, import GitHub repos, discover real jobs, generate cover letters, practice mock interviews — 
            all guided by an AI that knows your full story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={signIn}
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-base hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Get Started — Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={signInAsGuest}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-full font-bold text-base hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <Zap className="w-5 h-5 text-amber-400" />
              Live Demo
            </motion.button>
          </motion.div>

          {/* social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500"
          >
            <div className="flex -space-x-2">
              {['🧑‍💻','👩‍💻','🧑‍🎓','👨‍🎓','👩‍🎓'].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-white flex items-center justify-center text-xs">{e}</div>
              ))}
            </div>
            <span><strong className="text-slate-900">500+</strong> students already levelling up</span>
          </motion.div>
        </div>
      </section>

      {/* ── Animated Stats Bar ────────────────────────────────── */}
      <section className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={500} suffix="+" label="Students onboarded" delay={0} />
          <AnimatedStat value={3200} suffix="+" label="Skills tracked" delay={0.1} />
          <AnimatedStat value={98} suffix="%" label="Interview success rate" delay={0.2} />
          <AnimatedStat value={6} suffix="" label="AI-powered features" delay={0.3} />
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Full Feature Suite
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Everything you need to land the role</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Six AI‑powered tools that work together to give you an unfair advantage.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                className={`group bg-gradient-to-br ${f.bg} border ${f.border} p-7 rounded-3xl transition-all cursor-pointer`}
              >
                <div className={`w-11 h-11 ${f.accentBg} rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">From zero to offer in 3 steps</h2>
            <p className="text-slate-500 text-lg">Your career acceleration, simplified.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" />
            {[
              { step: '01', title: 'Import Your Profile', desc: 'Connect GitHub, upload a PDF resume, or type manually. Your history becomes your AI\'s memory.', color: 'from-indigo-500 to-violet-500' },
              { step: '02', title: 'Get AI Analysis', desc: 'Your mentor reads your full profile, runs skills gap analysis, and creates a personalised roadmap.', color: 'from-violet-500 to-pink-500' },
              { step: '03', title: 'Apply & Level Up', desc: 'Discover real jobs, generate cover letters, practise mock interviews, and track every application.', color: 'from-pink-500 to-rose-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} text-white rounded-2xl flex items-center justify-center text-sm font-black mx-auto mb-5 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────── */}
      <section className="relative py-24 px-6 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/20 blur-3xl rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-indigo-500/30 bg-indigo-500/10 rounded-full text-indigo-300 text-xs font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" /> Free forever for students
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Ready to become a<br />top 1% candidate?
            </h2>
            <p className="text-slate-400 text-lg mb-10">Join hundreds of students who are using AI to land their dream internships.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
                onClick={signIn}
                className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-base hover:bg-indigo-50 transition-all shadow-xl"
              >
                Get Started — It&apos;s Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={signInAsGuest}
                className="px-10 py-4 text-white border border-slate-600 rounded-full font-bold text-base hover:border-slate-400 transition-all"
              >
                Try Live Demo First
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-transparent border-t border-slate-200/50 py-8 px-6 text-center text-sm text-slate-500">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/terms"
            className="px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all font-medium text-xs"
          >
            Terms &amp; Conditions
          </a>
          <span className="text-slate-300">·</span>
          <a
            href="/privacy"
            className="px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all font-medium text-xs"
          >
            Privacy Policy
          </a>
          <span className="text-slate-300">·</span>
          <a
            href="/contact"
            className="px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all font-medium text-xs"
          >
            Contact Support
          </a>
        </div>
        Built with ❤️ for hackathon — <strong className="text-slate-700">CareerMentor AI</strong>
      </footer>
    </div>
  );
}
