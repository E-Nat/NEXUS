export interface SpecMetric {
  value: string;
  numericValue: number;
  unit: string;
  label: string;
  description: string;
  detail: string;
  category: 'performance' | 'hardware' | 'ai' | 'connectivity';
  icon: string;
}

export interface SpecCategory {
  id: string;
  name: string;
  description: string;
  metrics: SpecMetric[];
}

export interface TechnicalBlueprint {
  title: string;
  code: string;
  specifications: { label: string; value: string }[];
}
