import { TestBed } from '@angular/core/testing';

import { CustomColumnsService } from './custom-columns.service';

describe('CustomColumnsService', () => {
  let service: CustomColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomColumnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
