'use client';

import React from 'react';
import { DropdownButton } from '@/components/ui';
import {
  HiCheckCircle,
  HiLightBulb,
  HiClipboardCopy,
  HiExclamationCircle,
  HiQuestionMarkCircle,
} from 'react-icons/hi';

interface PuzzleActionsProps {
  onCheck: () => void;
  onHint: () => void;
  onCopyYesterday: () => void;
  onReport: () => void;
  onHowToPlay: () => void;
  isChecking?: boolean;
  hintUsed?: boolean;
}

export default function PuzzleActions({
  onCheck,
  onHint,
  onCopyYesterday,
  onReport,
  onHowToPlay,
  isChecking = false,
  hintUsed = false,
}: PuzzleActionsProps) {
  const items = [
    {
      label: 'Check Grid',
      icon: <HiCheckCircle className="w-5 h-5 text-emerald-500" />,
      onClick: onCheck,
    },
    {
      label: hintUsed ? 'Hint Used' : 'Get Hint',
      icon: <HiLightBulb className="w-5 h-5 text-amber-500" />,
      onClick: onHint,
    },
    {
      label: "Copy Yesterday's Result",
      icon: <HiClipboardCopy className="w-5 h-5 text-blue-500" />,
      onClick: onCopyYesterday,
    },
    {
      label: 'How to Play',
      icon: <HiQuestionMarkCircle className="w-5 h-5 text-blue-500" />,
      onClick: onHowToPlay,
    },
    {
      label: 'Report Problem',
      icon: <HiExclamationCircle className="w-5 h-5 text-red-500" />,
      onClick: onReport,
      danger: true,
    },
  ];

  return (
    <DropdownButton
      label={isChecking ? 'Checking...' : 'Actions'}
      items={items}
      align="right"
    />
  );
}
