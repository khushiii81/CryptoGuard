'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Menu, Zap, FileText, ScrollText, BookOpen, Activity } from 'lucide-react';

const navLinks = [
  { href: '/',          label: 'Overview',     icon: <Activity   className="w-3.5 h-3.5" />, code: '01' },
  { href: '/simulator', label: 'Live Engine',  icon: <Zap        className="w-3.5 h-3.5" />, code: '02' },
  { href: '/policies',  label: 'Rule Base',    icon: <FileText   className="w-3.5 h-3.5" />, code: '03' },
  { href: '/logs',      label: 'Syslog',       icon: <ScrollText className="w-3.5 h-3.5" />, code: '04' },
  { href: '/docs',      label: 'Architecture', icon: <BookOpen   className="w-3.5 h-3.5" />, code: '05' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'backdrop-blur-xl' : ''
      }`}
        style={{ background: scrolled ? 'rgba(6,10,20,0.95)' : 'rgba(6,10,20,0.8)', borderBottom: '1px solid #1A2540' }}>



        {/* Main nav row */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative"
              >
                <Shield className="w-7 h-7 text-[#00F0FF]" strokeWidth={1.5} />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ boxShadow: ['0 0 0px rgba(0,240,255,0)', '0 0 16px rgba(0,240,255,0.6)', '0 0 0px rgba(0,240,255,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <div className="font-mono font-black text-base leading-none tracking-wide">
                  <span className="text-white">Crypto</span>
                  <span className="text-[#00F0FF]">Guard</span>
                </div>
                <div className="font-mono text-[8px] text-slate-600 tracking-[0.25em] uppercase mt-0.5">
                  Firewall Simulator
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <motion.nav 
              initial="hidden" animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
              }}
              className="hidden lg:flex items-center gap-0.5 ml-auto"
            >
              {navLinks.map(link => {
                const active = pathname === link.href;
                return (
                  <motion.div key={link.href} variants={{
                    hidden: { opacity: 0, y: -10 },
                    show: { opacity: 1, y: 0 }
                  }}>
                    <Link href={link.href}
                    className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[11px] font-bold tracking-wide transition-all duration-200 ${
                      active ? 'text-[#00F0FF]' : 'text-slate-500 hover:text-slate-200'
                    }`}
                    style={active ? { background: 'rgba(0,240,255,0.07)' } : {}}>
                    <span>{link.icon}</span>
                    <span>{link.label}</span>

                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,240,255,0.2)' }}
                      />
                    )}

                    {/* Bottom border on active */}
                    {active && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full"
                        style={{ background: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }}
                      />
                    )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Right side */}
            <div className="flex items-center gap-3 lg:hidden ml-auto">


              {/* Mobile toggle */}
              <motion.button
                id="mobile-nav-toggle"
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-lg border border-[#1A2540] text-slate-500 hover:text-[#00F0FF] hover:border-[#00F0FF]/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={mobileOpen ? 'x' : 'm'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}>
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 lg:hidden flex flex-col"
              style={{ background: '#0A0F1E', borderLeft: '1px solid #1A2540' }}
            >
              {/* Drawer header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1A2540]">
                <Shield className="w-6 h-6 text-[#00F0FF]" strokeWidth={1.5} />
                <span className="font-mono font-black text-white">Crypto<span className="text-[#00F0FF]">Guard</span></span>
                <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-600 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>



              {/* Links */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navLinks.map((link, i) => {
                  const active = pathname === link.href;
                  return (
                    <motion.div key={link.href}
                      initial={{ x: 24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06 }}>
                      <Link href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm font-bold transition-all ${
                          active
                            ? 'text-[#00F0FF]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        style={active ? { background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.15)' }
                          : { border: '1px solid transparent' }}>
                        <span style={{ color: active ? '#00F0FF' : '#475569' }}>{link.icon}</span>
                        {link.label}
                        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00F0FF]" style={{ boxShadow: '0 0 6px #00F0FF' }} />}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>


            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
