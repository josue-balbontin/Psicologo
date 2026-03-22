import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarReserva } from './editar-reserva';

describe('EditarReserva', () => {
  let component: EditarReserva;
  let fixture: ComponentFixture<EditarReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarReserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
