import { TestBed } from '@angular/core/testing';

import { GuidedTuning } from './guided-tuning';

describe('GuidedTuning', () => {
  let service: GuidedTuning;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuidedTuning);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
