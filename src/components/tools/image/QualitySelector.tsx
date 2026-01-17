'use client';

import React, { useState } from 'react';

interface QualitySelectorProps {
  defaultValue: number;
  onChange: (value: number) => void;
}

export function QualitySelector({ defaultValue, onChange }: QualitySelectorProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setValue(newVal);
    onChange(newVal);
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quality</label>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{value}%</span>
       </div>
       <input
         type="range" min="10" max="100" value={value}
         onChange={handleChange}
         className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
       />
    </div>
  );
}
