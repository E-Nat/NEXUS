import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  @ViewChild('preloaderWrap', { static: true }) preloaderWrap!: ElementRef<HTMLDivElement>;

  public percent = 0;
  public statusText = 'INITIALIZING QUANTUM CORE...';
  public isDone = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.complete.emit();
      return;
    }
    this.startPreloadSequence();
  }

  private startPreloadSequence(): void {
    const statuses = [
      'INITIALIZING QUANTUM CORE...',
      'CALIBRATING RETINAL WAVEFRONT MATRIX...',
      'ESTABLISHING HYPER-MESH INTERCONNECT...',
      'SYNCHRONIZING TENSOR ENGINE...',
      'SYSTEM ONLINE.'
    ];

    const counterObj = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        this.finishPreloader();
      }
    });

    // Step 1: Counter and status progress
    tl.to(counterObj, {
      value: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.percent = Math.floor(counterObj.value);
        const statusIdx = Math.min(
          Math.floor((this.percent / 100) * statuses.length),
          statuses.length - 1
        );
        this.statusText = statuses[statusIdx];
      }
    });

    // Step 2: NEXUS letters stagger reveal
    tl.fromTo('.pre-char',
      { y: 60, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.08, ease: 'power4.out' },
      '-=1.4'
    );

    // Step 3: Subtitle reveal
    tl.fromTo('.pre-subtitle',
      { y: 20, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
      '-=0.7'
    );

    // Step 4: Short pause
    tl.to({}, { duration: 0.3 });

    // Step 5: Curtain reveal up
    tl.to(this.preloaderWrap.nativeElement, {
      yPercent: -100,
      duration: 1.1,
      ease: 'expo.inOut'
    });
  }

  private finishPreloader(): void {
    this.isDone = true;
    this.complete.emit();
  }
}
