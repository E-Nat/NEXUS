import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  NgZone,
  Input,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollService } from '../../services/scroll.service';
import { AnimationService } from '../../services/animation.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-three-scene',
  standalone: true,
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.scss']
})
export class ThreeSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @Input() interactiveMode: 'default' | 'exploded' | 'thermal' = 'default';

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId: number | null = null;

  // 3D Objects
  private productGroup!: THREE.Group;
  private coreMesh!: THREE.Mesh;
  private innerCoreMesh!: THREE.Mesh;
  private outerRing1!: THREE.Mesh;
  private outerRing2!: THREE.Mesh;
  private outerRing3!: THREE.Mesh;
  private particleSystem!: THREE.Points;
  private gridMesh!: THREE.GridHelper;
  private ambientLight!: THREE.AmbientLight;
  private pointLightCyan!: THREE.PointLight;
  private pointLightViolet!: THREE.PointLight;

  // Mouse Parallax & Physics
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private clock = new THREE.Clock();

  // Scroll triggers
  private scrollTriggers: ScrollTrigger[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
    private scrollService: ScrollService,
    private animService: AnimationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.initThree();
    this.initLights();
    this.createParticles();
    this.createGrid();
    this.initMouseListener();
    this.initScrollAnimations();
    this.startRenderLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.scrollTriggers.forEach(st => st.kill());
    this.resizeObserver?.disconnect();
    this.disposeThree();
  }

  public setMode(mode: 'default' | 'exploded' | 'thermal'): void {
    this.interactiveMode = mode;
    if (!this.productGroup) return;

    if (mode === 'exploded') {
      gsap.to(this.outerRing1.position, { y: 1.2, z: 0.4, duration: 1.2, ease: 'power3.out' });
      gsap.to(this.outerRing2.position, { y: -1.2, z: -0.4, duration: 1.2, ease: 'power3.out' });
      gsap.to(this.outerRing3.position, { x: 1.5, duration: 1.2, ease: 'power3.out' });
      gsap.to(this.coreMesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1.2, ease: 'power3.out' });
    } else if (mode === 'thermal') {
      gsap.to(this.outerRing1.position, { y: 0, z: 0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.outerRing2.position, { y: 0, z: 0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.outerRing3.position, { x: 0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.pointLightCyan, { intensity: 8.0, duration: 0.8 });
      gsap.to(this.pointLightViolet, { intensity: 8.0, duration: 0.8 });
    } else {
      gsap.to(this.outerRing1.position, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.outerRing2.position, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.outerRing3.position, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.coreMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 1.0, ease: 'power3.out' });
      gsap.to(this.pointLightCyan, { intensity: 3.5, duration: 0.8 });
      gsap.to(this.pointLightViolet, { intensity: 3.0, duration: 0.8 });
    }
  }

  public setFeatureTheme(theme: 'cyan' | 'violet' | 'emerald'): void {
    if (!this.pointLightCyan || !this.pointLightViolet) return;
    
    let colorHex = 0x00f0ff;
    if (theme === 'violet') colorHex = 0x8b5cf6;
    if (theme === 'emerald') colorHex = 0x10b981;

    gsap.to(this.pointLightCyan.color, {
      r: ((colorHex >> 16) & 255) / 255,
      g: ((colorHex >> 8) & 255) / 255,
      b: (colorHex & 255) / 255,
      duration: 1.0
    });
  }

  private initThree(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060709, 0.045);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    container.appendChild(this.renderer.domElement);

    // Resize handling
    this.resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });
    this.resizeObserver.observe(container);
  }

  private initLights(): void {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Key Light (Cyan)
    this.pointLightCyan = new THREE.PointLight(0x00f0ff, 3.5, 20);
    this.pointLightCyan.position.set(4, 3, 5);
    this.scene.add(this.pointLightCyan);

    // Fill Light (Violet)
    this.pointLightViolet = new THREE.PointLight(0x8b5cf6, 3.0, 20);
    this.pointLightViolet.position.set(-4, -3, 3);
    this.scene.add(this.pointLightViolet);

    // Rim Light (White)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);
  }

  private createProductModel(): void {
    this.productGroup = new THREE.Group();

    // 1. Central Crystalline Quantum Core (Icosahedron with high-gloss refractive finish)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1018,
      emissive: 0x003344,
      emissiveIntensity: 0.4,
      roughness: 0.05,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      wireframe: false
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.productGroup.add(this.coreMesh);

    // 2. Inner Glowing Synaptic Matrix
    const innerGeo = new THREE.OctahedronGeometry(0.7, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    this.innerCoreMesh = new THREE.Mesh(innerGeo, innerMat);
    this.productGroup.add(this.innerCoreMesh);

    // 3. Orbital Ring 1 (Titanium Outer Horizon Ring)
    const ringGeo1 = new THREE.TorusGeometry(2.0, 0.035, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x222938,
      metalness: 0.95,
      roughness: 0.2,
      wireframe: false
    });
    this.outerRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.outerRing1.rotation.x = Math.PI / 3;
    this.productGroup.add(this.outerRing1);

    // 4. Orbital Ring 2 (Cyan Laser Optical Ring with glowing segments)
    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.02, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9
    });
    this.outerRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.outerRing2.rotation.y = Math.PI / 4;
    this.productGroup.add(this.outerRing2);

    // 5. Orbital Ring 3 (Segmented Aerospace Shield Ring)
    const ringGeo3 = new THREE.TorusGeometry(2.8, 0.04, 16, 60);
    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x111622,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.3
    });
    this.outerRing3 = new THREE.Mesh(ringGeo3, ringMat3);
    this.outerRing3.rotation.x = -Math.PI / 4;
    this.outerRing3.rotation.z = Math.PI / 6;
    this.productGroup.add(this.outerRing3);

    this.scene.add(this.productGroup);
  }

  private createParticles(): void {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color(0x00f0ff);
    const violet = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = cyan.clone().lerp(violet, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  private createGrid(): void {
    this.gridMesh = new THREE.GridHelper(30, 40, 0x00f0ff, 0x111b2b);
    this.gridMesh.position.y = -3.8;
    const gridMat = this.gridMesh.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.18;
    this.scene.add(this.gridMesh);
  }

  private initMouseListener(): void {
    window.addEventListener('mousemove', (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.targetMouseX = (e.clientX - halfW) / halfW;
      this.targetMouseY = (e.clientY - halfH) / halfH;
    }, { passive: true });
  }

  private initScrollAnimations(): void {
    if (this.animService.isReducedMotion()) return;

    // Timeline 1: Specs Section particle swirl
    const specsST = ScrollTrigger.create({
      trigger: '#specs-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        if (this.particleSystem) {
          this.particleSystem.rotation.x = p * Math.PI * 0.5;
        }
      }
    });
    this.scrollTriggers.push(specsST);

    // Timeline 2: Final CTA Section Vortex
    const ctaST = ScrollTrigger.create({
      trigger: '#final-cta-section',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        if (this.particleSystem) {
          this.particleSystem.rotation.y = p * 4;
        }
      }
    });
    this.scrollTriggers.push(ctaST);
  }

  private onResize(): void {
    if (!this.containerRef || !this.renderer || !this.camera) return;
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startRenderLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const render = () => {
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Smooth Mouse Parallax Lerp
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        if (this.productGroup) {
          // Idle floating oscillation
          this.productGroup.position.y += Math.sin(elapsedTime * 1.5) * 0.0015;
          this.productGroup.rotation.y += 0.004;

          // Parallax tilt from cursor
          this.productGroup.rotation.x = this.mouseY * 0.35;
          this.productGroup.rotation.z = -this.mouseX * 0.25;

          // Ring independent gyroscopic rotations
          if (this.outerRing1) this.outerRing1.rotation.z += 0.008;
          if (this.outerRing2) this.outerRing2.rotation.x += 0.012;
          if (this.outerRing3) this.outerRing3.rotation.y += 0.006;

          // Inner core counter-rotation & pulsing scale
          if (this.innerCoreMesh) {
            this.innerCoreMesh.rotation.y -= 0.015;
            this.innerCoreMesh.rotation.x += 0.01;
            const pulse = 1 + Math.sin(elapsedTime * 3) * 0.06;
            this.innerCoreMesh.scale.set(pulse, pulse, pulse);
          }
        }

        // Particle subtle rotation
        if (this.particleSystem) {
          this.particleSystem.rotation.y += 0.001;
        }

        // Dynamic light movement
        if (this.pointLightCyan) {
          this.pointLightCyan.position.x = Math.sin(elapsedTime * 0.8) * 5;
          this.pointLightCyan.position.z = Math.cos(elapsedTime * 0.8) * 5;
        }

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(render);
      };

      this.animationFrameId = requestAnimationFrame(render);
    });
  }

  private disposeThree(): void {
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
