'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MessageSquare, ArrowRight, Brain, Target, Briefcase, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const { user, loading, signIn, signInAsGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 font-display tracking-tight">Career Mentor</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInAsGuest}
            className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Try Demo
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signIn}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            Sign In
          </motion.button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-slate-50"></div>
          
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Your AI-Powered Career Co-Pilot</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 font-display leading-[1.1]"
            >
              Navigate your career with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                intelligent guidance.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Track your skills, document your projects, manage applications, and get personalized advice from an AI mentor that remembers your entire journey.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signIn}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-lg hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20"
              >
                Get Started with Google 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInAsGuest}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-full font-medium text-lg hover:border-indigo-300 hover:text-indigo-700 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Try Live Demo
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display tracking-tight mb-4">Everything you need to land the role</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">A comprehensive suite of tools designed to give you an unfair advantage in your career journey.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Skill Tracking",
                  desc: "Build a living ledger of your technical and soft skills. Know exactly what you've learned and where your gaps are.",
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                  border: "border-indigo-100"
                },
                {
                  icon: Target,
                  title: "Project Registry",
                  desc: "Document your projects with context. Turn your GitHub repos into compelling narratives for hiring managers.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  border: "border-emerald-100"
                },
                {
                  icon: Briefcase,
                  title: "Application Tracker",
                  desc: "Log every application, track interview stages, and let the AI find patterns in what works for your profile.",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  border: "border-amber-100"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className={`w-14 h-14 ${feature.bg} ${feature.border} border rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {feature.desc}
                  </p>
                  <div className="flex items-center text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display tracking-tight mb-4">How it works</h2>
              <p className="text-lg text-slate-600">Three steps to career clarity</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Import Your Profile', desc: 'Connect your GitHub, upload your resume, or manually add your skills and projects.' },
                { step: '02', title: 'Get AI Analysis', desc: 'Our AI mentor analyzes your profile, identifies gaps, and creates a personalized roadmap.' },
                { step: '03', title: 'Level Up & Apply', desc: 'Follow your roadmap, track applications, and get real-time interview prep from your mentor.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-4">{item.step}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-24 px-6 bg-slate-900 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6">Ready to accelerate your career?</h2>
            <p className="text-slate-400 text-lg mb-10">Join students who are using AI to land their dream internships and jobs.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signIn}
                className="px-8 py-4 bg-white text-slate-900 rounded-full font-medium text-lg hover:bg-slate-100 transition-colors"
              >
                Get Started — Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInAsGuest}
                className="px-8 py-4 bg-transparent text-white border border-slate-600 rounded-full font-medium text-lg hover:border-slate-400 transition-colors"
              >
                Try Demo First
              </motion.button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-sm text-slate-500">
        <p>Built with ❤️ for hackathon by AI Career Mentor team</p>
      </footer>
    </div>
  );
}
