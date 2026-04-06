'use client';

interface ErrorBoxProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  // Split into short summary and raw detail if the message contains a newline
  const [summary, ...rest] = message.split('\n');
  const rawDetail = rest.join('\n').trim();

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        background: '#1a0a0a',
        border: '1px solid #7f1d1d',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: '#ef4444', fontSize: '1.1rem' }}>✕</span>
        <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{summary}</span>
      </div>

      {rawDetail && (
        <details style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
          <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
            Show details
          </summary>
          <pre
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: '#0a0a0f',
              borderRadius: '0.25rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {rawDetail}
          </pre>
        </details>
      )}

      <button
        onClick={onRetry}
        style={{
          alignSelf: 'flex-start',
          padding: '0.4rem 1rem',
          background: 'transparent',
          border: '1px solid #ef4444',
          borderRadius: '0.25rem',
          color: '#ef4444',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  );
}
