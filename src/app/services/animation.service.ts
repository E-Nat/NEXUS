import { Injectable } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  public isReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Animates numbers from 0 to target value with optional decimals and formatting
   */
  public animateCounter(
    element: HTMLElement,
    targetValue: number,
    options?: {
      duration?: number;
      decimals?: number;
      suffix?: string;
      prefix?: string;
      scrollTrigger?: ScrollTrigger.Vars;
    }
  ): gsap.core.Tween {
    if (this.isReducedMotion()) {
      const decimals = options?.decimals ?? 0;
      const prefix = options?.prefix ?? '';
      const suffix = options?.suffix ?? '';
      element.innerText = `${prefix}${targetValue.toFixed(decimals)}${suffix}`;
      return gsap.to(element, { opacity: 1, duration: 0.1 });
    }

    const obj = { val: 0 };
    const decimals = options?.decimals ?? (targetValue % 1 === 0 ? 0 : 1);
    const prefix = options?.prefix ?? '';
    const suffix = options?.suffix ?? '';

    return gsap.to(obj, {
      val: targetValue,
      duration: options?.duration ?? 2.2,
      ease: 'power3.out',
      scrollTrigger: options?.scrollTrigger,
      onUpdate: () => {
        element.innerText = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
      }
    });
  }

  /**
   * Word-by-word and blur-to-sharp text reveal
   */
  public revealWords(
    container: HTMLElement,
    options?: {
      stagger?: number;
      duration?: number;
      delay?: number;
      scrollTrigger?: ScrollTrigger.Vars;
    }
  ): gsap.core.Timeline {
    const tl = gsap.timeline({
      scrollTrigger: options?.scrollTrigger,
      delay: options?.delay ?? 0
    });

    if (this.isReducedMotion()) {
      tl.to(container, { opacity: 1, duration: 0.3 });
      return tl;
    }

    const words = container.querySelectorAll('.word-wrap, .char-wrap');
    if (words.length === 0) {
      tl.fromTo(container,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: options?.duration ?? 1.2, ease: 'power3.out' }
      );
    } else {
      tl.fromTo(words,
        { opacity: 0, y: 36, filter: 'blur(8px)', rotateX: 20 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: options?.duration ?? 1.1,
          stagger: options?.stagger ?? 0.04,
          ease: 'power3.out'
        }
      );
    }

    return tl;
  }

  /**
   * Subtle 3D Magnetic Physics on elements
   */
  public applyMagnetic(element: HTMLElement, strength = 0.35): () => void {
    if (this.isReducedMotion()) return () => {};

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(element, {
        x: relX * strength,
        y: relY * strength,
        rotateX: -relY * 0.05,
        rotateY: relX * 0.05,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const mouseLeaveHandler = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto'
      });
    };

    element.addEventListener('mousemove', mouseMoveHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      element.removeEventListener('mousemove', mouseMoveHandler);
      element.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }
}
