'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES } from './CategoryTabs';
import { DetailView } from './DetailView';
import { SkeletonCard } from './SkeletonCard';
import { ErrorBox } from './ErrorBox';
import type { TopicCard, CardDetail } from '@/lib/types';

export function TopicDetailContent() {
  const searchParams = useSearchParams();

  const title = searchParams.get('title') ?? '';
  const category = searchParams.get('category') ?? 'frontend';
  const difficulty = (searchParams.get('difficulty') ??
    'intermediate') as TopicCard['difficulty'];
  const impact = (searchParams.get('impact') ??
    'medium') as TopicCard['impact'];
  // Stabilise tags so useCallback doesn't get a new array reference each render
  const tagsParam = searchParams.get('tags') ?? '';
  const tags = useMemo(
    () => tagsParam.split(',').filter(Boolean),
    [tagsParam],
  );

  const categoryColour =
    CATEGORIES.find((c) => c.id === category)?.colour ?? '#6366f1';

  const card: TopicCard = {
    id: '',
    title,
    summary: '',
    difficulty,
    impact,
    tags,
    category,
  };

  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!title) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/card-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, difficulty, tags }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'API error');
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [title, category, difficulty, tags]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading && !detail) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'grid', marginTop: '2rem' }}>
        <ErrorBox message={error} onRetry={fetchDetail} />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <DetailView
      card={card}
      detail={detail}
      categoryColour={categoryColour}
      onRegenerate={fetchDetail}
      loading={loading}
    />
  );
}
