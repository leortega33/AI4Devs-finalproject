import { Box, Skeleton } from '@mui/material';

type SkeletonVariant = 'list' | 'table' | 'cards';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
}

/** Placeholder shown while data-fetching pages load (US-012). */
export function LoadingSkeleton({ variant = 'list', count = 5 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'cards') {
    return (
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {items.map((_, i) => (
          <Skeleton key={i} data-testid="skeleton-item" variant="rounded" height={120} />
        ))}
      </Box>
    );
  }

  const height = variant === 'table' ? 44 : 60;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((_, i) => (
        <Skeleton key={i} data-testid="skeleton-item" variant="rounded" height={height} />
      ))}
    </Box>
  );
}
