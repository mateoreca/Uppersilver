'use client';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const all = ['Todos', ...categories];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '4px 0',
      }}
      role="group"
      aria-label="Filtrar por categoría"
    >
      {all.map((cat) => {
        const active = selected === cat;
        return (
          <button
            key={cat}
            id={`category-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onSelect(cat)}
            aria-pressed={active}
            style={{
              padding: '8px 18px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 150ms ease',
              background: active
                ? 'linear-gradient(135deg, #D4AF7A 0%, #E8C99A 50%, #C0932A 100%)'
                : 'rgba(255,255,255,0.05)',
              color: active ? '#1a1000' : 'var(--text-secondary)',
              boxShadow: active ? '0 4px 14px rgba(212,175,122,0.3)' : 'none',
              transform: active ? 'scale(1.02)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
