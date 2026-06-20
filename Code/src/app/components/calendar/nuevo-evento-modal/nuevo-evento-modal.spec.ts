import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { NuevoEventoModal } from './nuevo-evento-modal';

describe('NuevoEventoModal (Pruebas Unitarias)', () => {
  let component: NuevoEventoModal;

  beforeEach(() => {
    component = new NuevoEventoModal();
  });

  it('HU-04: Marca error cuando se omiten campos obligatorios (nombre, descripción, teléfono)', () => {
    component.newEvent.title = '';
    component.newEvent.descripcion = '';
    component.newEvent.telefono = '';

    component.onSave();

    
    expect(component.createSubmitAttempted()).toBe(true);
    expect(component.localError()).toBe('Título, descripción y teléfono son obligatorios.');

    
    expect(component.isCreateFieldInvalid('title')).toBe(true);
    expect(component.isCreateFieldInvalid('telefono')).toBe(true);
  });

  it('HU-04: Permite guardar si los campos obligatorios están correctos', () => {
    let eventoEmitido: any = null;
    component.save.subscribe((data) => {
      eventoEmitido = data;
    });

    component.newEvent.title = 'Consulta Psicología';
    component.newEvent.descripcion = 'Primera sesión';
    component.newEvent.telefono = '3001234567'; 
    component.newEvent.start = '2023-10-10T10:00';
    component.newEvent.end = '2023-10-10T11:00';

    component.onSave();

    expect(component.localError()).toBeNull();
    expect(eventoEmitido).not.toBeNull();
    expect(eventoEmitido.title).toBe('Consulta Psicología');
  });

  it('HU-05: Emite error si la fecha fin es anterior a la fecha inicio', () => {
    component.newEvent.title = 'Consulta Psicología';
    component.newEvent.descripcion = 'Sesión';
    component.newEvent.telefono = '3001234567';
    component.newEvent.start = '2023-10-10T11:00';
    component.newEvent.end = '2023-10-10T10:00'; 

    component.onSave();

    expect(component.localError()).toBe('La hora de fin debe ser posterior a la hora de inicio.');
  });

  
});
