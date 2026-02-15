import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  trend?: string; // Optional: Adds a percentage trend
  trendUp?: boolean; // Optional: Green or Red trend
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconColor, trend = "+2.4%", trendUp = true }) => {
  return (
    <div className="relative group overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-default">
      {/* Decorative Background Blob */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('600', '100').replace('500', '100')} to-transparent rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>

      <div className="relative flex justify-between items-start z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
            {value.toLocaleString()}
          </h3>
          
          {/* Trend Indicator (Visual Only) */}
          <div className="flex items-center mt-2 space-x-2">
            <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-xs text-slate-400 font-medium">vs last week</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('600', '100')} to-white shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform duration-300`}>
          {React.cloneElement(icon as React.ReactElement<any>, { 
            className: `w-6 h-6 ${iconColor}` 
          })}
        </div>
      </div>
      
      {/* Bottom Progress Bar (Visual) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
        <div className={`h-full ${iconColor.replace('text-', 'bg-')} opacity-30 w-2/3 group-hover:w-full transition-all duration-700 ease-in-out`}></div>
      </div>
    </div>
  );
};

export default StatCard;
