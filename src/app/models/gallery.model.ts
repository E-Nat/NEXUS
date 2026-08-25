export interface GalleryItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  fullStory: string;
  accentColor: string;
  tags: string[];
  dimensions: string;
  material: string;
  specs: { label: string; value: string }[];
  visualType: 'monolith' | 'microstructure' | 'retina' | 'quantum-flow';
}
