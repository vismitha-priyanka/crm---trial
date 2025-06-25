// types.ts
export type ActivityStat = {
  id: number;
  day: string;
  calls: number;
  emails: number;
  meetings: number;
};

export type DealInsight = {
  id: number;
  stage: string;
  count: number;
  totalValue: string; // or number if you want to parse BigDecimal
};

export type LeadAnalytics = {
  id: number;
  source: string;
  count: number;
  conversionRate: string; // or number if you want to parse BigDecimal
};

export type OverviewMetric = {
  id: number;
  title: string;
  value: string;
};
