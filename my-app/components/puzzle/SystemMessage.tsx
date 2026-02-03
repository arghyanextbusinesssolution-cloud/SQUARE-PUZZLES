'use client';

import React from 'react';
import { HiCheckCircle, HiXCircle, HiExclamation } from 'react-icons/hi';

interface SystemMessageProps {
  message: string | null;
  status?: 'correct' | 'incorrect' | 'incomplete' | 'info' | null;
}

export default function SystemMessage({ message, status }: SystemMessageProps) {
  if (!message) return null;

  const getStyles = () => {
    switch (status) {
      case 'correct':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: <HiCheckCircle className="w-5 h-5 text-green-600" />,
        };
      case 'incorrect':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: <HiXCircle className="w-5 h-5 text-red-600" />,
        };
      case 'incomplete':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: <HiExclamation className="w-5 h-5 text-amber-600" />,
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: <HiExclamation className="w-5 h-5 text-blue-600" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.bg} border rounded-xl p-4 flex items-start gap-3 animate-fade-in`}>
      <span className="flex-shrink-0 mt-0.5">{styles.icon}</span>
      <p className={`text-sm ${styles.text}`}>{message}</p>
    </div>
  );
}
