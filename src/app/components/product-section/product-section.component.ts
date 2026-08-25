import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
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
import { ProductHotspot, ProductMode } from '../../models/product.model';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-section.component.html',
  styleUrls: ['./product-section.component.scss']
})
export class ProductSectionComponent implements OnInit, AfterViewInit {
  @Output() modeChange = new EventEmitter<'default' | 'exploded' | 'thermal'>();
  @ViewChild('productSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;

  readonly activeMode = signal<'default' | 'exploded' | 'thermal'>('default');
  readonly selectedHotspot = signal<ProductHotspot | null>(null);

  public hotspots: ProductHotspot[] = [];
  public modes: ProductMode[] = [];
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
    this.hotspots = this.dataService.productHotspots;
    this.modes = this.dataService.productModes;
    this.selectedHotspot.set(this.hotspots[0]);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.animService.isReducedMotion()) return;

    this.initScrollDrivenAnimation();
  }

  private initScrollDrivenAnimation(): void {
    const el = this.sectionRef.nativeElement;

    // Reveal headline and meta tags
    gsap.fromTo(el.querySelectorAll('.prod-reveal'),
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Parallax background decorative lines
    gsap.to('.prod-deco-ring', {
      rotation: 360,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      }
    });
  }

  public setProductMode(modeId: string): void {
    const mode = modeId as 'default' | 'exploded' | 'thermal';
    this.soundService.playClick();
    this.activeMode.set(mode);
    this.modeChange.emit(mode);
  }

  public selectHotspot(hotspot: ProductHotspot): void {
    this.soundService.playClick();
    this.selectedHotspot.set(hotspot);
  }

  public onHover(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('hover', label);
  }

  public onLeave(): void {
    this.cursorService.resetCursor();
  }
}
