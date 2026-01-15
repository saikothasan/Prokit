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
  PieChart,
  Pie,
} from 'recharts';

export interface PerfChartItem {
  name: string;
  value: number;
  fill: string;
  full: string;
}

export interface ResourceChartItem {
  name: string;
  value: number;
  count: number;
}

export const RESOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

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
              {typeof data.value === 'number' && data.value > 1000
               ? `${(data.value / 1024).toFixed(1)} KB`
               : `${data.value.toFixed(0)} ${data.full ? 'ms' : 'bytes'}`}
            </span>
          </p>
          {data.count && (
             <p className="text-zinc-500">Count: {data.count}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ data }: { data: PerfChartItem[] }) {
  return (
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
  );
}

export function ResourceChart({ data }: { data: ResourceChartItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={RESOURCE_COLORS[index % RESOURCE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
