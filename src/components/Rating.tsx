import React from 'react';

export function Rating({ rating, total }: { rating: number, total: number }) {
  return (
    <div className="flex items-center" aria-label={`Vurdering: ${rating} av 5 stjerner med ${total} vurderinger`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFullStar = index < Math.floor(rating);
        const isHalfStar = !isFullStar && index < rating;
        return (
          <div key={index} className="relative">
            <svg
              className="h-5 w-5 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="left-half">
                  <rect x="0" y="0" width="10" height="20" />
                </clipPath>
                <clipPath id="right-half">
                  <rect x="10" y="0" width="10" height="20" />
                </clipPath>
              </defs>
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"
                clipPath="url(#left-half)"
                className={isFullStar || isHalfStar ? 'text-yellow-400' : 'text-gray-300'}
              />
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"
                clipPath="url(#right-half)"
                className={isFullStar ? 'text-yellow-400' : 'text-gray-300'}
              />
            </svg>
          </div>
        );
      })}
      <span className="ml-2 text-sm text-gray-500">{rating.toFixed(1)} ({total} vurderinger)</span>
    </div>
  );
}