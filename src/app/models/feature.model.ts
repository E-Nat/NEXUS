export interface FeatureHighlight {
  label: string;
  value: string;
}

export interface FeatureDetail {
  architecture: string;
  technology: string;
  impact: string;
  bandwidth: string;
}

export interface Feature {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  highlights: string[];
  metrics: FeatureHighlight[];
  visualTheme: 'cyan' | 'violet' | 'emerald';
  accentColor: string;
  glowColor: string;
  details: FeatureDetail;
}
