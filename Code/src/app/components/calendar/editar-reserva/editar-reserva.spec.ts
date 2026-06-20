import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditarReserva } from './editar-reserva';
import { signal } from '@angular/core';

describe('EditarReserva (Pruebas Unitarias)', () => {
  let component: EditarReserva;
  let mockSupabaseService: any;

  beforeEach(() => {
    mockSupabaseService = {
      existeSuperposicion: vi.fn(),
      actualizar: vi.fn(),
    };


    component = Object.create(EditarReserva.prototype);
    component['supabaseService'] = mockSupabaseService;
    component.reserva = {
      id: 1,
      nombre: 'Juan',
      descripcion: 'Terapia',
      telefono: '3001234567',
      correo: 'juan@test.com',
      pais: 'Col',
      dia: '2023-10-10',
      hora_inicio: '10:00:00',
      hora_final: '11:00:00',
      precio: 100
    } as any;
    
    component.guardado = { emit: vi.fn() } as any;
    component.cancelado = { emit: vi.fn() } as any;
    component.isLoading = signal(false);
    component.errorMsg = signal<string | null>(null);
    component.submitAttempted = signal(false);

    component.ngOnInit();
  });

  it('HU-07: Inicializa el formulario correctamente con los datos de la reserva', () => {
    expect(component.form.nombre).toBe('Juan');
    expect(component.form.start).toBe('2023-10-10T10:00');
    expect(component.form.precio).toBe('100');
  });

  

  it('HU-07: Muestra error si se ingresan campos obligatorios vacíos', async () => {
    component.form.nombre = '';
    await component.guardar();

    expect(component.errorMsg()).toBe('Nombre, descripción y teléfono son obligatorios.');
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled();
  });

  it('HU-09: Frena la acción y advierte "Valor monetario inválido" si el precio tiene letras o es negativo', async () => {

    component.form.precio = 'abc';
    await component.guardar();
    expect(component.errorMsg()).toBe('Valor monetario inválido');
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled();


    component.errorMsg.set(null);

  
    component.form.precio = -50;
    await component.guardar();
    expect(component.errorMsg()).toBe('Valor monetario inválido');
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled();
  });

  it('HU-07: Bloquea la actualización si el correo tiene un formato inválido (ej. sin @)', async () => {
   
    component.form.correo = 'correos.com';
    
    await component.guardar();

    expect(component.errorMsg()).toBe('Formato de correo inválido');
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled();
  });

  it('HU-05: El sistema rechaza la edición si el nuevo horario está ocupado ', async () => {
    mockSupabaseService.existeSuperposicion.mockResolvedValue(true);

  
    component.form.start = '2023-10-10T11:00';
    component.form.end = '2023-10-10T12:00';

    await component.guardar();

    expect(mockSupabaseService.existeSuperposicion).toHaveBeenCalled();
    expect(component.errorMsg()).toBe('El horario se superpone con otra reserva existente.');
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled(); 
  });

  it('HU-05: El sistema rechaza la edición si se intenta terminar antes de empezar', async () => {
    component.form.start = '2023-10-10T11:00';
    component.form.end = '2023-10-10T10:00'; 

    await component.guardar();

    expect(component.errorMsg()).toBe('La hora de fin debe ser posterior a la de inicio.');
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled();
  });
});
