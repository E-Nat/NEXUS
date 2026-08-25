import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  signal,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DataService } from '../../services/data.service';
import { SoundService } from '../../services/sound.service';
import { CursorService } from '../../services/cursor.service';
import { AnimationService } from '../../services/animation.service';
import { GalleryItem } from '../../models/gallery.model';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GallerySectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gallerySection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('headerRef', { static: true }) headerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cardsGridRef', { static: true }) cardsGridRef!: ElementRef<HTMLDivElement>;
  @ViewChild('watermarkRef', { static: false }) watermarkRef?: ElementRef<HTMLDivElement>;
  @ViewChild('glowRef', { static: false }) glowRef?: ElementRef<HTMLDivElement>;

  public items: GalleryItem[] = [];
  readonly selectedItem = signal<GalleryItem | null>(null);
  readonly hoveredIndex = signal<number | null>(null);

  private isBrowser: boolean;
  private revealTimeline: gsap.core.Timeline | null = null;

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
    this.items = this.dataService.galleryItems;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initScrollReveal();
  }

  ngOnDestroy(): void {
    if (this.revealTimeline) {
      this.revealTimeline.kill();
      this.revealTimeline = null;
    }
  }

  private initScrollReveal(): void {
    const section = this.sectionRef.nativeElement;
    const header = this.headerRef.nativeElement;
    const sectionLabel = header.querySelector('.section-label');
    const title = header.querySelector('.gallery-title');
    const meta = header.querySelector('.gallery-meta');
    const cards = this.cardsGridRef.nativeElement.querySelectorAll('.gallery-card');
    const watermark = this.watermarkRef?.nativeElement;
    const glow = this.glowRef?.nativeElement;

    if (this.animService.isReducedMotion()) {
      if (sectionLabel) gsap.set(sectionLabel, { opacity: 1, y: 0 });
      if (title) gsap.set(title, { opacity: 1, y: 0 });
      if (meta) gsap.set(meta, { opacity: 1, y: 0 });
      gsap.set(cards, { opacity: 1, y: 0 });
      if (watermark) gsap.set(watermark, { opacity: 0.03, y: 0, scale: 1 });
      if (glow) gsap.set(glow, { opacity: 1 });
      return;
    }

    // Set initial states to ensure clean reveal
    if (sectionLabel) gsap.set(sectionLabel, { opacity: 0, y: 16 });
    if (title) gsap.set(title, { opacity: 0, y: 24 });
    if (meta) gsap.set(meta, { opacity: 0, y: 16 });
    gsap.set(cards, { opacity: 0, y: 40 });
    if (watermark) gsap.set(watermark, { opacity: 0, y: 25, scale: 0.96 });
    if (glow) gsap.set(glow, { opacity: 0 });

    // Scroll-triggered sequential reveal timeline:
    // 1. Section label fades/slides in
    // 2. "MATERIALITY & FORM." title appears
    // 3. Cards reveal sequentially (Card 01 -> Card 02 -> Card 03)
    // 4. After cards settle, background typography & atmosphere subtly fade in
    this.revealTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        once: true,
        invalidateOnRefresh: true
      }
    });

    // Step 1: Section label fades/slides in
    if (sectionLabel) {
      this.revealTimeline.to(sectionLabel, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    // Step 2: "MATERIALITY & FORM." title appears
    if (title) {
      this.revealTimeline.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out'
      }, '-=0.2');
    }

    if (meta) {
      this.revealTimeline.to(meta, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '<+=0.1');
    }

    // Step 3: Cards Reveal sequentially (Card 01 -> Card 02 -> Card 03)
    this.revealTimeline.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.16,
      ease: 'power2.out',
      clearProps: 'transform' // Ensures cards settle naturally into static document layout
    }, '-=0.15');

    // Step 4: Background watermark and atmosphere subtle fade in AFTER cards settle
    if (watermark) {
      this.revealTimeline.to(watermark, {
        opacity: 0.03, // Visually subordinate to cards
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, '+=0.15');
    }

    if (glow) {
      this.revealTimeline.to(glow, {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, '<');
    }
  }

  public openItem(item: GalleryItem): void {
    this.soundService.playClick();
    this.selectedItem.set(item);
  }

  public closeItem(): void {
    this.soundService.playClick();
    this.selectedItem.set(null);
  }

  public onHoverCard(index: number, label: string): void {
    this.hoveredIndex.set(index);
    this.soundService.playHover();
    this.cursorService.setCursor('view', label);
  }

  public onLeaveCard(): void {
    this.hoveredIndex.set(null);
    this.cursorService.resetCursor();
  }
}
