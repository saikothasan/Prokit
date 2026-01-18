'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // For PieChart, data has name, value, count
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-zinc-600 dark:text-zinc-400">
            Value: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {data.value > 1024
               ? `${(data.value / 1024).toFixed(1)} KB`
               : `${data.value.toFixed(0)} bytes`}
            </span>
          </p>
          {data.count !== undefined && (
             <p className="text-zinc-500">Count: {data.count}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface ResourceChartProps {
  data: { name: string; value: number; count: number }[];
  colors: string[];
}

export default function ResourceChart({ data, colors }: ResourceChartProps) {
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
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
