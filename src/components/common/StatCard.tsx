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
    <div className="relative group overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-100 transition-all duration-500 cursor-default">
      {/* Decorative Background Blob */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('600', '100').replace('500', '100')} to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-110`}></div>

      <div className="relative flex justify-between items-start z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">{title}</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-105 transition-transform origin-left duration-300 font-display">
            {value.toLocaleString()}
          </h3>
          
          {/* Trend Indicator (Visual Only) */}
          <div className="flex items-center mt-3 space-x-2">
            <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-xs text-slate-400 font-medium">vs last week</span>
          </div>
        </div>
        
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('600', '50')} to-white shadow-lg shadow-slate-100 border border-slate-100 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 ring-1 ring-white`}>
          {React.cloneElement(icon as React.ReactElement<any>, { 
            className: `w-7 h-7 ${iconColor} drop-shadow-sm` 
          })}
        </div>
      </div>
      
      {/* Bottom Progress Bar (Visual) */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50">
        <div className={`h-full bg-gradient-to-r ${iconColor.replace('text-', 'from-')} to-white opacity-40 w-2/3 group-hover:w-full transition-all duration-700 ease-out`}></div>
      </div>
    </div>
  );
};

export default StatCard;
