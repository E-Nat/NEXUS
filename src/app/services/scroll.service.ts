import { Injectable, signal, NgZone } from '@angular/core';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private lenis: Lenis | null = null;
  readonly scrollProgress = signal<number>(0);
  readonly scrollY = signal<number>(0);
  readonly isScrolling = signal<boolean>(false);
  readonly activeSection = signal<string>('hero');

  private tickerCallback: ((time: number) => void) | null = null;

  constructor(private ngZone: NgZone) {}

  public initSmoothScroll(): void {
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      // Synchronize Lenis with GSAP ScrollTrigger
      this.lenis.on('scroll', (e: { scroll: number; progress: number; velocity: number }) => {
        ScrollTrigger.update();
        this.scrollY.set(e.scroll);
        this.scrollProgress.set(e.progress);
        this.isScrolling.set(Math.abs(e.velocity) > 0.1);
      });

      this.tickerCallback = (time: number) => {
        this.lenis?.raf(time * 1000);
      };

      gsap.ticker.add(this.tickerCallback);
      gsap.ticker.lagSmoothing(0);
    });
  }

  public scrollTo(target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }): void {
    if (this.lenis) {
      this.lenis.scrollTo(target, {
        offset: options?.offset ?? 0,
        duration: options?.duration ?? 1.4,
        immediate: options?.immediate ?? false,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  public stop(): void {
    this.lenis?.stop();
  }

  public start(): void {
    this.lenis?.start();
  }

  public refresh(): void {
    ScrollTrigger.refresh();
  }

  public destroy(): void {
    if (this.tickerCallback) {
      gsap.ticker.remove(this.tickerCallback);
    }
    this.lenis?.destroy();
    this.lenis = null;
  }
}
