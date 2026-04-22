
export const CardSkeleton = () => (
    <div className="h-32 w-full animate-pulse rounded-xl border border-blue-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue/20 to-transparent skeleton-shimmer"></div>
    </div>
);
