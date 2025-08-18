import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminmanagestoreComponent } from './adminmanagestore.component';

describe('AdminmanagestoreComponent', () => {
  let component: AdminmanagestoreComponent;
  let fixture: ComponentFixture<AdminmanagestoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminmanagestoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminmanagestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
