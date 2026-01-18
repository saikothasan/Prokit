'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{data.full || label}</p>
        <div className="space-y-1">
          <p className="text-zinc-600 dark:text-zinc-400">
            Value: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {data.value.toFixed(0)} ms
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface PerformanceChartProps {
  data: { name: string; value: number; fill: string; full: string }[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} opacity={0.2} />
          <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
