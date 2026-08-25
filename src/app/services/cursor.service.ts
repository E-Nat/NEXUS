import { Injectable, signal } from '@angular/core';

export type CursorState = 'default' | 'hover' | 'explore' | 'open' | 'drag' | 'view' | 'magnetic';

export interface CursorConfig {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: CursorState;
  text: string;
  isTouchDevice: boolean;
  isVisible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CursorService {
  readonly isTouchDevice = signal<boolean>(false);
  readonly cursorState = signal<CursorState>('default');
  readonly cursorText = signal<string>('');
  readonly isVisible = signal<boolean>(false);
  readonly isMagnetic = signal<boolean>(false);

  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;

  constructor() {
    this.checkTouchDevice();
    if (!this.isTouchDevice()) {
      this.initMouseListeners();
    }
  }

  private checkTouchDevice(): void {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.isTouchDevice.set(isTouch);
    }
  }

  private initMouseListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isVisible()) {
        this.isVisible.set(true);
      }
      this.targetX = e.clientX;
      this.targetY = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.isVisible.set(false);
    });

    document.addEventListener('mouseenter', () => {
      this.isVisible.set(true);
    });
  }

  public getTargetPosition(): { x: number; y: number } {
    return { x: this.targetX, y: this.targetY };
  }

  public setCursor(state: CursorState, text: string = ''): void {
    if (this.isTouchDevice()) return;
    this.cursorState.set(state);
    this.cursorText.set(text);
  }

  public resetCursor(): void {
    if (this.isTouchDevice()) return;
    this.cursorState.set('default');
    this.cursorText.set('');
    this.isMagnetic.set(false);
  }

  public setMagnetic(magnetic: boolean): void {
    if (this.isTouchDevice()) return;
    this.isMagnetic.set(magnetic);
  }
}
