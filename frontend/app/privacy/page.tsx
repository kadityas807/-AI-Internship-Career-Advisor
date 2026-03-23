'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as: (a) Account information — your name, email address, and profile picture obtained via Google Sign-In; (b) Career data — skills, projects, work experience, education, and resume content you upload or enter; (c) GitHub data — repository metadata you explicitly choose to import (we never store your code); (d) Usage data — pages visited, features used, and interactions with the AI mentor; (e) Device data — browser type, operating system, and IP address for security and analytics purposes.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to: (a) provide, maintain, and improve the Service; (b) personalise your AI career mentor experience; (c) generate tailored cover letters, roadmaps, and interview questions based on your profile; (d) analyse usage trends to improve the platform; (e) send you important notifications about your account or changes to the Service; (f) detect, investigate, and prevent fraudulent activity or abuse; (g) comply with legal obligations.`,
  },
  {
    title: '3. AI Data Processing',
    content: `Your profile and career data are processed by AI models to generate personalised career advice, skills gap analysis, cover letters, and interview preparation. This processing occurs through secure API calls to third-party AI providers (such as Google Gemini). We do not use your personal data to train AI models. Data sent to AI providers is governed by their respective privacy policies and is used only to generate responses for your session.`,
  },
  {
    title: '4. Information Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with: (a) Service providers who assist us in operating the platform (e.g., Firebase, Google Cloud) under strict confidentiality agreements; (b) AI providers to generate content on your behalf; (c) Law enforcement or government agencies when required by law; (d) Successor entities in the event of a merger, acquisition, or sale of assets — with prior notice to you. We will never share your career data with potential employers without your explicit consent.`,
  },
  {
    title: '5. Data Storage and Security',
    content: `Your data is stored securely using Google Firebase Firestore, which employs industry-standard encryption at rest and in transit. We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '6. Your Rights and Choices',
    content: `You have the right to: (a) access the personal information we hold about you; (b) correct inaccurate or incomplete data; (c) delete your account and all associated data; (d) export your career profile data in a portable format; (e) opt out of non-essential communications; (f) restrict or object to certain processing activities. To exercise any of these rights, please contact us at support@careermentorai.com.`,
  },
  {
    title: '7. Cookies and Tracking',
    content: `We use session cookies to maintain your authentication state and improve user experience. We do not use third-party advertising cookies or tracker pixels. You can configure your browser to refuse cookies, but this may affect the functionality of the Service. We use anonymised analytics to understand usage patterns and improve the platform.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `The Service is intended for users aged 16 and over. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal data from a child under 16 without parental consent, we will take steps to delete that information promptly. If you believe we may have collected information from a child, please contact us immediately.`,
  },
  {
    title: '9. Third-Party Services',
    content: `The Service integrates with third-party services including Google Sign-In, GitHub API, and AI providers. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services. Links to third-party websites from the Service are provided for convenience and do not constitute an endorsement.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date, and where appropriate, by sending you an email notification. Your continued use of the Service after changes constitutes your acceptance of the revised policy.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at: support@careermentorai.com. We aim to respond to all privacy-related inquiries within 48 hours.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Your Privacy Matters
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Last updated: March 2026. We are committed to protecting your personal information and your right to privacy.
        </p>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pb-24">
        {/* Summary card */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
          <h2 className="font-bold text-slate-900 mb-2 text-sm">Privacy at a Glance</h2>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>✅ We never sell your data to third parties</li>
            <li>✅ We never share your career info with employers without consent</li>
            <li>✅ Your GitHub code is never stored — only metadata</li>
            <li>✅ You can delete your account and all data at any time</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 divide-y divide-slate-100 overflow-hidden">
          {sections.map((section, i) => (
            <div key={i} className="p-8 hover:bg-slate-50/50 transition-colors">
              <h2 className="text-base font-bold text-violet-700 mb-3 tracking-tight">{section.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-violet-50 border border-violet-100 text-center">
          <p className="text-sm text-violet-700 font-medium">
            Privacy questions?{' '}
            <Link href="/contact" className="underline underline-offset-2 hover:text-violet-900">
              Reach out to our support team
            </Link>.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CareerMentor AI. All rights reserved.
      </footer>
    </div>
  );
}
