import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatizationsListComponent } from './automatizations-list.component';

describe('AutomatizationsListComponent', () => {
  let component: AutomatizationsListComponent;
  let fixture: ComponentFixture<AutomatizationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomatizationsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomatizationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
