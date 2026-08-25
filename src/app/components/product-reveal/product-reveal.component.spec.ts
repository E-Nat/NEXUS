import { TestBed } from '@angular/core/testing';
import { ProductRevealComponent } from './product-reveal.component';
import { DataService } from '../../services/data.service';
import { SoundService } from '../../services/sound.service';
import { CursorService } from '../../services/cursor.service';
import { AnimationService } from '../../services/animation.service';

describe('ProductRevealComponent - Scroll-driven card animation sequencing', () => {
  let component: ProductRevealComponent;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRevealComponent],
      providers: [
        DataService,
        SoundService,
        CursorService,
        AnimationService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductRevealComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    component.ngOnInit();
  });

  it('should have strictly ordered activeInFrames for cards 01, 02, 03, 04', () => {
    const labels = dataService.productRevealLabels;
    expect(labels.length).toBe(4);

    const card01 = labels.find(l => l.id === 'core');
    const card02 = labels.find(l => l.id === 'system');
    const card03 = labels.find(l => l.id === 'interface');
    const card04 = labels.find(l => l.id === 'material');

    expect(card01).toBeDefined();
    expect(card02).toBeDefined();
    expect(card03).toBeDefined();
    expect(card04).toBeDefined();

    expect(card01!.order).toBe(1);
    expect(card02!.order).toBe(2);
    expect(card03!.order).toBe(3);
    expect(card04!.order).toBe(4);

    expect(card01!.activeInFrames).toEqual([1, 2, 3, 4]);
    expect(card02!.activeInFrames).toEqual([2, 3, 4]);
    expect(card03!.activeInFrames).toEqual([3, 4]);
    expect(card04!.activeInFrames).toEqual([4]);
  });

  it('should map cardStatus strictly: hidden | active | completed from currentPhase', () => {
    const card01 = component.labels.find(l => l.id === 'core')!;
    const card02 = component.labels.find(l => l.id === 'system')!;
    const card03 = component.labels.find(l => l.id === 'interface')!;
    const card04 = component.labels.find(l => l.id === 'material')!;

    // currentPhase = 1 -> card01 active, card02/03/04 hidden
    component.currentPhase.set(1);
    expect(component.getCardStatus(card01)).toBe('active');
    expect(component.getCardStatus(card02)).toBe('hidden');
    expect(component.getCardStatus(card03)).toBe('hidden');
    expect(component.getCardStatus(card04)).toBe('hidden');

    // currentPhase = 2 -> card01 completed, card02 active, card03/04 hidden
    component.currentPhase.set(2);
    expect(component.getCardStatus(card01)).toBe('completed');
    expect(component.getCardStatus(card02)).toBe('active');
    expect(component.getCardStatus(card03)).toBe('hidden');
    expect(component.getCardStatus(card04)).toBe('hidden');

    // currentPhase = 3 -> card01 completed, card02 completed, card03 active, card04 hidden
    component.currentPhase.set(3);
    expect(component.getCardStatus(card01)).toBe('completed');
    expect(component.getCardStatus(card02)).toBe('completed');
    expect(component.getCardStatus(card03)).toBe('active');
    expect(component.getCardStatus(card04)).toBe('hidden');

    // currentPhase = 4 -> card01 completed, card02 completed, card03 completed, card04 active
    component.currentPhase.set(4);
    expect(component.getCardStatus(card01)).toBe('completed');
    expect(component.getCardStatus(card02)).toBe('completed');
    expect(component.getCardStatus(card03)).toBe('completed');
    expect(component.getCardStatus(card04)).toBe('active');
  });

  it('should log strictly in sequential order PHASE → 1..4 and CARD 01..04 → reveal', () => {
    const consoleSpy = spyOn(console, 'log');

    component.currentPhase.set(1);
    component.setPhase(4);

    expect(consoleSpy).toHaveBeenCalledWith('PHASE → 2');
    expect(consoleSpy).toHaveBeenCalledWith('CARD 02 → reveal');
    expect(consoleSpy).toHaveBeenCalledWith('PHASE → 3');
    expect(consoleSpy).toHaveBeenCalledWith('CARD 03 → reveal');
    expect(consoleSpy).toHaveBeenCalledWith('PHASE → 4');
    expect(consoleSpy).toHaveBeenCalledWith('CARD 04 → reveal');

    // Verify ordering in call arguments
    const logs = consoleSpy.calls.allArgs().map(a => a[0]);
    const phase2Idx = logs.indexOf('PHASE → 2');
    const card2Idx = logs.indexOf('CARD 02 → reveal');
    const phase3Idx = logs.indexOf('PHASE → 3');
    const card3Idx = logs.indexOf('CARD 03 → reveal');
    const phase4Idx = logs.indexOf('PHASE → 4');
    const card4Idx = logs.indexOf('CARD 04 → reveal');

    expect(phase2Idx).toBeLessThan(card2Idx);
    expect(card2Idx).toBeLessThan(phase3Idx);
    expect(phase3Idx).toBeLessThan(card3Idx);
    expect(card3Idx).toBeLessThan(phase4Idx);
    expect(phase4Idx).toBeLessThan(card4Idx);
  });

  it('should never allow Card 02 to be visible before Card 01', () => {
    const card01 = component.labels.find(l => l.id === 'core')!;
    const card02 = component.labels.find(l => l.id === 'system')!;

    for (let frame = 1; frame <= 4; frame++) {
      component.activeFrameIndex.set(frame);
      if (component.isLabelActive(card02)) {
        expect(component.isLabelActive(card01)).toBeTrue();
      }
    }
  });

  it('should reverse strictly: 04 -> 03 -> 02 -> 01 when scrolling upward', () => {
    const card01 = component.labels.find(l => l.id === 'core')!;
    const card02 = component.labels.find(l => l.id === 'system')!;
    const card03 = component.labels.find(l => l.id === 'interface')!;
    const card04 = component.labels.find(l => l.id === 'material')!;

    // Start at Phase 04
    component.activeFrameIndex.set(4);
    expect([card01, card02, card03, card04].map(c => component.isLabelActive(c))).toEqual([true, true, true, true]);

    // Scroll up to Phase 03 -> 04 exits
    component.activeFrameIndex.set(3);
    expect([card01, card02, card03, card04].map(c => component.isLabelActive(c))).toEqual([true, true, true, false]);

    // Scroll up to Phase 02 -> 03 exits
    component.activeFrameIndex.set(2);
    expect([card01, card02, card03, card04].map(c => component.isLabelActive(c))).toEqual([true, true, false, false]);

    // Scroll up to Phase 01 -> 02 exits
    component.activeFrameIndex.set(1);
    expect([card01, card02, card03, card04].map(c => component.isLabelActive(c))).toEqual([true, false, false, false]);
  });

  it('should handle simulated scroll progress correctly across slow, normal, fast, and reverse scrolls', () => {
    const getFrameForProgress = (p: number): number => {
      if (p >= 0.75) return 4;
      if (p >= 0.50) return 3;
      if (p >= 0.25) return 2;
      return 1;
    };

    const getActiveCardIds = (frame: number): string[] => {
      component.activeFrameIndex.set(frame);
      return component.labels.filter(l => component.isLabelActive(l)).map(l => l.id);
    };

    // Slow scroll forward
    const slowScrollValues = [0.0, 0.05, 0.12, 0.24, 0.26, 0.38, 0.49, 0.51, 0.65, 0.74, 0.76, 0.88, 1.0];
    let prevActiveCount = 0;
    for (const p of slowScrollValues) {
      const frame = getFrameForProgress(p);
      const activeIds = getActiveCardIds(frame);
      expect(activeIds.length).toBeGreaterThanOrEqual(prevActiveCount);
      prevActiveCount = activeIds.length;
    }

    // Fast scroll forward (jump straight from p=0.05 to p=0.8)
    const fastForwardFrame = getFrameForProgress(0.85);
    expect(fastForwardFrame).toBe(4);
    expect(getActiveCardIds(fastForwardFrame)).toEqual(['core', 'system', 'interface', 'material']);

    // Fast reverse scroll (jump straight from p=0.9 to p=0.1)
    const fastReverseFrame = getFrameForProgress(0.1);
    expect(fastReverseFrame).toBe(1);
    expect(getActiveCardIds(fastReverseFrame)).toEqual(['core']);

    // Normal reverse scroll
    const reverseScrollValues = [0.95, 0.70, 0.45, 0.15];
    const expectedSequences = [
      ['core', 'system', 'interface', 'material'],
      ['core', 'system', 'interface'],
      ['core', 'system'],
      ['core']
    ];
    reverseScrollValues.forEach((p, idx) => {
      const frame = getFrameForProgress(p);
      expect(getActiveCardIds(frame)).toEqual(expectedSequences[idx]);
    });
  });
});
