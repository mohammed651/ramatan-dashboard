import React from "react";

export default function KPI({
  title,
  value,
  subtitle,
  delta,
  icon,
  sparkline,
  loading = false,
  format = "number",
  className = "",
}) {
  const formatValue = (v) => {
    if (v == null || v === "") return "-";
    
    if (format === "currency") {
      return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0
      }).format(v);
    }
    
    if (typeof v === "number") {
      return new Intl.NumberFormat('en').format(v);
    }
    
    return v;
  };

  const deltaColor = (d) =>
    d == null ? "text-neutral-400" : d > 0 ? "text-success" : "text-danger";

  const deltaIcon = (d) => {
    if (d == null) return null;
    return d > 0 ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  };

  return (
    <div
      className={
        `bg-white rounded-2xl p-6 shadow-card border border-neutral-200 transition-all duration-200 hover:shadow-lg ${className}`
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-600 truncate">
              {title}
            </div>
            
            {delta != null && (
              <div className={`flex items-center gap-1 text-sm font-medium ${deltaColor(delta)}`}>
                {deltaIcon(delta)}
                <span>{delta > 0 ? `+${delta}%` : `${delta}%`}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-neutral-900 mb-1">
                {loading ? (
                  <div className="h-8 bg-neutral-200 rounded animate-pulse w-20"></div>
                ) : (
                  formatValue(value)
                )}
              </div>
              
              {subtitle && (
                <div className="text-xs text-neutral-500 truncate">
                  {subtitle}
                </div>
              )}
            </div>
            
            {sparkline && sparkline.length > 1 && (
              <div className="ml-4 flex-shrink-0">
                <Sparkline data={sparkline} />
              </div>
            )}
          </div>
        </div>
        
        {icon && (
          <div className="ml-4 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
              <div className="text-primary-600">
                {icon}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkline({ data = [], stroke = "currentColor", width = 80, height = 32 }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = data[data.length - 1] >= data[0];
  const colorClass = isPositive ? "text-success" : "text-danger";

  return (
    <div className={`${colorClass}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}