'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { LayoutDashboard, BookOpen, Briefcase, FileText, MessageSquare, LogOut, ChevronRight, Fingerprint, Map, Menu, X, Search, Mic, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { logOut, user, isGuest } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Skills', href: '/skills', icon: BookOpen },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Job Board', href: '/jobs', icon: Search },
    { name: 'AI Mentor', href: '/mentor', icon: MessageSquare },
    { name: 'Mock Interview', href: '/interview', icon: Mic },
    { name: 'Career Fingerprint', href: '/fingerprint', icon: Fingerprint },
    { name: 'Time-to-Ready', href: '/roadmap', icon: Map },
  ];

  const sidebarContent = (
    <>
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Career<span className="text-indigo-400">Mentor</span>
          </span>
        </div>
      </div>
      
      {isGuest && (
        <div className="mx-4 mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-400 font-medium">🎮 Demo Mode</p>
          <p className="text-[10px] text-amber-500/70 mt-0.5">Exploring with sample data</p>
        </div>
      )}

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
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {link.name}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-sm">
            {user?.email?.[0].toUpperCase() || (isGuest ? 'D' : 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.displayName || (isGuest ? 'Demo User' : 'User')}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || (isGuest ? 'Guest Account' : '')}</p>
          </div>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          {isGuest ? 'Exit Demo' : 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300 font-sans animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex-col text-slate-300 font-sans hidden md:flex">
        {sidebarContent}
      </div>
    </>
  );
}
