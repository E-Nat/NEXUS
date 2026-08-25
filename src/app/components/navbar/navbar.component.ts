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
  readonly activeSection = signal<string>('hero');

  public navItems = [
    { label: 'OVERVIEW', target: '#hero-section' },
    { label: 'PRODUCT', target: '#product-section' },
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
    this.isScrolled.set(window.scrollY > 40);

    // Section spy
    const sections = ['gallery-section', 'specs-section', 'features-section', 'product-section', 'hero-section'];
    const scrollPos = window.scrollY + 200;

    for (const secId of sections) {
      const el = document.getElementById(secId);
      if (el && el.offsetTop <= scrollPos) {
        this.activeSection.set(secId.replace('-section', ''));
        break;
      }
    }
  }

  public navigateTo(target: string): void {
    this.soundService.playClick();
    this.isMobileMenuOpen.set(false);
    this.scrollService.scrollTo(target, { offset: -40 });
  }

  public toggleSound(): void {
    this.soundService.toggleMute();
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
