import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatizationFormComponent } from './automatization-form.component';

describe('AutomatizationFormComponent', () => {
  let component: AutomatizationFormComponent;
  let fixture: ComponentFixture<AutomatizationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomatizationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomatizationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
