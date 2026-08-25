import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  NgZone,
  Input,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import gsap from 'gsap';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-product-scene',
  standalone: true,
  templateUrl: './product-scene.component.html',
  styleUrls: ['./product-scene.component.scss']
})
export class ProductSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @Input() interactiveMode: 'monolith' | 'exploded' | 'quantum' = 'monolith';

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // 3D Groups & Objects
  private masterGroup!: THREE.Group;
  private productGroup!: THREE.Group;
  private coreMesh!: THREE.Mesh;
  private innerSynapseMesh!: THREE.Mesh;
  private gimbalRing1!: THREE.Mesh;
  private waveguideRing2!: THREE.Mesh;
  private shieldRing3!: THREE.Mesh;
  private topLensMesh!: THREE.Mesh;
  private bottomLensMesh!: THREE.Mesh;
  private particleSystem!: THREE.Points;
  private ambientLight!: THREE.AmbientLight;
  private keyLightCyan!: THREE.PointLight;
  private fillLightViolet!: THREE.PointLight;
  private rimLightDirectional!: THREE.DirectionalLight;

  // Material references for opacity & effects control
  private pbrMaterials: THREE.Material[] = [];

  // Mouse Parallax & Physics State
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private clock = new THREE.Clock();

  // Scroll Scrubbing State
  private currentScrollProgress = 0;
  private isBrowser: boolean;
  private isMobileDevice = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
    private animService: AnimationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.isMobileDevice = window.innerWidth < 768;
    this.initThree();
    this.initLighting();
    this.createProductModel();
    this.createAtmosphericParticles();
    this.initMouseListener();
    this.startRenderLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.resizeObserver?.disconnect();
    this.disposeScene();
  }

  /**
   * Called by the parent ProductRevealComponent as the scroll position progresses from 0 to 1
   */
  public updateScrollProgress(progress: number): void {
    this.currentScrollProgress = Math.max(0, Math.min(1, progress));
    if (!this.masterGroup || !this.productGroup) return;

    const p = this.currentScrollProgress;
    const baseScaleMultiplier = this.isMobileDevice ? 0.72 : 1.0;

    // 1. Entrance Phase (0.00 -> 0.22): Product enters from below, scales up, fades in
    if (p <= 0.22) {
      const enterNorm = p / 0.22; // 0 to 1
      const easeEnter = Math.sin((enterNorm * Math.PI) / 2);

      this.masterGroup.position.y = (-2.8 + easeEnter * 2.8) * (this.isMobileDevice ? 0.75 : 1.0);
      this.masterGroup.position.z = 0;
      const targetScale = (0.65 + easeEnter * 0.35) * baseScaleMultiplier;
      this.masterGroup.scale.setScalar(targetScale);

      this.productGroup.rotation.y = -0.8 + easeEnter * 0.8;
      this.productGroup.rotation.x = (1 - easeEnter) * 0.4;
      this.productGroup.rotation.z = 0;

      this.setMasterOpacity(Math.min(1, enterNorm * 1.5));

      // Reset rings
      this.gimbalRing1.position.set(0, 0, 0);
      this.waveguideRing2.position.set(0, 0, 0);
      this.shieldRing3.position.set(0, 0, 0);
    }
    // 2. Frame 02 - "DESIGNED TO MOVE" (0.22 -> 0.48): Product rotates, rings articulate
    else if (p <= 0.48) {
      const norm = (p - 0.22) / 0.26; // 0 to 1
      const ease = 0.5 - Math.cos(norm * Math.PI) / 2;

      this.masterGroup.position.y = 0;
      this.masterGroup.position.z = 0;
      this.masterGroup.scale.setScalar((1.0 + ease * 0.05) * baseScaleMultiplier);

      this.productGroup.rotation.y = 0.0 + ease * 1.15; // ~66 deg
      this.productGroup.rotation.x = 0.0 - ease * 0.28;
      this.productGroup.rotation.z = 0.0 + ease * 0.18;

      // Articulate gimbal rings
      this.gimbalRing1.position.y = ease * 0.45;
      this.gimbalRing1.position.z = ease * 0.2;
      this.waveguideRing2.position.y = -ease * 0.35;
      this.waveguideRing2.position.z = -ease * 0.2;

      this.setMasterOpacity(1);
    }
    // 3. Frame 03 - "DESIGNED TO ADAPT" (0.48 -> 0.72): Spatial rotation & counter-spin
    else if (p <= 0.72) {
      const norm = (p - 0.48) / 0.24; // 0 to 1
      const ease = 0.5 - Math.cos(norm * Math.PI) / 2;

      this.masterGroup.position.y = Math.sin(norm * Math.PI) * 0.15;
      this.masterGroup.position.z = 0;
      this.masterGroup.scale.setScalar(1.05 * baseScaleMultiplier);

      this.productGroup.rotation.y = 1.15 + ease * 1.35; // to 2.5 rad (~143 deg)
      this.productGroup.rotation.x = -0.28 + ease * 0.58; // to +0.3 rad
      this.productGroup.rotation.z = 0.18 - ease * 0.42; // to -0.24 rad

      // Dynamic ring wave
      this.gimbalRing1.position.y = 0.45 - ease * 0.45;
      this.waveguideRing2.position.y = -0.35 + ease * 0.35;
      this.shieldRing3.position.x = ease * 0.3;

      this.setMasterOpacity(1);
    }
    // 4. Frame 04 - "THE NEXT EXPERIENCE" (0.72 -> 0.94): Symmetrical hero alignment
    else if (p <= 0.94) {
      const norm = (p - 0.72) / 0.22; // 0 to 1
      const ease = 0.5 - Math.cos(norm * Math.PI) / 2;

      this.masterGroup.position.y = 0;
      this.masterGroup.position.z = 0;
      this.masterGroup.scale.setScalar((1.05 + ease * 0.05) * baseScaleMultiplier);

      this.productGroup.rotation.y = 2.5 + ease * 0.64; // to ~3.14 rad (180 deg)
      this.productGroup.rotation.x = 0.30 - ease * 0.25; // to 0.05
      this.productGroup.rotation.z = -0.24 + ease * 0.24; // to 0.0

      this.gimbalRing1.position.set(0, 0, 0);
      this.waveguideRing2.position.set(0, 0, 0);
      this.shieldRing3.position.set(0, 0, 0);

      this.setMasterOpacity(1);
    }
    // 5. Exit Transition to Features (0.94 -> 1.00): Recedes smoothly into distance
    else {
      const norm = (p - 0.94) / 0.06; // 0 to 1
      const ease = norm * norm; // accelerate away

      this.masterGroup.position.z = -ease * 5.5;
      this.masterGroup.position.y = ease * 0.8;
      this.masterGroup.scale.setScalar((1.10 - ease * 0.45) * baseScaleMultiplier);

      this.productGroup.rotation.y = 3.14 + norm * 0.5;

      const exitOpacity = Math.max(0, 1 - norm * 1.25);
      this.setMasterOpacity(exitOpacity);
    }
  }

  /**
   * Dynamic inspection modes triggered by UI controls
   */
  public setInteractiveMode(mode: 'monolith' | 'exploded' | 'quantum'): void {
    this.interactiveMode = mode;
    if (!this.productGroup) return;

    if (mode === 'exploded') {
      gsap.to(this.gimbalRing1.position, { y: 1.1, z: 0.4, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.waveguideRing2.position, { y: -1.1, z: -0.4, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.shieldRing3.position, { x: 1.3, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.coreMesh.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1.0, ease: 'power3.out' });
    } else if (mode === 'quantum') {
      gsap.to(this.gimbalRing1.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.waveguideRing2.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.shieldRing3.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.coreMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.keyLightCyan, { intensity: 7.5, duration: 0.6 });
      gsap.to(this.fillLightViolet, { intensity: 6.5, duration: 0.6 });
    } else {
      // Monolith
      gsap.to(this.gimbalRing1.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.waveguideRing2.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.shieldRing3.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.coreMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.8, ease: 'power3.out' });
      gsap.to(this.keyLightCyan, { intensity: 3.8, duration: 0.6 });
      gsap.to(this.fillLightViolet, { intensity: 3.2, duration: 0.6 });
    }
  }

  private initThree(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.8);

    // High-performance WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobileDevice,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    container.appendChild(this.renderer.domElement);

    // Dynamic resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.onWindowResize();
    });
    this.resizeObserver.observe(container);
  }

  private initLighting(): void {
    // Ambient baseline
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);

    // Primary Cyan Key Light (High-tech illumination)
    this.keyLightCyan = new THREE.PointLight(0x00f0ff, 3.8, 18);
    this.keyLightCyan.position.set(3.8, 2.5, 4.5);
    this.scene.add(this.keyLightCyan);

    // Deep Violet Fill Light (Sensory contrast)
    this.fillLightViolet = new THREE.PointLight(0x8b5cf6, 3.2, 18);
    this.fillLightViolet.position.set(-3.8, -2.5, 3.5);
    this.scene.add(this.fillLightViolet);

    // Razor-Sharp Specular Rim Light
    this.rimLightDirectional = new THREE.DirectionalLight(0xffffff, 1.8);
    this.rimLightDirectional.position.set(0, 6, -4);
    this.scene.add(this.rimLightDirectional);
  }

  private createProductModel(): void {
    this.masterGroup = new THREE.Group();
    this.productGroup = new THREE.Group();

    // 1. Central Crystalline Quantum Core (Icosahedron with high-gloss refractive obsidian finish)
    const coreGeo = new THREE.IcosahedronGeometry(1.22, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x070b12,
      emissive: 0x001d29,
      emissiveIntensity: 0.55,
      roughness: 0.06,
      metalness: 0.94,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.98,
      transparent: true,
      opacity: 1.0
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.pbrMaterials.push(coreMat);
    this.productGroup.add(this.coreMesh);

    // 2. Inner Glowing Synaptic Lattice (Octahedron synaptic wireframe)
    const synapseGeo = new THREE.OctahedronGeometry(0.72, 2);
    const synapseMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    this.innerSynapseMesh = new THREE.Mesh(synapseGeo, synapseMat);
    this.pbrMaterials.push(synapseMat);
    this.productGroup.add(this.innerSynapseMesh);

    // 2b. Inner Quantum Energy Nucleus (Pulsing high-energy core)
    const nucleusGeo = new THREE.IcosahedronGeometry(0.28, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    this.pbrMaterials.push(nucleusMat);
    this.productGroup.add(nucleusMesh);

    // 3. Gimbal Outer Ring 1 (Titanium Grade-5 Horizon Ring)
    const ringGeo1 = new THREE.TorusGeometry(2.05, 0.038, 16, 120);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x242d3d,
      metalness: 0.96,
      roughness: 0.18,
      transparent: true,
      opacity: 1.0
    });
    this.gimbalRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.gimbalRing1.rotation.x = Math.PI / 3;
    this.pbrMaterials.push(ringMat1);

    // Satellite Magnetic Nodes on Ring 1
    const nodeGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1
    });
    this.pbrMaterials.push(nodeMat);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(Math.cos(angle) * 2.05, Math.sin(angle) * 2.05, 0);
      this.gimbalRing1.add(nodeMesh);
    }
    this.productGroup.add(this.gimbalRing1);

    // 4. Optical Waveguide Ring 2 (Cyan Laser Transmission Ring)
    const ringGeo2 = new THREE.TorusGeometry(2.45, 0.024, 16, 140);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.92
    });
    this.waveguideRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.waveguideRing2.rotation.y = Math.PI / 3.5;
    this.pbrMaterials.push(ringMat2);
    this.productGroup.add(this.waveguideRing2);

    // 5. Aerospace Shield Ring 3 (Segmented Obsidian Protective Frame)
    const ringGeo3 = new THREE.TorusGeometry(2.85, 0.045, 16, 64);
    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x0f1522,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.4,
      metalness: 0.92,
      roughness: 0.25,
      transparent: true,
      opacity: 1.0
    });
    this.shieldRing3 = new THREE.Mesh(ringGeo3, ringMat3);
    this.shieldRing3.rotation.x = -Math.PI / 3.8;
    this.shieldRing3.rotation.z = Math.PI / 5;
    this.pbrMaterials.push(ringMat3);
    this.productGroup.add(this.shieldRing3);

    // 6. Dual Sapphire Photonic Lenses (Top & Bottom Emitter Nodes)
    const lensGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 32);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.25,
      roughness: 0.02,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.77,
      transparent: true,
      opacity: 0.9
    });
    this.topLensMesh = new THREE.Mesh(lensGeo, lensMat);
    this.topLensMesh.position.y = 1.35;
    this.bottomLensMesh = new THREE.Mesh(lensGeo, lensMat);
    this.bottomLensMesh.position.y = -1.35;
    this.pbrMaterials.push(lensMat);
    this.productGroup.add(this.topLensMesh);
    this.productGroup.add(this.bottomLensMesh);

    // Responsive initial scale
    if (this.isMobileDevice) {
      this.masterGroup.scale.setScalar(0.72);
    }

    // Assemble Hierarchy
    this.masterGroup.add(this.productGroup);
    this.scene.add(this.masterGroup);
  }

  private createAtmosphericParticles(): void {
    const particleCount = this.isMobileDevice ? 90 : 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00f0ff);
    const colorViolet = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.6 + Math.random() * 4.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = colorCyan.clone().lerp(colorViolet, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: this.isMobileDevice ? 0.03 : 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.pbrMaterials.push(particleMaterial);

    this.particleSystem = new THREE.Points(geometry, particleMaterial);
    this.scene.add(this.particleSystem);
  }

  private setMasterOpacity(opacity: number): void {
    this.pbrMaterials.forEach(mat => {
      mat.opacity = opacity;
    });
  }

  private initMouseListener(): void {
    if (this.animService.isReducedMotion()) return;

    window.addEventListener('mousemove', (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.targetMouseX = (e.clientX - halfW) / halfW;
      this.targetMouseY = (e.clientY - halfH) / halfH;
    }, { passive: true });
  }

  private onWindowResize(): void {
    if (!this.containerRef || !this.renderer || !this.camera) return;
    this.isMobileDevice = window.innerWidth < 768;
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.updateScrollProgress(this.currentScrollProgress);
  }

  private startRenderLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const render = () => {
        const elapsedTime = this.clock.getElapsedTime();

        // Smooth mouse lerp (subtle physics)
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        if (this.masterGroup) {
          // Subtle mouse parallax tilt
          this.masterGroup.rotation.x = this.mouseY * 0.22;
          this.masterGroup.rotation.z = -this.mouseX * 0.18;

          // Continuous gentle idle floating breathing
          this.productGroup.position.y += Math.sin(elapsedTime * 1.6) * 0.0008;

          // Ring independent gyroscopic micro rotations
          if (this.gimbalRing1) this.gimbalRing1.rotation.z += 0.004;
          if (this.waveguideRing2) this.waveguideRing2.rotation.x += 0.007;
          if (this.shieldRing3) this.shieldRing3.rotation.y += 0.003;

          // Synapse core pulsing & counter-spin
          if (this.innerSynapseMesh) {
            this.innerSynapseMesh.rotation.y -= 0.012;
            this.innerSynapseMesh.rotation.x += 0.008;
            const pulse = 1 + Math.sin(elapsedTime * 3.5) * 0.07;
            this.innerSynapseMesh.scale.set(pulse, pulse, pulse);
          }
        }

        // Particle field subtle drift
        if (this.particleSystem) {
          this.particleSystem.rotation.y += 0.0008;
        }

        // Dynamic key light orbit
        if (this.keyLightCyan) {
          this.keyLightCyan.position.x = 3.8 + Math.sin(elapsedTime * 0.7) * 1.2 + this.mouseX * 1.5;
          this.keyLightCyan.position.y = 2.5 + Math.cos(elapsedTime * 0.7) * 1.0 - this.mouseY * 1.2;
        }

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(render);
      };

      this.animationFrameId = requestAnimationFrame(render);
    });
  }

  private disposeScene(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }
}
