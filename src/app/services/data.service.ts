import { Injectable } from '@angular/core';
import { Feature } from '../models/feature.model';
import { SpecCategory, SpecMetric } from '../models/spec.model';
import { GalleryItem } from '../models/gallery.model';
import { ProductHotspot, ProductMode } from '../models/product.model';
import { ProductDetail, ProductRevealFrame } from '../models/product-reveal.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  readonly features: Feature[] = [
    {
      id: 'immersive',
      number: '01',
      title: 'IMMERSIVE',
      subtitle: 'SPATIAL RETINAL FIELD',
      tagline: 'Perception redefined at quantum resolution.',
      description: 'Holographic retinal field projection coupled with spatial neural audio adapts dynamically to your optical cortex, creating infinite depth without physical bounds.',
      highlights: [
        'Bionic Photonic Projection Array',
        'Real-time Optical Wavefront Correction',
        'Spatial Neural Resonance Audio'
      ],
      metrics: [
        { label: 'FOV Density', value: '180° Ultra-Wide' },
        { label: 'Spatial Latency', value: '< 0.18ms' }
      ],
      visualTheme: 'cyan',
      accentColor: '#00f0ff',
      glowColor: 'rgba(0, 240, 255, 0.4)',
      details: {
        architecture: 'Monolithic Quantum Crystal Waveguide Matrix',
        technology: 'Direct-to-retina coherent photon modulation with 8K sub-micron pixel array',
        impact: 'Transforms digital interfaces into tangible physical presence in ambient space',
        bandwidth: '4.8 Tbps coherent optical bus'
      }
    },
    {
      id: 'intelligent',
      number: '02',
      title: 'INTELLIGENT',
      subtitle: 'SELF-EVOLVING COGNITION',
      tagline: 'Zero-cloud latency. Total local intelligence.',
      description: 'An on-device localized quantum neural engine that anticipates intent, learns environmental context, and evolves personalized spatial interaction paradigms in real time.',
      highlights: [
        '1.4 PFLOPS Neuromorphic Tensor Engine',
        'Autonomous Context Prediction Matrix',
        'Zero-Cloud Private Vault Architecture'
      ],
      metrics: [
        { label: 'Tensor Ops', value: '1.4 PFLOPS' },
        { label: 'Inference Speed', value: '0.02ms' }
      ],
      visualTheme: 'violet',
      accentColor: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.4)',
      details: {
        architecture: 'Sub-nanometer 3D Stacked Quantum Synapse Core',
        technology: 'Deep continuous learning running fully air-gapped on hardware-isolated neural clusters',
        impact: 'Anticipates gestures, glances, and cognitive cues before physical completion',
        bandwidth: '128-Lane Quantum Interconnect'
      }
    },
    {
      id: 'connected',
      number: '03',
      title: 'CONNECTED',
      subtitle: 'HYPER-MESH FABRIC',
      tagline: 'Instantaneous synchronization across all dimensions.',
      description: 'Eliminate friction between devices with quantum entropic mesh protocols. Instantaneous cross-device state persistence with zero configuration.',
      highlights: [
        'Zero-Latency Terahertz Mesh Protocol',
        'Sub-Atomic Clock Synchronization',
        'Universal Neural Device Handshake'
      ],
      metrics: [
        { label: 'Mesh Throughput', value: '400 Gbps' },
        { label: 'Sync Drift', value: '< 1 Picosecond' }
      ],
      visualTheme: 'emerald',
      accentColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      details: {
        architecture: 'Entropic Multi-Node Hyper-Mesh Transceiver Array',
        technology: 'Terahertz beamforming paired with zero-overhead peer-to-peer state streaming',
        impact: 'Merges displays, computational nodes, and environmental sensors into a single sensory fabric',
        bandwidth: '80 GHz carrier spectrum'
      }
    }
  ];

  readonly keyMetrics: SpecMetric[] = [
    {
      value: '98%',
      numericValue: 98,
      unit: '%',
      label: 'PERFORMANCE',
      description: 'Quantum efficiency scaling vs conventional silicon architectures.',
      detail: 'Dynamic multi-core quantum modulation delivers unprecedented processing density while reducing thermal dissipation to ambient levels.',
      category: 'performance',
      icon: 'zap'
    },
    {
      value: '24H',
      numericValue: 24,
      unit: 'H',
      label: 'BATTERY',
      description: 'Continuous operational endurance under peak multi-sensory load.',
      detail: 'Solid-state solid-electrolyte quantum battery cells with kinetic ambient energy regeneration maintain unbroken operation.',
      category: 'hardware',
      icon: 'battery'
    },
    {
      value: '120Hz',
      numericValue: 120,
      unit: 'Hz',
      label: 'DISPLAY',
      description: 'Adaptive Micro-OLED retinal refresh rate with zero ghosting.',
      detail: 'Variable frame-timing architecture syncs with ocular microsaccades to render motion without motion sickness or visual degradation.',
      category: 'hardware',
      icon: 'eye'
    },
    {
      value: '1.4P',
      numericValue: 1.4,
      unit: 'PFLOPS',
      label: 'AI PROCESSING',
      description: 'On-device localized quantum neuromorphic tensor compute.',
      detail: 'Dedicated 128-core neural cluster running full multimodal vision, auditory spatialization, and contextual intent models locally.',
      category: 'ai',
      icon: 'cpu'
    }
  ];

  readonly specCategories: SpecCategory[] = [
    {
      id: 'performance',
      name: 'QUANTUM ENGINE',
      description: 'Breakthrough neuromorphic computing architecture.',
      metrics: [
        {
          value: '1.4 PFLOPS',
          numericValue: 1.4,
          unit: 'PFLOPS',
          label: 'Neural Compute',
          description: 'Peak AI processing throughput on dedicated silicon',
          detail: '128-core neuromorphic quantum tensor processing cluster',
          category: 'performance',
          icon: 'cpu'
        },
        {
          value: '0.02ms',
          numericValue: 0.02,
          unit: 'ms',
          label: 'Pipeline Latency',
          description: 'Ultra-low motion-to-photon latency',
          detail: 'Hardware-level direct bus bypassing intermediate OS buffers',
          category: 'performance',
          icon: 'activity'
        },
        {
          value: '98%',
          numericValue: 98,
          unit: '%',
          label: 'Thermodynamic Efficiency',
          description: 'Near-lossless power conversion',
          detail: 'Graphene vapor chamber cooling with passive radiant heat dissipation',
          category: 'performance',
          icon: 'shield'
        }
      ]
    },
    {
      id: 'optics',
      name: 'OPTICAL MATRIX',
      description: 'Direct-to-retina photonic wavefront projection system.',
      metrics: [
        {
          value: '8K',
          numericValue: 8,
          unit: 'K / Eye',
          label: 'Spatial Density',
          description: 'Sub-micron pixel density beyond human retina limit',
          detail: '4,096 PPI dual micro-crystal holographic display panels',
          category: 'hardware',
          icon: 'eye'
        },
        {
          value: '120Hz',
          numericValue: 120,
          unit: 'Hz',
          label: 'Retinal Refresh',
          description: 'Adaptive frame synchronization',
          detail: 'Dynamically scales from 1Hz to 120Hz based on gaze trajectory',
          category: 'hardware',
          icon: 'monitor'
        },
        {
          value: '10,000',
          numericValue: 10000,
          unit: 'Nits',
          label: 'Peak Luminance',
          description: 'Uncompromised visibility under direct sunlight',
          detail: 'Micro-LED photonic emitters with 1,000,000:1 contrast ratio',
          category: 'hardware',
          icon: 'sun'
        }
      ]
    },
    {
      id: 'connectivity',
      name: 'HYPER-MESH & SENSORY',
      description: 'Next-gen wireless topology and spatial telemetry array.',
      metrics: [
        {
          value: '400',
          numericValue: 400,
          unit: 'Gbps',
          label: 'Mesh Throughput',
          description: 'Sub-terahertz optical wireless data stream',
          detail: 'Multi-channel beamforming with automatic channel hopping',
          category: 'connectivity',
          icon: 'wifi'
        },
        {
          value: '24H',
          numericValue: 24,
          unit: 'Hours',
          label: 'Continuous Life',
          description: 'All-day spatial computing endurance',
          detail: 'Fast magnetic inductive charge: 0 to 80% in 14 minutes',
          category: 'hardware',
          icon: 'battery'
        },
        {
          value: '64-Mic',
          numericValue: 64,
          unit: 'Sensors',
          label: 'Sensory Array',
          description: 'Omnidirectional spatial acoustic and LiDAR sensors',
          detail: 'Nanometer-accurate spatial mapping and noise cancellation',
          category: 'connectivity',
          icon: 'radio'
        }
      ]
    }
  ];

  readonly galleryItems: GalleryItem[] = [
    {
      id: 'form',
      number: '01',
      title: 'NEXUS FORM',
      subtitle: 'THE MONOLITHIC OBSIDIAN CHASSIS',
      category: 'INDUSTRIAL DESIGN',
      description: 'Machined from a single block of aerospace-grade titanium and vapor-deposited obsidian glass.',
      fullStory: 'Every contour of NEXUS is sculpted with mathematical precision. The seamless unibody structure incorporates microscopic ventilation channels and magnetic contact points that remain invisible until activated.',
      accentColor: '#00f0ff',
      tags: ['AEROSPACE TITANIUM', 'OBSIDIAN GLASS', '0.4MM BEZEL'],
      dimensions: '142.4 × 69.8 × 7.1 mm',
      material: 'Grade-5 Titanium & Sapphire Crystal',
      specs: [
        { label: 'Weight', value: '168 grams' },
        { label: 'Finish', value: 'Vapor Obsidian Matte' },
        { label: 'Durability', value: 'IP69K Hermetic Seal' }
      ],
      visualType: 'monolith'
    },
    {
      id: 'detail',
      number: '02',
      title: 'NEXUS DETAIL',
      subtitle: 'OPTICAL NANOSTRUCTURE & LATTICE',
      category: 'MICROSCOPIC ENGINEERING',
      description: 'Nanometer-level diffraction gratings that manipulate light paths with sub-atomic precision.',
      fullStory: 'Beneath the exterior sapphire glass lies a multi-layer optical diffraction lattice. Over 40 million microscopic prisms redirect photons directly toward the focal plane, eliminating chromatic aberration entirely.',
      accentColor: '#8b5cf6',
      tags: ['DIFFRACTION LATTICE', 'SAPPHIRE OPTICS', 'PHOTONIC BUS'],
      dimensions: '3.2 Nanometer Etch Depth',
      material: 'Synthetic Diamond & Gallium Nitride',
      specs: [
        { label: 'Optical Purity', value: '99.998%' },
        { label: 'Refraction Index', value: '2.42 nD' },
        { label: 'Lattice Density', value: '4,800 Lines/mm' }
      ],
      visualType: 'microstructure'
    },
    {
      id: 'experience',
      number: '03',
      title: 'NEXUS EXPERIENCE',
      subtitle: 'SPATIAL FLUIDITY & INTERACTION',
      category: 'HUMAN INTERACTION',
      description: 'An interface that ceases to exist as a barrier, flowing seamlessly with cognitive thought.',
      fullStory: 'Experience digital reality without windows, menus, or tactile lag. NEXUS translates micro-movements, pupil dilation, and spatial gestures into instantaneous environmental transformations.',
      accentColor: '#ec4899',
      tags: ['NEURAL INTENT', 'GESTURE MATRIX', 'HAPTIC RESONANCE'],
      dimensions: 'Infinite Spatial Canvas',
      material: 'Adaptive Neural Software Subsystem',
      specs: [
        { label: 'Interaction Latency', value: '< 1ms' },
        { label: 'Gesture Precision', value: '0.1mm Tracking' },
        { label: 'Context Engine', value: 'Continuous Predictive' }
      ],
      visualType: 'retina'
    },
    {
      id: 'future',
      number: '04',
      title: 'NEXUS FUTURE',
      subtitle: 'AUTONOMOUS ADAPTIVE EVOLUTION',
      category: 'NEXT HORIZON',
      description: 'A platform engineered to expand its capabilities through autonomous firmware maturation.',
      fullStory: 'NEXUS is designed not as a static consumer product, but as an evolving quantum terminal. As collective intelligence models progress, the localized tensor hardware continuously reconfigures its synaptic pathways.',
      accentColor: '#10b981',
      tags: ['CONTINUOUS EVOLUTION', 'QUANTUM SYNAPSE', 'FUTURE-PROOF'],
      dimensions: 'Multi-Generation Architecture',
      material: 'Reconfigurable Quantum FPGA Fabric',
      specs: [
        { label: 'Architecture Life', value: '10+ Years' },
        { label: 'Synaptic Nodes', value: '1.2 Billion' },
        { label: 'Security Enclave', value: 'Post-Quantum LWE' }
      ],
      visualType: 'quantum-flow'
    }
  ];

  readonly productHotspots: ProductHotspot[] = [
    {
      id: 'core',
      title: 'QUANTUM SYNAPSE CORE',
      subtitle: 'NEUROMORPHIC PROCESSING UNIT',
      description: 'Sub-nanometer tensor processor delivering 1.4 PFLOPS with zero thermal throttling.',
      position: { x: 0, y: 0, z: 0 },
      screenPercent: { x: 50, y: 48 },
      badge: 'CORE'
    },
    {
      id: 'optics',
      title: 'PHOTONIC WAVEFRONT ARRAY',
      subtitle: 'MICRO-OPTICAL MATRIX',
      description: 'Direct-to-retina coherent photon modulation delivering true spatial stereoscopic depth.',
      position: { x: 1.2, y: 0.6, z: 0.4 },
      screenPercent: { x: 68, y: 35 },
      badge: 'OPTICS'
    },
    {
      id: 'chassis',
      title: 'AEROSPACE MONOLITH CHASSIS',
      subtitle: 'VAPOR-DEPOSITED TITANIUM',
      description: 'Single-billet forged titanium housing with integral kinetic energy harvesting.',
      position: { x: -1.2, y: -0.5, z: 0.2 },
      screenPercent: { x: 30, y: 62 },
      badge: 'CHASSIS'
    },
    {
      id: 'bus',
      title: 'HYPER-MESH TRANSCEIVER',
      subtitle: 'TERAHERTZ BEAMFORMING',
      description: '400 Gbps wireless entropic bus with sub-picosecond synchronization clocking.',
      position: { x: 0.8, y: -0.9, z: -0.3 },
      screenPercent: { x: 62, y: 72 },
      badge: 'CONNECT'
    }
  ];

  readonly productModes: ProductMode[] = [
    {
      id: 'default',
      name: 'MONOLITH VIEW',
      tagline: 'Standard Solid Casing',
      description: 'Sculpted obsidian surface with precision laser chamfers and dark chrome accents.',
      features: ['Vapor-Deposited Obsidian', 'Hermetic Seal', 'Touch Haptic Outer Ring']
    },
    {
      id: 'exploded',
      name: 'LATTICE BREAKDOWN',
      tagline: 'Internal Sub-System Breakdown',
      description: 'Exploded internal architectural components exposing the quantum neural core and optics.',
      features: ['Internal Core Exposure', 'Photonic Bus Routing', 'Thermal Heat Matrix']
    },
    {
      id: 'thermal',
      name: 'QUANTUM RESONANCE',
      tagline: 'Active Flux Distribution',
      description: 'Visualizes electromagnetic and photonic field resonance flowing through the neural matrix.',
      features: ['Electromagnetic Wave Spectrum', 'Dynamic Field Density', 'Zero Flux Leakage']
    }
  ];

  readonly productRevealLabels: ProductDetail[] = [
    {
      id: 'core',
      label: '01 / CORE',
      title: 'QUANTUM SYNAPSE',
      subtitle: '1.4 PFLOPS NEURAL CLUSTER',
      description: 'Sub-nanometer tensor matrix operating at zero thermal resistance with real-time autonomous neural plasticity.',
      specs: '128-Core Synaptic / 4.8 THz',
      desktopPosition: { x: 20, y: 34 },
      mobilePosition: { x: 50, y: 20 },
      anchor3D: { x: 0, y: 0.1, z: 0 },
      activeInFrames: [1, 2, 3, 4]
    },
    {
      id: 'system',
      label: '02 / SYSTEM',
      title: 'TITANIUM GIMBAL',
      subtitle: 'AEROSPACE GRADE-5 CHASSIS',
      description: 'Gyroscopically balanced orbital ring mechanism machined with 0.1-micron aerospace precision.',
      specs: 'Tri-Axial Kinetic / IP69K',
      desktopPosition: { x: 80, y: 32 },
      mobilePosition: { x: 50, y: 78 },
      anchor3D: { x: 1.4, y: 0.6, z: 0.2 },
      activeInFrames: [2, 3, 4]
    },
    {
      id: 'interface',
      label: '03 / INTERFACE',
      title: 'PHOTONIC WAVEFRONT',
      subtitle: 'DIRECT RETINAL EMISSION',
      description: 'Microscopic diffraction grating channels coherent photons directly to the ocular focal plane.',
      specs: '8K Dual Photonic / 120Hz',
      desktopPosition: { x: 18, y: 52 },
      mobilePosition: { x: 50, y: 24 },
      anchor3D: { x: -1.3, y: -0.5, z: 0.3 },
      activeInFrames: [3, 4]
    },
    {
      id: 'material',
      label: '04 / MATERIAL',
      title: 'OBSIDIAN LATTICE',
      subtitle: 'VAPOR-DEPOSITED SAPPHIRE',
      description: 'Ultra-dense hermetic shielding with integrated touch-sensitive acoustic waveguides and cryogenic cell.',
      specs: '99.998% Purity / 2.42 nD',
      desktopPosition: { x: 82, y: 52 },
      mobilePosition: { x: 50, y: 80 },
      anchor3D: { x: 1.2, y: -0.7, z: -0.3 },
      activeInFrames: [4]
    }
  ];

  readonly productRevealFrames: ProductRevealFrame[] = [
    {
      id: 'frame-01',
      frameIndex: 1,
      badge: '01 // GENESIS',
      title: 'NEXUS REVEAL',
      highlightWord: 'REVEAL',
      subtitle: 'Sub-micron Physical Synthesis',
      description: 'A monolithic synthesis of quantum computing and bespoke physical form enters the sensory field.',
      telemetry: [
        { label: 'FREQUENCY', value: '4.8 THz' },
        { label: 'CALIBRATION', value: '0.1µm NOMINAL' }
      ]
    },
    {
      id: 'frame-02',
      frameIndex: 2,
      badge: '02 // KINEMATICS',
      title: 'DESIGNED TO MOVE',
      highlightWord: 'MOVE',
      subtitle: 'Autonomous Tri-Axial Gyroscope',
      description: 'Engineered with triple-gimbal titanium articulation that responds dynamically to human presence and optical gaze.',
      telemetry: [
        { label: 'AXIS ARTICULATION', value: '360° TRI-AXIAL' },
        { label: 'RESPONSE LATENCY', value: '0.02ms' }
      ]
    },
    {
      id: 'frame-03',
      frameIndex: 3,
      badge: '03 // NEURAL ADAPTATION',
      title: 'DESIGNED TO ADAPT',
      highlightWord: 'ADAPT',
      subtitle: 'Fluid Real-Time Spatial Cognition',
      description: 'Continuous spatial resonance reconfigures internal photonic waveguides to mirror subconscious intention.',
      telemetry: [
        { label: 'SYNAPSE DENSITY', value: '1.2B NODES' },
        { label: 'OPTICAL BUS', value: '400 Gbps' }
      ]
    },
    {
      id: 'frame-04',
      frameIndex: 4,
      badge: '04 // THE HORIZON',
      title: 'THE NEXT EXPERIENCE.',
      highlightWord: 'EXPERIENCE',
      subtitle: 'Designed around interaction. Built for what comes next.',
      description: 'Not just another screen. A spatial quantum computing monolith engineered to redefine physical perception forever.',
      telemetry: [
        { label: 'NEURAL COMPUTE', value: '1.4 PFLOPS' },
        { label: 'PHOTONIC DENSITY', value: '8K DUAL' },
        { label: 'MOTION-TO-PHOTON', value: '< 0.18ms' }
      ]
    }
  ];
}

