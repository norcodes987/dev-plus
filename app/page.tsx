'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CategoryTabs,
  CATEGORIES,
  type CategoryId,
} from './components/CategoryTabs';
import { TopicCard } from './components/TopicCard';
import { SkeletonCard } from './components/SkeletonCard';
import { ErrorBox } from './components/ErrorBox';
import type { TopicCard as TopicCardType } from '@/lib/types';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function Home() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('frontend');
  const [topicsCache, setTopicsCache] = useState<
    Record<string, TopicCardType[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCategoryColour =
    CATEGORIES.find((c) => c.id === activeCategory)?.colour ?? '#6366f1';

  const fetchTopics = useCallback(async (category: CategoryId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'API error');
      setTopicsCache((prev) => ({ ...prev, [category]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial category on mount
  useEffect(() => {
    fetchTopics('frontend');
  }, [fetchTopics]);

  const handleCategorySelect = (category: CategoryId) => {
    setActiveCategory(category);
    if (!topicsCache[category]) {
      fetchTopics(category);
    }
  };

  const handleRefresh = () => {
    // Remove cache entry so fetchTopics re-fetches
    setTopicsCache((prev) => {
      const next = { ...prev };
      delete next[activeCategory];
      return next;
    });
    fetchTopics(activeCategory);
  };

  const handleCardClick = (card: TopicCardType) => {
    const slug = slugify(card.title);
    const params = new URLSearchParams({
      title: card.title,
      category: card.category,
      difficulty: card.difficulty,
      impact: card.impact,
      tags: card.tags.join(','),
    });
    router.push(`/topic/${slug}?${params.toString()}`);
  };

  const cards = topicsCache[activeCategory] ?? [];

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#e2e8f0',
            letterSpacing: '-0.02em',
            marginBottom: '0.4rem',
          }}
        >
          DevPulse
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          AI-generated developer best practices — refreshed on demand
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
        }}
      >
        <CategoryTabs
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />

        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: '0.4rem 1rem',
            background: 'transparent',
            border: `1px solid ${activeCategoryColour}`,
            borderRadius: '0.25rem',
            color: activeCategoryColour,
            fontFamily: 'inherit',
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Generating…' : '↺ New topics'}
        </button>
      </div>

      {/* Card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <ErrorBox
            message={error}
            onRetry={() => fetchTopics(activeCategory)}
          />
        ) : (
          cards.map((card) => (
            <TopicCard
              key={card.id}
              card={card}
              categoryColour={activeCategoryColour}
              onClick={() => handleCardClick(card)}
            />
          ))
        )}
      </div>
    </div>
  );
}
