import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaportDisplayComponent } from './raport-display.component';

describe('RaportDisplayComponent', () => {
  let component: RaportDisplayComponent;
  let fixture: ComponentFixture<RaportDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaportDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaportDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
