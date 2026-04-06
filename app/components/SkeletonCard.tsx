export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#0f1117',
        border: '1px solid #1e293b',
        borderTop: '3px solid #1e293b',
        borderRadius: '0.5rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* title bar */}
      <div
        className='shimmer'
        style={{ height: '1rem', borderRadius: '0.25rem', width: '70%' }}
      />
      {/* summary bar */}
      <div
        className='shimmer'
        style={{ height: '0.75rem', borderRadius: '0.25rem', width: '90%' }}
      />
      <div
        className='shimmer'
        style={{ height: '0.75rem', borderRadius: '0.25rem', width: '60%' }}
      />
      {/* badge row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <div
          className='shimmer'
          style={{ height: '1.25rem', width: '5rem', borderRadius: '0.25rem' }}
        />
        <div
          className='shimmer'
          style={{ height: '1.25rem', width: '4rem', borderRadius: '0.25rem' }}
        />
      </div>
      {/* tags row */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[4, 3, 5].map((w, i) => (
          <div
            key={i}
            className='shimmer'
            style={{
              height: '1rem',
              width: `${w}rem`,
              borderRadius: '0.25rem',
            }}
          />
        ))}
      </div>
    </div>
  );
}
