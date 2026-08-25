import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  signal,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollService } from './services/scroll.service';
import { SoundService } from './services/sound.service';
import { CursorService } from './services/cursor.service';
import { CustomCursorComponent } from './components/custom-cursor/custom-cursor.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThreeSceneComponent } from './components/three-scene/three-scene.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ProductRevealComponent } from './components/product-reveal/product-reveal.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { SpecsSectionComponent } from './components/specs-section/specs-section.component';
import { GallerySectionComponent } from './components/gallery-section/gallery-section.component';
import { FinalCtaSectionComponent } from './components/final-cta-section/final-cta-section.component';
import { FilmModalComponent } from './components/film-modal/film-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CustomCursorComponent,
    PreloaderComponent,
    NavbarComponent,
    ThreeSceneComponent,
    HeroSectionComponent,
    ProductRevealComponent,
    FeaturesSectionComponent,
    SpecsSectionComponent,
    GallerySectionComponent,
    FinalCtaSectionComponent,
    FilmModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSectionComponent?: HeroSectionComponent;
  @ViewChild('threeScene') threeSceneComponent?: ThreeSceneComponent;
  @ViewChild('finalCta') finalCtaComponent?: FinalCtaSectionComponent;

  readonly isPreloaded = signal<boolean>(false);
  readonly isFilmModalOpen = signal<boolean>(false);

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private scrollService: ScrollService,
    private soundService: SoundService,
    public cursorService: CursorService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.scrollService.initSmoothScroll();
    }
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.scrollService.destroy();
    }
  }

  public onPreloaderComplete(): void {
    this.isPreloaded.set(true);
    // Play initial ambient entrance chime
    this.soundService.playChime(520, 'sine', 0.05, 0.6);
    setTimeout(() => {
      this.heroSectionComponent?.triggerEntrance();
      this.scrollService.refresh();
    }, 150);
  }

  public onExplore(): void {
    this.scrollService.scrollTo('#product-reveal-section');
  }

  public onProductModeChange(mode: 'default' | 'exploded' | 'thermal'): void {
    this.threeSceneComponent?.setMode(mode);
  }

  public onFeatureThemeChange(theme: 'cyan' | 'violet' | 'emerald'): void {
    this.threeSceneComponent?.setFeatureTheme(theme);
  }

  public onOpenReserveModal(): void {
    this.finalCtaComponent?.openReservationModal();
  }

  public onOpenFilmModal(): void {
    this.isFilmModalOpen.set(true);
  }

  public onCloseFilmModal(): void {
    this.isFilmModalOpen.set(false);
  }
}
