import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsManagerComponent } from './locations-manager.component';

describe('LocationsManagerComponent', () => {
  let component: LocationsManagerComponent;
  let fixture: ComponentFixture<LocationsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationsManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
