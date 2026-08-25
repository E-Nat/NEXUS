import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-film-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './film-modal.component.html',
  styleUrls: ['./film-modal.component.scss']
})
export class FilmModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  readonly isPlaying = signal<boolean>(true);
  readonly currentTime = signal<number>(0);
  readonly currentAct = signal<string>('ACT 01 // QUANTUM SINGULARITY');

  private intervalId: number | null = null;

  constructor(public soundService: SoundService) {}

  ngOnInit(): void {
    this.soundService.playChime(440, 'triangle', 0.06, 0.4);
    this.startPlayback();
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }

  private startPlayback(): void {
    const acts = [
      'ACT 01 // QUANTUM SINGULARITY EMERGENCE',
      'ACT 02 // SUB-MICRON RETINAL WAVEFRONT LATTICE',
      'ACT 03 // NEURAL SYNAPSE ZERO-LATENCY SYNCHRONIZATION',
      'ACT 04 // INFINITE SPATIAL CONTINUUM'
    ];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying()) return;
      const nextTime = this.currentTime() + 1;
      this.currentTime.set(nextTime % 30);
      const actIdx = Math.min(Math.floor((this.currentTime() / 30) * acts.length), acts.length - 1);
      this.currentAct.set(acts[actIdx]);
    }, 1000);
  }

  public togglePlay(): void {
    this.soundService.playClick();
    this.isPlaying.set(!this.isPlaying());
  }

  public onClose(): void {
    this.soundService.playClick();
    this.close.emit();
  }
}
