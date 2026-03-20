'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { LayoutDashboard, BookOpen, Briefcase, FileText, MessageSquare, LogOut, ChevronRight, Fingerprint, Map } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { logOut, user } = useAuth();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Skills', href: '/skills', icon: BookOpen },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'AI Mentor', href: '/mentor', icon: MessageSquare },
    { name: 'Career Fingerprint', href: '/fingerprint', icon: Fingerprint },
    { name: 'Time-to-Ready', href: '/roadmap', icon: Map },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col text-slate-300 font-sans">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-3 font-display tracking-tight">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          Career Mentor
        </h1>
      </div>
      
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Menu</div>
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {link.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-500/50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-sm">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
