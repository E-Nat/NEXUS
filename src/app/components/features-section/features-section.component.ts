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
import { Feature } from '../../models/feature.model';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss']
})
export class FeaturesSectionComponent implements OnInit, AfterViewInit {
  @Output() featureSelect = new EventEmitter<Feature>();
  @Output() themeChange = new EventEmitter<'cyan' | 'violet' | 'emerald'>();
  @ViewChild('featuresWrap', { static: true }) wrapRef!: ElementRef<HTMLElement>;

  public features: Feature[] = [];
  readonly activeFeatureIndex = signal<number>(0);
  readonly selectedFeatureModal = signal<Feature | null>(null);

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
    this.features = this.dataService.features;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.animService.isReducedMotion()) return;

    this.initScrollAnimations();
  }

  private initScrollAnimations(): void {
    const rows = this.wrapRef.nativeElement.querySelectorAll('.feature-row');

    rows.forEach((row) => {
      gsap.fromTo(row,
        { y: 60, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  public onFeatureHover(index: number, feature: Feature, event: MouseEvent): void {
    this.activeFeatureIndex.set(index);
    this.soundService.playHover();
    this.cursorService.setCursor('explore', 'EXPLORE');
    this.themeChange.emit(feature.visualTheme);

    // Update localized cursor glow inside row
    const targetRow = (event.currentTarget as HTMLElement);
    if (targetRow) {
      const rect = targetRow.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      targetRow.style.setProperty('--mouse-x', `${x}px`);
      targetRow.style.setProperty('--mouse-y', `${y}px`);
    }
  }

  public onFeatureMouseMove(event: MouseEvent): void {
    const targetRow = (event.currentTarget as HTMLElement);
    if (targetRow) {
      const rect = targetRow.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      targetRow.style.setProperty('--mouse-x', `${x}px`);
      targetRow.style.setProperty('--mouse-y', `${y}px`);
    }
  }

  public onFeatureLeave(): void {
    this.cursorService.resetCursor();
  }

  public openFeatureDetails(feature: Feature): void {
    this.soundService.playClick();
    this.selectedFeatureModal.set(feature);
    this.featureSelect.emit(feature);
  }

  public closeModal(): void {
    this.soundService.playClick();
    this.selectedFeatureModal.set(null);
  }
}
