'use client';

import React from 'react';
import type { Clue } from '@/types';

interface CluesTableProps {
  acrossClues: Clue[];
  downClues: Clue[];
}

export default function CluesTable({ acrossClues, downClues }: CluesTableProps) {
  const hasClues = acrossClues.length > 0 || downClues.length > 0;

  if (!hasClues) {
    return (
      <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-sm text-amber-800">No clues available for this puzzle</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="grid grid-cols-2 gap-0">
        {/* Across Column */}
        {acrossClues.length > 0 && (
          <div className="border-r border-gray-300">
            <div className="bg-emerald-100 border-b border-gray-300 px-4 py-2">
              <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                <span>→</span> Across
              </h3>
            </div>
            <div className="divide-y divide-gray-300 max-h-64 overflow-y-auto">
              {acrossClues.map((clue) => (
                <div key={`across-${clue.number}`} className="px-4 py-2 hover:bg-emerald-50 transition-colors">
                  <div className="flex gap-3">
                    <span className="font-bold text-emerald-700 min-w-[2rem]">{clue.number}.</span>
                    <span className="text-sm text-gray-700">{clue.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Down Column */}
        {downClues.length > 0 && (
          <div>
            <div className="bg-blue-100 border-b border-gray-300 px-4 py-2">
              <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                <span>↓</span> Down
              </h3>
            </div>
            <div className="divide-y divide-gray-300 max-h-64 overflow-y-auto">
              {downClues.map((clue) => (
                <div key={`down-${clue.number}`} className="px-4 py-2 hover:bg-blue-50 transition-colors">
                  <div className="flex gap-3">
                    <span className="font-bold text-blue-700 min-w-[2rem]">{clue.number}.</span>
                    <span className="text-sm text-gray-700">{clue.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single column if only one direction */}
        {acrossClues.length > 0 && downClues.length === 0 && (
          <div className="bg-gray-50"></div>
        )}
        {downClues.length > 0 && acrossClues.length === 0 && (
          <div className="bg-gray-50"></div>
        )}
      </div>
    </div>
  );
}
