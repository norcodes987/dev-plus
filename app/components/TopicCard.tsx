'use client';

import { useState } from 'react';
import type { TopicCard as TopicCardType } from '@/lib/types';

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  beginner: { bg: '#14532d22', color: '#22c55e' },
  intermediate: { bg: '#1e3a5f22', color: '#60a5fa' },
  advanced: { bg: '#3b076422', color: '#c084fc' },
};

const IMPACT_DOT_COLOUR: Record<string, string> = {
  high: '#f97316',
  medium: '#eab308',
  low: '#64748b',
};

interface TopicCardProps {
  card: TopicCardType;
  categoryColour: string;
  onClick: () => void;
}

export function TopicCard({ card, categoryColour, onClick }: TopicCardProps) {
  const [hovered, setHovered] = useState(false);

  const difficultyStyle = DIFFICULTY_STYLES[card.difficulty] ?? {
    bg: '#1e293b',
    color: '#94a3b8',
  };
  const dotColour = IMPACT_DOT_COLOUR[card.impact] ?? '#64748b';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0f1117',
        border: '1px solid #1e293b',
        borderTop: `3px solid ${categoryColour}`,
        borderRadius: '0.5rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 24px ${categoryColour}33` : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        width: '100%',
      }}
    >
      {/* Title */}
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#e2e8f0',
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </span>

      {/* Summary */}
      <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
        {card.summary}
      </span>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {/* Difficulty badge */}
        <span
          style={{
            background: difficultyStyle.bg,
            color: difficultyStyle.color,
            border: `1px solid ${difficultyStyle.color}44`,
            borderRadius: '0.25rem',
            padding: '0.15rem 0.5rem',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
        >
          {card.difficulty}
        </span>

        {/* Impact dot + label */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.72rem',
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
          {card.impact}
        </span>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {card.tags.map((tag) => (
          <span
            key={tag}
            style={{
              background: '#1e293b',
              color: '#64748b',
              borderRadius: '0.25rem',
              padding: '0.1rem 0.4rem',
              fontSize: '0.7rem',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
