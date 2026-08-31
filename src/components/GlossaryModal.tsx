import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  X,
  Copy,
  Check,
  Sparkles,
  Layers,
  AlertTriangle,
  Calculator,
  TrendingDown,
  Percent,
  Sigma,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Info,
  Filter
} from 'lucide-react';
import {
  GLOSSARY_ENTRIES,
  GLOSSARY_CATEGORIES,
  GlossaryEntry
} from '../data/glossaryData';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
  initialCategory?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialSearch = '',
  initialCategory = 'All'
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSearch) setSearchQuery(initialSearch);
      if (initialCategory) setSelectedCategory(initialCategory);
    }
  }, [isOpen, initialSearch, initialCategory]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered glossary entries
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return GLOSSARY_ENTRIES.filter(entry => {
      const matchesCategory =
        selectedCategory === 'All' || entry.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        entry.shortForm.toLowerCase().includes(query) ||
        entry.fullName.toLowerCase().includes(query) ||
        entry.definition.toLowerCase().includes(query) ||
        (entry.mathematicalFormulation && entry.mathematicalFormulation.toLowerCase().includes(query)) ||
        (entry.units && entry.units.toLowerCase().includes(query)) ||
        (entry.exampleOrContext && entry.exampleOrContext.toLowerCase().includes(query)) ||
        (entry.relatedTerms && entry.relatedTerms.some(t => t.toLowerCase().includes(query)))
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core Taxonomy':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Risk Ratings':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Distributions':
        return <Sigma className="w-3.5 h-3.5 text-purple-400" />;
      case 'Mathematical Cause':
        return <Calculator className="w-3.5 h-3.5 text-rose-400" />;
      case 'Financial & RoSI':
        return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Statistical Metrics':
        return <Percent className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div
        className="bg-[#09090b] border border-zinc-700/80 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#050505] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="glossary-title" className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-display">
                  Open FAIR™ Lexicon & Mathematical Reference
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono font-bold">
                  {GLOSSARY_ENTRIES.length} Terms
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Interactive Glossary, Shortform Lookup, Mathematical Formulas & Risk Rating Mechanics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-[#09090b] border-b border-zinc-800/80 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4 text-cyan-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by acronym (ALE, LEF, SV, RoSI), term, formula, or definition..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#050505] text-zinc-100 placeholder-zinc-500 text-sm font-mono rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
            {GLOSSARY_CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              const count =
                category === 'All'
                  ? GLOSSARY_ENTRIES.length
                  : GLOSSARY_ENTRIES.filter(e => e.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                      : 'bg-[#050505] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-cyan-900 text-cyan-200' : 'bg-zinc-800 text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Mathematical Cause Feature Banner (Highlighted when viewing Math or All) */}
        {(selectedCategory === 'All' || selectedCategory === 'Mathematical Cause') && !searchQuery && (
          <div className="mx-4 mt-3 p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-xl flex items-start gap-3 text-xs font-mono">
            <div className="p-2 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-400 shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-300 uppercase tracking-wide">Why Are Inherent Scenarios Rated &quot;SV&quot; (Severe)?</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700/60 font-bold">CORE ONTOLOGY</span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                In Open FAIR, mission-critical assets unmitigated by modern controls face Threat Capabilities (TC ≈ 80%) exceeding baseline controls (RS ≈ 40%), generating near 100% breach probability (Vuln ≈ 1.0). Evaluated against risk tolerance, the 90th percentile loss (P90 &gt; $15M) surpasses the high tolerance boundary, triggering an automatic <strong className="text-rose-300 font-bold">Severe (SV)</strong> rating.
              </p>
            </div>
          </div>
        )}

        {/* Results List / Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 font-mono">
              <Search className="w-8 h-8 text-zinc-600 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-zinc-300">No definitions found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  No term matches &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;. Try searching for &quot;ALE&quot;, &quot;LEF&quot;, &quot;Severe&quot;, or &quot;PERT&quot;.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-bold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEntries.map(entry => {
                const isSelected = selectedEntryId === entry.id;
                const isCopied = copiedId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`bg-[#050505] border rounded-xl p-4 transition-all flex flex-col justify-between hover:border-zinc-700 shadow-sm ${
                      entry.tierBg
                        ? `${entry.tierBg} border-opacity-60`
                        : 'border-zinc-800/80 hover:bg-zinc-900/30'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges & Acronym */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 rounded bg-zinc-900 text-white font-mono font-black text-sm border border-zinc-700 shadow-sm">
                            {entry.shortForm}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-400 border border-zinc-800 flex items-center gap-1">
                            {getCategoryIcon(entry.category)}
                            <span>{entry.category}</span>
                          </span>
                        </div>

                        {/* Copy Button */}
                        <button
                          onClick={() =>
                            handleCopy(
                              `${entry.shortForm} - ${entry.fullName}\nDefinition: ${entry.definition}${
                                entry.mathematicalFormulation ? `\nFormula: ${entry.mathematicalFormulation}` : ''
                              }`,
                              entry.id
                            )
                          }
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Copy Term Definition"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Full Name */}
                      <h3 className="text-sm font-bold text-white font-display tracking-tight">
                        {entry.fullName}
                      </h3>

                      {/* Definition Text */}
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {entry.definition}
                      </p>

                      {/* Mathematical Formula / Notation if present */}
                      {entry.mathematicalFormulation && (
                        <div className="bg-[#09090b] p-2.5 rounded-lg border border-zinc-800/80 space-y-1 font-mono text-[11px]">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                            Mathematical Formulation
                          </span>
                          <code className="text-cyan-300 block overflow-x-auto no-scrollbar font-bold">
                            {entry.mathematicalFormulation}
                          </code>
                        </div>
                      )}

                      {/* Units & Example */}
                      <div className="space-y-1 pt-1 text-[11px] font-mono border-t border-zinc-800/60">
                        {entry.units && (
                          <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-zinc-400">Units:</span>
                            <span className="text-zinc-200 font-bold">{entry.units}</span>
                          </div>
                        )}
                        {entry.exampleOrContext && (
                          <div className="text-zinc-400 text-[11px] pt-1">
                            <strong className="text-zinc-300">Context:</strong> {entry.exampleOrContext}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Related Terms Pills */}
                    {entry.relatedTerms && entry.relatedTerms.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                        <span className="text-zinc-400">Related:</span>
                        {entry.relatedTerms.map(rt => (
                          <button
                            key={rt}
                            onClick={() => setSearchQuery(rt)}
                            className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-200 border border-zinc-800 hover:border-cyan-700 transition-colors"
                          >
                            {rt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 bg-[#050505] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Standard: Open Group Open FAIR™ (O-RT & O-RA Standards)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
