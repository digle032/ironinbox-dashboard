import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  trend = '+2.4%',
  trendUp = true,
}) => {
  const borderAccent =
    iconColor.includes('red')     ? 'dark:border-l-red-500/60'     :
    iconColor.includes('orange')  ? 'dark:border-l-orange-500/60'  :
    iconColor.includes('yellow')  ? 'dark:border-l-amber-500/60'   :
    iconColor.includes('emerald') ? 'dark:border-l-emerald-500/60' :
    iconColor.includes('purple')  ? 'dark:border-l-purple-500/60'  :
    'dark:border-l-cyan-500/60';

  const iconBg =
    iconColor.includes('red')     ? 'dark:bg-red-950/50 dark:text-red-400'     :
    iconColor.includes('orange')  ? 'dark:bg-orange-950/50 dark:text-orange-400':
    iconColor.includes('yellow')  ? 'dark:bg-amber-950/50 dark:text-amber-400' :
    iconColor.includes('emerald') ? 'dark:bg-emerald-950/50 dark:text-emerald-400':
    iconColor.includes('purple')  ? 'dark:bg-purple-950/50 dark:text-purple-400':
    'dark:bg-cyan-950/50 dark:text-cyan-400';

  return (
    <div className={`relative group overflow-hidden rounded-xl border-l-4 transition-all duration-300 cursor-default
                     bg-white border border-slate-200 border-l-blue-500 shadow-sm hover:shadow-md hover:-translate-y-0.5
                     dark:bg-[#0a1628] dark:border-[#0f2a4a] ${borderAccent} dark:hover:border-[#1a3554]`}>

      {/* Light mode subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 dark:hidden" />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2
                          dark:text-[#2a4a6a] dark:font-mono">
              {title}
            </p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none
                           dark:text-[#e2e8f0] dark:font-mono dark:tabular-nums">
              {value.toLocaleString()}
            </h3>

            {/* Trend */}
            <div className="flex items-center mt-3 space-x-2">
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded
                               ${trendUp
                                 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                 : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#2a4a6a]">vs last week</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg ml-3 flex-shrink-0 ${iconColor.includes('red') ? 'bg-red-50 text-red-500' : iconColor.includes('orange') ? 'bg-orange-50 text-orange-500' : iconColor.includes('yellow') ? 'bg-amber-50 text-amber-500' : iconColor.includes('emerald') ? 'bg-emerald-50 text-emerald-500' : iconColor.includes('purple') ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'} ${iconBg}`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
              className: 'w-5 h-5',
            })}
          </div>
        </div>

        {/* Bottom accent bar (light mode) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 dark:hidden
                        bg-gradient-to-r from-blue-400/30 via-blue-300/20 to-transparent" />
      </div>
    </div>
  );
};

export default StatCard;
