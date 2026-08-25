import {
  Component,
  OnInit,
  AfterViewInit,
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
import { SpecCategory, SpecMetric } from '../../models/spec.model';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-specs-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specs-section.component.html',
  styleUrls: ['./specs-section.component.scss']
})
export class SpecsSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('specsSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;

  public keyMetrics: SpecMetric[] = [];
  public categories: SpecCategory[] = [];
  readonly activeCategoryId = signal<string>('performance');
  readonly currentLoad = signal<number>(84); // Interactive workload slider

  private isBrowser: boolean;

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
    this.keyMetrics = this.dataService.keyMetrics;
    this.categories = this.dataService.specCategories;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.animService.isReducedMotion()) return;

    this.initCounterAnimations();
  }

  private initCounterAnimations(): void {
    const el = this.sectionRef.nativeElement;

    // Statement reveal
    gsap.fromTo(el.querySelectorAll('.spec-reveal'),
      { y: 50, opacity: 0, filter: 'blur(8px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Number counters
    const counterElements = el.querySelectorAll('.counter-val');
    counterElements.forEach((valEl) => {
      const target = parseFloat(valEl.getAttribute('data-val') || '0');
      const suffix = valEl.getAttribute('data-suffix') || '';

      this.animService.animateCounter(valEl as HTMLElement, target, {
        suffix,
        duration: 2.2,
        scrollTrigger: {
          trigger: valEl,
          start: 'top 85%'
        }
      });
    });
  }

  public selectCategory(catId: string): void {
    this.soundService.playClick();
    this.activeCategoryId.set(catId);
  }

  public getActiveCategory(): SpecCategory | undefined {
    return this.categories.find(c => c.id === this.activeCategoryId());
  }

  public onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currentLoad.set(parseInt(target.value, 10));
  }

  public onHover(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('hover', label);
  }

  public onLeave(): void {
    this.cursorService.resetCursor();
  }
}
