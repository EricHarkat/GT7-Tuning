import { TestBed } from '@angular/core/testing';

import { TuningAnalysis } from './tuning-analysis';

describe('TuningAnalysis', () => {
  let service: TuningAnalysis;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuningAnalysis);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
