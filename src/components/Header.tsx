import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES, type CategoryId } from '../data/catalog';

interface HeaderProps {
  activeCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  specCount: number;
  onOpenSpec: () => void;
}

export function Header({
  activeCategory,
  onSelectCategory,
  specCount,
  onOpenSpec,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (cat: CategoryId) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          УЭЦН Каталог
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Разделы каталога"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleNavClick(cat.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-[#1D5FA7] border-[#1D5FA7]'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {cat.shortLabel}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSpec}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1D5FA7] hover:bg-[#174E8A] rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            {specCount > 0 ? `Спецификация (${specCount})` : 'Запрос КП'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="lg:hidden p-2.5 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleNavClick(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1D5FA7]/10 text-[#1D5FA7]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
