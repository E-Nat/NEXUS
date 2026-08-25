export interface ProductHotspot {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  position: { x: number; y: number; z: number };
  screenPercent: { x: number; y: number };
  badge: string;
}

export interface ProductMode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
}
