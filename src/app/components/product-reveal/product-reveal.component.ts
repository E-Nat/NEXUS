import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  Inject,
  PLATFORM_ID,
  HostListener
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DataService } from '../../services/data.service';
import { SoundService } from '../../services/sound.service';
import { CursorService } from '../../services/cursor.service';
import { AnimationService } from '../../services/animation.service';
import { ProductDetail, ProductRevealFrame, CardStatus } from '../../models/product-reveal.model';
import { ProductSceneComponent } from './product-scene/product-scene.component';
import { ProductLabelComponent } from './product-label/product-label.component';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-product-reveal',
  standalone: true,
  imports: [
    CommonModule,
    ProductSceneComponent,
    ProductLabelComponent
  ],
  templateUrl: './product-reveal.component.html',
  styleUrls: ['./product-reveal.component.scss']
})
export class ProductRevealComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pinnedSection', { static: true }) pinnedSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('productScene') productSceneComponent?: ProductSceneComponent;

  readonly currentPhase = signal<number>(1);
  readonly activeFrameIndex = this.currentPhase; // alias for template backward compatibility
  readonly scrollProgressPercent = signal<number>(0);
  readonly activeMode = signal<'monolith' | 'exploded' | 'quantum'>('monolith');
  readonly selectedLabel = signal<ProductDetail | null>(null);
  readonly isExiting = signal<boolean>(false);

  public labels: ProductDetail[] = [];
  public frames: ProductRevealFrame[] = [];
  public isMobile = false;

  private isBrowser: boolean;
  private scrollTriggerInstance: ScrollTrigger | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    public dataService: DataService,
    public soundService: SoundService,
    public cursorService: CursorService,
    private animService: AnimationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.labels = this.dataService.productRevealLabels;
    this.frames = this.dataService.productRevealFrames;
    if (this.isBrowser) {
      this.checkViewport();
      console.log('PHASE → 1');
      console.log('CARD 01 → reveal');
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Small delay to ensure DOM dimensions and fonts are fully settled
    setTimeout(() => {
      this.initPinnedScrollTrigger();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }
  }

  @HostListener('window:resize')
  public onResize(): void {
    if (!this.isBrowser) return;
    this.checkViewport();
  }

  private checkViewport(): void {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Initializes the GSAP ScrollTrigger Pinned Timeline
   */
  private initPinnedScrollTrigger(): void {
    if (this.animService.isReducedMotion()) return;

    const el = this.pinnedSectionRef.nativeElement;

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => (this.isMobile ? '+=2600' : '+=3800'), // Ample scroll distance for leisurely cinematic pacing
      pin: true,
      pinSpacing: true,
      scrub: 0.8, // Smooth, natural mouse-wheel response
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = Math.max(0, Math.min(1, self.progress));
        this.scrollProgressPercent.set(Math.round(p * 100));

        // Update 3D Scene pose with continuous progress
        this.productSceneComponent?.updateScrollProgress(p);

        // Update Background Parallax Elements
        this.updateParallax(p);

        // Exit transition trigger
        if (p >= 0.94) {
          this.isExiting.set(true);
        } else {
          this.isExiting.set(false);
        }

        // Seamless Phase Ranges:
        // 0.00 - 0.22 -> Phase 1: Genesis (NEXUS ARISES / Card 01)
        // 0.22 - 0.48 -> Phase 2: Kinematics (DESIGNED TO MOVE / Card 02)
        // 0.48 - 0.72 -> Phase 3: Adaptive Cognition (DESIGNED TO ADAPT / Card 03)
        // 0.72 - 1.00 -> Phase 4: The Horizon (THE NEXT EXPERIENCE / Card 04)
        let targetFrame = 1;
        if (p >= 0.72) {
          targetFrame = 4;
        } else if (p >= 0.48) {
          targetFrame = 3;
        } else if (p >= 0.22) {
          targetFrame = 2;
        }

        this.setPhase(targetFrame);
      }
    });

    // Immediate progress evaluation on initialization (supports page reload midway down the page)
    if (this.scrollTriggerInstance) {
      const initialP = Math.max(0, Math.min(1, this.scrollTriggerInstance.progress));
      this.scrollProgressPercent.set(Math.round(initialP * 100));
      this.productSceneComponent?.updateScrollProgress(initialP);
      this.updateParallax(initialP);
      let initialFrame = 1;
      if (initialP >= 0.72) initialFrame = 4;
      else if (initialP >= 0.48) initialFrame = 3;
      else if (initialP >= 0.22) initialFrame = 2;
      this.currentPhase.set(initialFrame);
    }
  }

  /**
   * Transition phase state deterministically and sequentially
   */
  public setPhase(targetPhase: number): void {
    const current = this.currentPhase();
    if (targetPhase === current) return;

    if (targetPhase > current) {
      for (let p = current + 1; p <= targetPhase; p++) {
        console.log(`PHASE → ${p}`);
        console.log(`CARD 0${p} → reveal`);
        this.soundService.playChime(380 + p * 80, 'sine', 0.03, 0.4);
      }
    } else {
      for (let p = current - 1; p >= targetPhase; p--) {
        console.log(`PHASE → ${p}`);
      }
    }

    this.currentPhase.set(targetPhase);
  }

  private updateParallax(p: number): void {
    if (!this.pinnedSectionRef?.nativeElement) return;
    const el = this.pinnedSectionRef.nativeElement;
    const grid = el.querySelector<HTMLElement>('.reveal-technical-grid');
    const glow = el.querySelector<HTMLElement>('.reveal-ambient-glow');
    const ring1 = el.querySelector<HTMLElement>('.ring-1');
    const ring2 = el.querySelector<HTMLElement>('.ring-2');

    if (grid) {
      grid.style.transform = `translateY(${p * 35}px)`;
    }
    if (glow) {
      glow.style.transform = `translate(-50%, calc(-50% + ${p * 50}px)) scale(${1 + p * 0.12})`;
    }
    if (ring1) {
      ring1.style.transform = `translate(-50%, -50%) rotate(${p * 90}deg) scale(${1 + p * 0.06})`;
    }
    if (ring2) {
      ring2.style.transform = `translate(-50%, -50%) rotate(${-p * 60}deg) scale(${1 - p * 0.04})`;
    }
  }

  /**
   * Deterministic mapping from currentPhase:
   * State 1: currentPhase = 1 -> Card 01 active, others hidden
   * State 2: currentPhase = 2 -> Card 02 active, others hidden
   * State 3: currentPhase = 3 -> Card 03 active, others hidden
   * State 4: currentPhase = 4 -> Card 04 active, others hidden
   */
  public getCardStatus(label: ProductDetail): CardStatus {
    const phase = this.currentPhase();
    const cardPhase = label.phase ?? label.order ?? 1;

    return phase === cardPhase ? 'active' : 'hidden';
  }

  public isLabelActive(label: ProductDetail): boolean {
    const phase = this.currentPhase();
    const cardPhase = label.phase ?? label.order ?? 1;
    return phase === cardPhase;
  }

  public trackByLabelId(index: number, item: ProductDetail): string {
    return item.id;
  }

  public setMode(mode: 'monolith' | 'exploded' | 'quantum'): void {
    this.soundService.playClick();
    this.activeMode.set(mode);
    this.productSceneComponent?.setInteractiveMode(mode);
  }

  public onLabelSelect(label: ProductDetail): void {
    this.selectedLabel.set(label);
  }

  public onHover(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('hover', label);
  }

  public onLeave(): void {
    this.cursorService.resetCursor();
  }
}
