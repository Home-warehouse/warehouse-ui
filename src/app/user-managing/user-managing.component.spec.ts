import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagingComponent } from './user-managing.component';

describe('UserManagingComponent', () => {
  let component: UserManagingComponent;
  let fixture: ComponentFixture<UserManagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserManagingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
