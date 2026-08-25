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
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SoundService } from '../../services/sound.service';
import { CursorService } from '../../services/cursor.service';
import { ScrollService } from '../../services/scroll.service';
import { AnimationService } from '../../services/animation.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-final-cta-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './final-cta-section.component.html',
  styleUrls: ['./final-cta-section.component.scss']
})
export class FinalCtaSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('ctaSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('enterBtn', { static: true }) enterBtnRef!: ElementRef<HTMLButtonElement>;

  readonly isModalOpen = signal<boolean>(false);
  readonly isSubmitted = signal<boolean>(false);
  readonly selectedEdition = signal<string>('obsidian');
  readonly currentTimeUtc = signal<string>('');

  public name = '';
  public email = '';
  public allocationNumber = Math.floor(1000 + Math.random() * 9000);

  private isBrowser: boolean;
  private timerId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    public soundService: SoundService,
    public cursorService: CursorService,
    public scrollService: ScrollService,
    private animService: AnimationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.updateUtcTime();
      this.timerId = window.setInterval(() => this.updateUtcTime(), 1000);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.animService.isReducedMotion()) return;

    this.initCtaAnimations();
    if (this.enterBtnRef?.nativeElement) {
      this.animService.applyMagnetic(this.enterBtnRef.nativeElement, 0.4);
    }
  }

  private updateUtcTime(): void {
    const now = new Date();
    this.currentTimeUtc.set(now.toUTCString().split(' ')[4] + ' UTC');
  }

  private initCtaAnimations(): void {
    const el = this.sectionRef.nativeElement;

    gsap.fromTo(el.querySelectorAll('.cta-reveal'),
      { y: 60, opacity: 0, filter: 'blur(10px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.3,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  public openReservationModal(): void {
    this.soundService.playClick();
    this.isModalOpen.set(true);
    this.isSubmitted.set(false);
  }

  public closeReservationModal(): void {
    this.soundService.playClick();
    this.isModalOpen.set(false);
  }

  public selectEdition(edition: string): void {
    this.soundService.playClick();
    this.selectedEdition.set(edition);
  }

  public submitReservation(): void {
    if (!this.email) return;
    this.soundService.playChime(720, 'triangle', 0.08, 0.5);
    this.isSubmitted.set(true);
  }

  public scrollToTop(): void {
    this.soundService.playClick();
    this.scrollService.scrollTo(0, { duration: 1.8 });
  }

  public onHover(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('open', label);
  }

  public onLeave(): void {
    this.cursorService.resetCursor();
  }
}
