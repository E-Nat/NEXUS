import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetail } from '../../../models/product-reveal.model';
import { SoundService } from '../../../services/sound.service';
import { CursorService } from '../../../services/cursor.service';

@Component({
  selector: 'app-product-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-label.component.html',
  styleUrls: ['./product-label.component.scss']
})
export class ProductLabelComponent {
  @Input({ required: true }) detail!: ProductDetail;
  @Input() active = false;
  @Input() isMobile = false;

  @Output() select = new EventEmitter<ProductDetail>();

  constructor(
    private soundService: SoundService,
    private cursorService: CursorService
  ) {}

  public onMouseEnter(): void {
    this.soundService.playHover();
    this.cursorService.setCursor('hover', this.detail.label);
  }

  public onMouseLeave(): void {
    this.cursorService.resetCursor();
  }

  public onClick(): void {
    this.soundService.playClick();
    this.select.emit(this.detail);
  }
}
