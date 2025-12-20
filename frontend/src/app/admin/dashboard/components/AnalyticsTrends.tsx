import React from "react";

interface ResourceSummaryItem {
  label: string;
  value: number;
  unit: string;
  used: number;
  color: string;
}

interface TrendHighlight {
  title: string;
  value: string;
  tone: string;
  note: string;
}

interface AnalyticsTrendsProps {
  resourceSummary: ResourceSummaryItem[];
  trendHighlights: TrendHighlight[];
  bgCard?: string;
  borderColor?: string;
  headingFont?: string;
  textSecondary?: string;
}

export const AnalyticsTrends: React.FC<AnalyticsTrendsProps> = ({
  resourceSummary,
  trendHighlights,
  bgCard = "bg-card",
  borderColor = "border-default",
  headingFont = "font-heading",
  textSecondary = "text-secondary",
}) => {
  return (
    <>
      <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className={`text-2xl font-semibold text-accent ${headingFont}`}>Resource Utilization</h3>
          <p className={`${textSecondary} text-sm`}>
            How core resources are being consumed this week
          </p>
        </div>
        <div className="grid gap-4">
          {resourceSummary.map((item) => (
            <div key={item.label} className={`bg-card/5 border ${borderColor} rounded-md p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-semibold">{item.label}</span>
                <span className="text-accent font-bold">{item.used}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className={`${item.color} h-3`} style={{ width: `${item.used}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${bgCard} lg:col-span-2 p-6 rounded-lg shadow-md border ${borderColor}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h3 className={`text-2xl font-semibold text-accent ${headingFont}`}>Trend Analytics</h3>
            <p className={`${textSecondary} text-sm`}>Recent movement across key KPIs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trendHighlights.map((trend) => (
              <div key={trend.title} className={`bg-card/5 border ${borderColor} rounded-md p-4`}>
                <p className="text-secondary text-sm uppercase tracking-wide">{trend.title}</p>
                <p className={`text-3xl font-bold mt-2 ${trend.tone}`}>{trend.value}</p>
                <p className="text-muted text-sm mt-1">{trend.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${bgCard} p-6 rounded-lg shadow-md border ${borderColor}`}>
          <h4 className={`text-xl font-semibold text-accent mb-4 ${headingFont}`}>Alerts & Insights</h4>
          <ul className={`space-y-3 ${textSecondary} text-sm`}>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
              Stock for rice drops below buffer in 2 regions.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
              Volunteer engagement up 12% after outreach campaign.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
              Donation processing time trending higher on Fridays.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
