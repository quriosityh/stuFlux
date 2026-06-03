import { useState } from 'react';
import { ActivityBooking } from './types';

interface EarningsSummaryProps {
  bookings: ActivityBooking[];
}

interface ChartDataPoint {
  label: string;
  amount: number;
  count: number;
  monthIndex: number;
  year: number;
}

function EarningsChart({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.amount), 1000);
  const chartHeight = 140;
  const chartWidth = 600;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 15;
  const paddingBottom = 25;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i * (chartWidth - paddingLeft - paddingRight)) / (data.length - 1);
    const y = paddingTop + chartHeight - (d.amount / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const formatCurrencySimple = (amount: number) => {
    if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(0)}k`;
    return `Rs ${amount}`;
  };

  return (
    <div className="relative bg-surface/20 backdrop-blur-[16px] border border-border/40 rounded-xl p-5 w-full md:col-span-3 flex flex-col gap-5 overflow-visible">
      <div className="space-y-1">
        <h4 className="text-[14px] font-bold text-foreground/80 font-display">Earnings Performance</h4>
        <p className="text-[12px] text-foreground/45 leading-normal">
          Monthly overview of confirmed and completed bookings. Hover over data nodes to see the breakdowns.
        </p>
      </div>

      <div className="relative w-full select-none overflow-visible pt-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + paddingTop + paddingBottom}`} className="w-full h-auto overflow-visible">
          {/* Y Axis Gridlines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const val = maxVal * ratio;
            const y = paddingTop + chartHeight - ratio * chartHeight;
            return (
              <g key={idx} className="opacity-25">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                  className="text-foreground/30"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-foreground/60 font-semibold"
                >
                  {formatCurrencySimple(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#chartAreaGrad)"
            />
          )}

          {/* Line Stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#chartLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-hover)" />
            </linearGradient>
          </defs>

          {/* X Axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={paddingTop + chartHeight + 16}
              textAnchor="middle"
              className="text-[10px] fill-foreground/50 font-bold"
            >
              {p.label}
            </text>
          ))}

          {/* Circle Markers */}
          {points.map((p, idx) => (
            <g key={idx}>
              {hoveredIndex === idx && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  className="fill-emerald-500/25 stroke-none animate-ping"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? "5" : "3.5"}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="fill-background stroke-[2px] cursor-pointer transition-all duration-150"
                style={{ stroke: 'var(--accent)' }}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 p-2.5 rounded-lg border border-border/80 bg-surface/95 shadow-xl text-[11px] space-y-0.5 pointer-events-none transition-all duration-150 animate-step-check-anim backdrop-blur-md"
            style={{
              left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIndex].y / (chartHeight + paddingTop + paddingBottom)) * 100 - 25}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-bold text-foreground leading-none mb-0.5">{points[hoveredIndex].label}</p>
            <p className="text-emerald-500 font-bold">
              {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(points[hoveredIndex].amount)}
            </p>
            <p className="text-foreground/45 text-[9px] whitespace-nowrap">{points[hoveredIndex].count} rental{points[hoveredIndex].count === 1 ? '' : 's'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EarningsSummary({ bookings }: EarningsSummaryProps) {
  const confirmedOrCompleted = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  
  const totalEarned = confirmedOrCompleted.reduce((acc, b) => acc + b.total_amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthEarned = confirmedOrCompleted.filter(b => {
    const d = new Date(b.created_at || b.start_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, b) => acc + b.total_amount, 0);

  const uniqueItems = new Set(confirmedOrCompleted.map(b => b.listing_id)).size;

  // Compute dynamic chart data point details
  const last4Months: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last4Months.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleString('default', { month: 'short' }),
      amount: 0,
      count: 0,
    });
  }

  confirmedOrCompleted.forEach(b => {
    const date = new Date(b.created_at || b.start_date);
    const m = date.getMonth();
    const y = date.getFullYear();
    const monthObj = last4Months.find(x => x.monthIndex === m && x.year === y);
    if (monthObj) {
      monthObj.amount += b.total_amount;
      monthObj.count += 1;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-5 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Lifetime Earned */}
        <div className="relative flex flex-col bg-foreground/5 rounded-[12px] px-[18px] py-[16px] border border-border/30">
          <span className="text-[11px] uppercase text-foreground/45 font-bold mb-1 tracking-[0.08em]">Lifetime Earned</span>
          <span className="text-[28px] font-bold text-emerald-500 leading-tight">
            {formatCurrency(totalEarned)}
          </span>
        </div>

        {/* This Month */}
        <div className="flex flex-col bg-foreground/5 rounded-[12px] px-[18px] py-[16px] border border-border/30">
          <span className="text-[11px] uppercase text-foreground/45 font-bold mb-1 tracking-[0.08em]">This Month</span>
          <span className="text-[28px] font-bold text-emerald-500 leading-tight">
            {formatCurrency(thisMonthEarned)}
          </span>
        </div>

        {/* Items Lent Out */}
        <div className="flex flex-col bg-foreground/5 rounded-[12px] px-[18px] py-[16px] border border-border/30">
          <span className="text-[11px] uppercase text-foreground/45 font-bold mb-1 tracking-[0.08em]">Items Lent Out</span>
          <span className="text-[28px] font-bold text-foreground leading-tight">
            {uniqueItems}
          </span>
        </div>
      </div>

      {/* Dynamic Interactive SVG Chart (Stacked Card Layout) */}
      <EarningsChart data={last4Months} />
    </div>
  );
}
