'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft, FileText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using CareerMentor AI ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you may not use the Service. These terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    title: '2. Description of Service',
    content: `CareerMentor AI is an AI-powered career advisory platform designed to help students and early-career professionals with internship search, resume analysis, mock interviews, skills tracking, and personalised career roadmaps. The Service is provided on an "as is" and "as available" basis.`,
  },
  {
    title: '3. User Accounts',
    content: `You may sign in using Google authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account. We reserve the right to terminate accounts at our discretion, particularly for violations of these Terms.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the Service; (c) transmit any harmful, offensive, or disruptive content; (d) use the Service to harass, abuse, or harm another person; (e) reverse-engineer or attempt to extract the source code of the Service; (f) use the Service in any way that could damage, disable, or impair the Service.`,
  },
  {
    title: '5. Intellectual Property',
    content: `All content, features, and functionality of the Service — including text, graphics, logos, and software — are the exclusive property of CareerMentor AI and its licensors. You may not reproduce, distribute, or create derivative works without our express written permission. Your submitted data (profiles, resumes, etc.) remains yours; you grant us a limited licence to process it to provide the Service.`,
  },
  {
    title: '6. AI-Generated Content Disclaimer',
    content: `CareerMentor AI uses artificial intelligence to generate career advice, cover letters, interview questions, and skills analysis. While we strive for accuracy and helpfulness, AI-generated content may contain errors or inaccuracies. You should independently verify any career-critical information before acting on it. We are not responsible for decisions made based on AI-generated content.`,
  },
  {
    title: '7. Privacy',
    content: `Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by law, CareerMentor AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a prominent notice on the Service. Your continued use of the Service after changes constitutes acceptance of the updated Terms. It is your responsibility to review these Terms periodically.`,
  },
  {
    title: '10. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in India.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Career<span className="text-indigo-600">Mentor</span> AI
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <FileText className="w-3.5 h-3.5" />
          Legal Document
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Terms &amp; Conditions
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Last updated: March 2026. Please read these terms carefully before using CareerMentor AI.
        </p>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 divide-y divide-slate-100 overflow-hidden">
          {sections.map((section, i) => (
            <div key={i} className="p-8 hover:bg-slate-50/50 transition-colors">
              <h2 className="text-base font-bold text-indigo-700 mb-3 tracking-tight">{section.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
          <p className="text-sm text-indigo-700 font-medium">
            Questions about our Terms?{' '}
            <Link href="/contact" className="underline underline-offset-2 hover:text-indigo-900">
              Contact our support team
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CareerMentor AI. All rights reserved.
      </footer>
    </div>
  );
}
