import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollService } from '../../services/scroll.service';
import { SoundService } from '../../services/sound.service';
import { CursorService } from '../../services/cursor.service';
import { AnimationService } from '../../services/animation.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() exploreClick = new EventEmitter<void>();
  @Output() filmClick = new EventEmitter<void>();

  @ViewChild('heroTitle', { static: true }) heroTitleRef!: ElementRef<HTMLHeadingElement>;
  @ViewChild('heroCta', { static: true }) heroCtaRef!: ElementRef<HTMLButtonElement>;

  private isBrowser: boolean;
  private cleanupMagnetic: (() => void) | null = null;
  private exitScrollTrigger: ScrollTrigger | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    public scrollService: ScrollService,
    public soundService: SoundService,
    public cursorService: CursorService,
    private animService: AnimationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    if (this.heroCtaRef?.nativeElement) {
      this.cleanupMagnetic = this.animService.applyMagnetic(this.heroCtaRef.nativeElement, 0.35);
    }

    this.initExitScroll();
  }

  ngOnDestroy(): void {
    if (this.cleanupMagnetic) {
      this.cleanupMagnetic();
      this.cleanupMagnetic = null;
    }
    if (this.exitScrollTrigger) {
      this.exitScrollTrigger.kill();
      this.exitScrollTrigger = null;
    }
  }

  private initExitScroll(): void {
    if (this.animService.isReducedMotion()) return;

    this.exitScrollTrigger = ScrollTrigger.create({
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set('.hero-container', {
          y: -p * 110,
          opacity: Math.max(0, 1 - p * 1.25),
          filter: `blur(${p * 8}px)`
        });
      }
    });
  }

  public triggerEntrance(): void {
    if (!this.isBrowser || this.animService.isReducedMotion()) return;

    const tl = gsap.timeline({ delay: 0.1 });

    // 1. Badge & Meta
    tl.fromTo('.hero-badge, .hero-telemetry-tag',
      { y: 25, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.1, ease: 'power3.out' }
    );

    // 2. Headline word-by-word reveal
    tl.fromTo('.hero-word',
      { y: 60, opacity: 0, filter: 'blur(12px)', rotateX: 25 },
      { y: 0, opacity: 1, filter: 'blur(0px)', rotateX: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' },
      '-=0.6'
    );

    // 3. Subtitle
    tl.fromTo('.hero-description',
      { y: 30, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
      '-=0.7'
    );

    // 4. CTAs & scroll indicator
    tl.fromTo('.hero-actions-row, .hero-scroll-indicator',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
      '-=0.5'
    );
  }

  public onExplore(): void {
    this.soundService.playClick();
    this.scrollService.scrollTo('#product-reveal-section', { duration: 1.5 });
    this.exploreClick.emit();
  }

  public onWatchFilm(): void {
    this.soundService.playClick();
    this.filmClick.emit();
  }

  public onHoverBtn(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('hover', label);
  }

  public onLeaveBtn(): void {
    this.cursorService.resetCursor();
  }

  public scrollToProduct(): void {
    this.soundService.playClick();
    this.scrollService.scrollTo('#product-reveal-section');
  }
}
