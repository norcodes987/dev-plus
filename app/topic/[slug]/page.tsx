import { Suspense } from 'react';
import Link from 'next/link';
import { SkeletonCard } from '@/app/components/SkeletonCard';
import { TopicDetailContent } from '@/app/components/TopicDetailContent';

function LoadingFallback() {
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

export default function TopicPage() {
  return (
    <div
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
      }}
    >
      {/* Back link */}
      <Link
        href='/'
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#475569',
          fontSize: '0.82rem',
          textDecoration: 'none',
          marginBottom: '2rem',
        }}
      >
        ← Back to topics
      </Link>

      <Suspense fallback={<LoadingFallback />}>
        <TopicDetailContent />
      </Suspense>
    </div>
  );
}
