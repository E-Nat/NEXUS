import {
  Component,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../services/scroll.service';
import { SoundService } from '../../services/sound.service';
import { CursorService } from '../../services/cursor.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() reserveClick = new EventEmitter<void>();

  readonly isScrolled = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly activeTarget = signal<string>('#hero-section');

  public navItems = [
    { label: 'OVERVIEW', target: '#hero-section' },
    { label: 'PRODUCT', target: '#product-reveal-section' },
    { label: 'FEATURES', target: '#features-section' },
    { label: 'SPECS', target: '#specs-section' },
    { label: 'GALLERY', target: '#gallery-section' }
  ];

  constructor(
    public scrollService: ScrollService,
    public soundService: SoundService,
    public cursorService: CursorService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.checkScroll();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    if (typeof window === 'undefined') return;
    this.isScrolled.set(window.scrollY > 30);

    // If near top of page, OVERVIEW is active
    if (window.scrollY < 120) {
      this.activeTarget.set('#hero-section');
      return;
    }

    // If near bottom of page, GALLERY is active
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
      this.activeTarget.set('#gallery-section');
      return;
    }

    const sections = [
      { id: 'gallery-section', target: '#gallery-section' },
      { id: 'specs-section', target: '#specs-section' },
      { id: 'features-section', target: '#features-section' },
      { id: 'product-reveal-section', target: '#product-reveal-section' },
      { id: 'hero-section', target: '#hero-section' }
    ];

    const probeY = window.scrollY + 200;

    for (const sec of sections) {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        if (top <= probeY) {
          this.activeTarget.set(sec.target);
          break;
        }
      }
    }
  }

  public navigateTo(target: string): void {
    this.soundService.playClick();
    this.isMobileMenuOpen.set(false);
    this.activeTarget.set(target);
    this.scrollService.scrollTo(target, { offset: -70 });
  }

  public toggleMobileMenu(): void {
    this.soundService.playClick();
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  public onReserve(): void {
    this.soundService.playClick();
    this.isMobileMenuOpen.set(false);
    this.reserveClick.emit();
  }

  public onHoverLink(label: string): void {
    this.soundService.playHover();
    this.cursorService.setCursor('hover', label);
  }

  public onLeaveLink(): void {
    this.cursorService.resetCursor();
  }
}
