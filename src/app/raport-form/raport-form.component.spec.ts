import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaportFormComponent } from './raport-form.component';

describe('RaportFormComponent', () => {
  let component: RaportFormComponent;
  let fixture: ComponentFixture<RaportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaportFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
