import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = "Cargando Umbra Creator Hub..." }: { message?: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        {/* Inner dynamic spinner from lucide */}
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}
