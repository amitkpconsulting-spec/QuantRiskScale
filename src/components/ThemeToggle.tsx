import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
  const { toggleTheme, isReportLight } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 border text-xs font-mono font-bold uppercase tracking-wider ${
        isReportLight
          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700 shadow-sm'
      } ${className}`}
      title={
        isReportLight
          ? "Switch to 'Deep Space' Dark Mode"
          : "Switch to 'Report' Light Mode (High-contrast for Board Presentations & PDF Printing)"
      }
      aria-label="Toggle visual theme"
    >
      <div className="relative flex items-center justify-center">
        {isReportLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:rotate-45 duration-300" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:-rotate-12 duration-300" />
        )}
      </div>

      {!compact ? (
        <div className="flex items-center space-x-1.5">
          <span className="hidden sm:inline">
            {isReportLight ? 'Report Mode' : 'Deep Space'}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border hidden md:inline-block leading-none uppercase tracking-tight ${
              isReportLight
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-zinc-800 text-cyan-400 border-zinc-700'
            }`}
          >
            {isReportLight ? 'Light / PDF' : 'Dark'}
          </span>
        </div>
      ) : (
        <span className="sr-only">
          {isReportLight ? 'Report Light Mode' : 'Deep Space Dark Mode'}
        </span>
      )}
    </button>
  );
};
