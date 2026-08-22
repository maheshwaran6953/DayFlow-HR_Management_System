/**
 * Dashboard Stat Summary Cards Component
 */
import React from 'react';

export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  description?: string;
}

export function StatCard({ metric }: { metric: DashboardMetric }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">{metric.title}</h3>
      </div>
      <div className="text-2xl font-bold">{metric.value}</div>
      {metric.change && (
        <p className="text-xs text-muted-foreground mt-1">
          <span className={metric.changeType === 'positive' ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>
            {metric.change}
          </span>{' '}
          vs last month
        </p>
      )}
    </div>
  );
}
