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
import { GalleryItem } from '../../models/gallery.model';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.scss']
})
export class GallerySectionComponent implements OnInit, AfterViewInit {
  @ViewChild('gallerySection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('trackRef', { static: true }) trackRef!: ElementRef<HTMLDivElement>;

  public items: GalleryItem[] = [];
  readonly selectedItem = signal<GalleryItem | null>(null);
  readonly activeIndex = signal<number>(0);

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
    this.items = this.dataService.galleryItems;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.animService.isReducedMotion()) return;

    this.initHorizontalScroll();
  }

  private initHorizontalScroll(): void {
    const track = this.trackRef.nativeElement;
    const section = this.sectionRef.nativeElement;

    // Calculate total horizontal distance to travel with safe margins
    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 180);

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: 'none'
    });

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.max(1800, (track.scrollWidth - window.innerWidth) * 1.5 + 400)}`,
      pin: true,
      animation: tween,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const total = this.items.length;
        const rawIdx = Math.round(p * (total - 1));
        const idx = Math.max(0, Math.min(total - 1, rawIdx));
        if (this.activeIndex() !== idx) {
          this.activeIndex.set(idx);
          this.soundService.playChime(420 + idx * 60, 'sine', 0.02, 0.3);
        }
      }
    });
  }

  public openItem(item: GalleryItem): void {
    this.soundService.playClick();
    this.selectedItem.set(item);
  }

  public closeItem(): void {
    this.soundService.playClick();
    this.selectedItem.set(null);
  }

  public onHover(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('drag', label);
  }

  public onLeave(): void {
    this.cursorService.resetCursor();
  }
}
