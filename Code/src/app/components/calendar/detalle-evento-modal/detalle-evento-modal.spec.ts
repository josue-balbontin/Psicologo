import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { DetalleEventoModal } from './detalle-evento-modal';

describe('DetalleEventoModal (Pruebas Unitarias)', () => {
  let component: DetalleEventoModal;

  beforeEach(() => {
    component = new DetalleEventoModal();
  });

  it('HU-06: Se  calcular correctamente el tiempo de sesión', () => {
    const inicio = '2023-10-10T10:00:00';
    const fin = '2023-10-10T11:30:00';
    
    const duracion = component.formatDuration(inicio, fin);
    
    expect(duracion).toBe('1 h 30 min');
  });

  it('HU-06:  Se manejan  minutos correctamente', () => {
    const inicio = '2023-10-10T10:00:00';
    const fin = '2023-10-10T10:45:00';
    
    const duracion = component.formatDuration(inicio, fin);
    
    
    expect(duracion).toBe('45 min');
  });

  it('HU-06:  Se manejan  horas correctamente', () => {
    const inicio = '2023-10-10T10:00:00';
    const fin = '2023-10-10T12:00:00';
    
    const duracion = component.formatDuration(inicio, fin);
    
    
    expect(duracion).toBe('2 h');
  });

  
});
