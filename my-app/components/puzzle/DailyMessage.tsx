'use client';

import React from 'react';
import { HiInformationCircle } from 'react-icons/hi';

interface DailyMessageProps {
  message: string;
}

export default function DailyMessage({ message }: DailyMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
      <HiInformationCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-emerald-800">{message}</p>
    </div>
  );
}
