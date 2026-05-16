import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarReserva } from './editar-reserva';
import { Reserva } from '../../../models/reserva.model';
import { SupabaseService } from '../../../services/supabase/supabase';

describe('EditarReserva', () => {
  let component: EditarReserva;
  let fixture: ComponentFixture<EditarReserva>;

  beforeEach(async () => {
    const mockSupabase = {
      actualizar: async () => ({}),
      existeSuperposicion: async () => false,
    };

    await TestBed.configureTestingModule({
      imports: [EditarReserva],
      providers: [{ provide: SupabaseService, useValue: mockSupabase }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarReserva);
    component = fixture.componentInstance;
    component.reserva = {
      id: 1,
      nombre: 'Paciente Test',
      descripcion: 'Consulta inicial',
      telefono: '12345678',
      correo: 'test@example.com',
      pais: 'Bolivia',
      precio: 120,
      dia: '2026-05-15',
      hora_inicio: '09:00:00',
      hora_final: '10:00:00',
    } as Reserva;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
