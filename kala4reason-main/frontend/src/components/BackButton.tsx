'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

interface BackButtonProps {
  to?: string;
  label?: string;
}

export default function BackButton({ to, label = 'Back to Explore' }: BackButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isMounted.current) return;
    
    try {
      if (to) {
        router.push(to);
      } else {
        // Use window.history to go back if possible, otherwise go to home
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      // Fallback to home if any error occurs
      router.push('/');
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
      aria-label={label}
    >
      <FaArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
