import type { TopicCard, CardDetail } from '@/lib/types';

const DIFFICULTY_COLOUR: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#60a5fa',
  advanced: '#c084fc',
};

const IMPACT_DOT_COLOUR: Record<string, string> = {
  high: '#f97316',
  medium: '#eab308',
  low: '#64748b',
};

interface DetailViewProps {
  card: TopicCard;
  detail: CardDetail;
  categoryColour: string;
  onRegenerate: () => void;
  loading: boolean;
}

export function DetailView({
  card,
  detail,
  categoryColour,
  onRegenerate,
  loading,
}: DetailViewProps) {
  const diffColour = DIFFICULTY_COLOUR[card.difficulty] ?? '#94a3b8';
  const dotColour = IMPACT_DOT_COLOUR[card.impact] ?? '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
        >
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#e2e8f0',
              letterSpacing: '-0.02em',
              borderLeft: `4px solid ${categoryColour}`,
              paddingLeft: '0.75rem',
            }}
          >
            {card.title}
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              paddingLeft: '1rem',
            }}
          >
            <span
              style={{
                color: diffColour,
                border: `1px solid ${diffColour}44`,
                borderRadius: '0.25rem',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {card.difficulty}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <span
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  background: dotColour,
                  display: 'inline-block',
                }}
              />
              {card.impact} impact
            </span>
          </div>
          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              flexWrap: 'wrap',
              paddingLeft: '1rem',
            }}
          >
            {card.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: '#1e293b',
                  color: '#64748b',
                  borderRadius: '0.25rem',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.72rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Regenerate button */}
        <button
          onClick={onRegenerate}
          disabled={loading}
          style={{
            padding: '0.4rem 1rem',
            background: 'transparent',
            border: `1px solid ${categoryColour}`,
            borderRadius: '0.25rem',
            color: categoryColour,
            fontFamily: 'inherit',
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Regenerating…' : '↺ Regenerate'}
        </button>
      </div>

      {/* What it is */}
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <h2
          style={{
            fontSize: '0.75rem',
            color: categoryColour,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          What it is
        </h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.9rem' }}>
          {detail.what}
        </p>
      </section>

      {/* When to use it */}
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <h2
          style={{
            fontSize: '0.75rem',
            color: categoryColour,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          When to use it
        </h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.9rem' }}>
          {detail.when}
        </p>
      </section>

      {/* Code example */}
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <h2
          style={{
            fontSize: '0.75rem',
            color: categoryColour,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Code example
        </h2>
        <div
          // dangerouslySetInnerHTML is safe here: content is Shiki-generated HTML from our own API
          dangerouslySetInnerHTML={{ __html: detail.code }}
          style={{ borderRadius: '0.5rem', overflow: 'hidden' }}
        />
      </section>

      {/* Common mistakes */}
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <h2
          style={{
            fontSize: '0.75rem',
            color: categoryColour,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Common mistakes
        </h2>
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            paddingLeft: '0',
          }}
        >
          {detail.mistakes.map((mistake, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: '0.75rem',
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                listStyle: 'none',
              }}
            >
              <span style={{ color: '#ef4444', flexShrink: 0 }}>✕</span>
              {mistake}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
