import { TestBed } from '@angular/core/testing';

import { AutomatizationsService } from './automatizations.service';

describe('AutomatizationsService', () => {
  let service: AutomatizationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomatizationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
