import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CursorService } from '../../services/cursor.service';

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-cursor.component.html',
  styleUrls: ['./custom-cursor.component.scss']
})
export class CustomCursorComponent implements OnInit, OnDestroy {
  @ViewChild('cursorDot', { static: true }) dotRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cursorFollower', { static: true }) followerRef!: ElementRef<HTMLDivElement>;

  private dotX = 0;
  private dotY = 0;
  private followerX = 0;
  private followerY = 0;
  private animFrameId: number | null = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    public cursorService: CursorService,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser || this.cursorService.isTouchDevice()) return;

    this.startCursorLoop();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private startCursorLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        const target = this.cursorService.getTargetPosition();

        // Dot follows immediately with minimal lag
        this.dotX += (target.x - this.dotX) * 0.7;
        this.dotY += (target.y - this.dotY) * 0.7;

        // Follower ring follows with smooth spring / lerp
        this.followerX += (target.x - this.followerX) * 0.18;
        this.followerY += (target.y - this.followerY) * 0.18;

        if (this.dotRef?.nativeElement) {
          this.dotRef.nativeElement.style.transform = `translate3d(${this.dotX}px, ${this.dotY}px, 0)`;
        }

        if (this.followerRef?.nativeElement) {
          this.followerRef.nativeElement.style.transform = `translate3d(${this.followerX}px, ${this.followerY}px, 0)`;
        }

        this.animFrameId = requestAnimationFrame(loop);
      };

      this.animFrameId = requestAnimationFrame(loop);
    });
  }
}
