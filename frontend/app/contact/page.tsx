'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, ArrowLeft, Mail, MessageCircle, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: 'How do I reset my account?',
    a: 'Since we use Google Sign-In, your account is linked to your Google account. To reset or update your profile information, sign in again with Google and update your details from the Dashboard settings.',
  },
  {
    q: 'My GitHub import is not working. What should I do?',
    a: 'Ensure you have granted the necessary read permissions to CareerMentor AI when prompted during GitHub import. If the issue persists, try disconnecting and reconnecting your GitHub account from the Dashboard, or contact our support team below.',
  },
  {
    q: 'Can I delete my account and data?',
    a: 'Yes, absolutely. You have the right to delete your account and all associated data at any time. Please contact our support team with the subject "Account Deletion Request" and we will process it within 48 hours.',
  },
  {
    q: 'The AI mentor gave me incorrect information. What should I do?',
    a: 'AI-generated content can occasionally contain inaccuracies. If you spot an error, please report it via the contact form below. Always verify critical career information from trusted sources before acting on it.',
  },
  {
    q: 'How can I export my career profile?',
    a: 'Profile export is available from the Dashboard. Go to Settings → Export Profile to download your data in JSON format. If you experience issues, contact our support team.',
  },
  {
    q: 'Is CareerMentor AI free?',
    a: 'Yes! CareerMentor AI is free for students. All core features — AI mentor, job search, cover letter generator, mock interviews, and skills analysis — are available at no cost.',
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, submit to an API. For now, show a success state.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-4">
          <MessageCircle className="w-3.5 h-3.5" />
          We&apos;re here to help
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Contact Support
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Have a question, a bug report, or just want to say hi? We&apos;d love to hear from you. Our team usually responds within 24 hours.
        </p>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-24">

        {/* Quick Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Mail, label: 'Email Us', value: 'support@careermentorai.com', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { icon: Clock, label: 'Response Time', value: 'Within 24–48 hours', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
            { icon: MessageCircle, label: 'Support Hours', value: 'Mon–Fri, 9am–6pm IST', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} border ${item.border} rounded-2xl p-5 flex items-start gap-3`}>
              <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-0.5">{item.label}</div>
                <div className="text-sm font-bold text-slate-800">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Contact Form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h2>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message sent!</h3>
                <p className="text-slate-500 text-sm">Thank you for reaching out. We&apos;ll get back to you within 24–48 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-2 text-indigo-600 text-sm font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                      placeholder="you@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                  <select
                    id="contact-subject"
                    required
                    value={formState.subject}
                    onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all bg-white"
                  >
                    <option value="">Select a topic...</option>
                    <option value="bug">Bug Report</option>
                    <option value="account">Account Issue</option>
                    <option value="ai">AI Mentor Feedback</option>
                    <option value="feature">Feature Request</option>
                    <option value="deletion">Account Deletion Request</option>
                    <option value="privacy">Privacy / Data Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CareerMentor AI. All rights reserved.
      </footer>
    </div>
  );
}
