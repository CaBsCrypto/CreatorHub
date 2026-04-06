import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = "animate-pulse bg-slate-200/60";
  const variantClasses = {
    rectangular: "rounded-2xl",
    circular: "rounded-full",
    text: "rounded h-4 w-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4">
    <Skeleton className="h-32 w-full rounded-3xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" variant="text" />
      <Skeleton className="h-6 w-3/4" variant="text" />
    </div>
    <div className="pt-4 flex justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" variant="text" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-10" variant="circular" />
    </div>
    <Skeleton className="h-2 w-full" variant="rectangular" />
  </div>
);

export default Skeleton;
