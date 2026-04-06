'use client';

export const CATEGORIES = [
  { id: 'frontend', label: 'Frontend', colour: '#6366f1' },
  { id: 'backend', label: 'Backend', colour: '#06b6d4' },
  { id: 'cloud', label: 'Cloud', colour: '#f97316' },
  { id: 'architecture', label: 'Architecture', colour: '#a855f7' },
  { id: 'security', label: 'Security', colour: '#ef4444' },
  { id: 'performance', label: 'Performance', colour: '#22c55e' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

interface CategoryTabsProps {
  activeCategory: CategoryId;
  onSelect: (category: CategoryId) => void;
}

export function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              border: `1px solid ${cat.colour}`,
              background: isActive ? cat.colour : 'transparent',
              color: isActive ? '#0a0a0f' : cat.colour,
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '0.04em',
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
