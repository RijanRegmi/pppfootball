'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  LayoutDashboard,
  Gem,
  GitCompareArrows,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Prediction Dashboard', href: '/', icon: LayoutDashboard },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-carbon-200/80 dark:border-carbon-800/80 bg-white/80 dark:bg-carbon-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center shadow-lg shadow-pitch-500/20 group-hover:shadow-pitch-500/40 transition-shadow duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-carbon-900 dark:text-white">
                  ProScore
                </span>
                <span className="badge-green text-[9px] py-0.5 px-2">EPL</span>
              </div>
              <span className="text-[10px] font-semibold text-carbon-400 dark:text-carbon-500 tracking-wide -mt-0.5 block">
                Performance Forecasting
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 no-underline ${
                    isActive
                      ? 'text-pitch-600 dark:text-pitch-400 bg-pitch-500/8 dark:bg-pitch-500/10'
                      : 'text-carbon-500 dark:text-carbon-400 hover:text-carbon-900 dark:hover:text-white hover:bg-carbon-100 dark:hover:bg-carbon-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[17px] left-3 right-3 h-[2px] bg-pitch-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-carbon-500 dark:text-carbon-400 hover:text-carbon-900 dark:hover:text-white hover:bg-carbon-100 dark:hover:bg-carbon-800 transition-all duration-200 active:scale-95"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-[18px] h-[18px]" />
                  ) : (
                    <Moon className="w-[18px] h-[18px]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-carbon-500 dark:text-carbon-400 hover:bg-carbon-100 dark:hover:bg-carbon-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-carbon-200 dark:border-carbon-800 bg-white dark:bg-carbon-950"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors no-underline ${
                      isActive
                        ? 'text-pitch-600 dark:text-pitch-400 bg-pitch-500/10'
                        : 'text-carbon-600 dark:text-carbon-400 hover:bg-carbon-100 dark:hover:bg-carbon-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
