export interface ProductDetail {
  id: string;
  order: number; // 1, 2, 3, 4
  label: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string;
  desktopPosition: { x: number; y: number }; // Percentage (0 - 100)
  mobilePosition: { x: number; y: number };
  anchor3D: { x: number; y: number; z: number };
  activeInFrames: number[]; // e.g. [1, 2, 3, 4]
}

export interface ProductRevealFrame {
  id: string;
  frameIndex: number;
  badge: string;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  description: string;
  telemetry: { label: string; value: string }[];
}

export interface Product3DPose {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
  ring1Expansion: number;
  ring2Expansion: number;
  ring3Expansion: number;
  corePulseIntensity: number;
  lightIntensity: number;
  opacity: number;
}
