import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogupdattiendaComponent } from './dialogupdattienda.component';

describe('DialogupdattiendaComponent', () => {
  let component: DialogupdattiendaComponent;
  let fixture: ComponentFixture<DialogupdattiendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogupdattiendaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogupdattiendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
