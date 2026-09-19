// MetricCard.tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changePeriod?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  variant?: 'emerald' | 'cyan' | 'blue' | 'amber' | 'purple' | 'red';
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
}

const colorVariants = {
  emerald: {
    border: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    glow: 'from-emerald-500/10 to-transparent',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  cyan: {
    border: 'hover:border-cyan-500/50',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    glow: 'from-cyan-500/10 to-transparent',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  },
  blue: {
    border: 'hover:border-blue-500/50',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    glow: 'from-blue-500/10 to-transparent',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  amber: {
    border: 'hover:border-amber-500/50',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    glow: 'from-amber-500/10 to-transparent',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  purple: {
    border: 'hover:border-purple-500/50',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    glow: 'from-purple-500/10 to-transparent',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  red: {
    border: 'hover:border-rose-500/50',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    glow: 'from-rose-500/10 to-transparent',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changePeriod = 'vs last month',
  trend,
  icon: Icon,
  variant = 'emerald',
  subtitle,
  badge,
  onClick
}) => {
  const styles = colorVariants[variant];
  const isPositive = (change ?? 0) > 0;
  const isNeutral = (change ?? 0) === 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-[#081512]/90 border border-emerald-950/60 p-5 backdrop-blur-xl transition-all duration-300 group',
        styles.border,
        onClick && 'cursor-pointer hover:scale-[1.01]'
      )}
    >
      <div className={cn('absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br blur-2xl opacity-30 pointer-events-none group-hover:opacity-60 transition-opacity', styles.glow)} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70">{title}</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs font-medium text-emerald-400/60">{unit}</span>}
          </div>
        </div>

        <div className={cn('p-3 rounded-xl border', styles.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-emerald-950/40">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md text-[11px]',
                trend === 'down' || (!trend && !isPositive && !isNeutral)
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : trend === 'up' || (!trend && isPositive)
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-gray-400 bg-gray-500/10'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : !isNeutral ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
            <span className="text-emerald-400/50 text-[11px]">{changePeriod}</span>
          </div>
        ) : subtitle ? (
          <span className="text-xs text-emerald-400/60">{subtitle}</span>
        ) : <div />}

        {badge && (
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', styles.badge)}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
