import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CalendarComponent } from './components/calendar/calendar.component';
import { SupabaseService } from './services/supabase/supabase';
import { TestBed } from '@angular/core/testing';
import { DayPilotModule, DayPilot } from '@daypilot/daypilot-lite-angular';

describe('Criterios de Aceptación (Implementados)', () => {
  let component: CalendarComponent;
  let mockSupabase: any;

  beforeEach(async () => {
    mockSupabase = {
      existeSuperposicion: vi.fn().mockResolvedValue(false),
      guardar: vi.fn().mockResolvedValue({ id: 1 }),
      cargar: vi.fn().mockResolvedValue([]),
      eliminar: vi.fn().mockResolvedValue(undefined),
      actualizar: vi.fn().mockResolvedValue({ id: 1 })
    };

    await TestBed.configureTestingModule({
      imports: [CalendarComponent, DayPilotModule],
      providers: [{ provide: SupabaseService, useValue: mockSupabase }]
    }).compileComponents();

    const fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    
    // Mocks manuales para evitar errores de renderizado de DayPilot en entorno de Test JS DOM
    component.calendar = { control: { update: vi.fn(), clearSelection: vi.fn() } } as any;
    component.monthCalendar = { control: { update: vi.fn(), clearSelection: vi.fn() } } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HU-02: Visualizar agenda semanal', () => {
    it('(Válido) Dado que inicio sesión exitosamente, cuando carga la pantalla principal, entonces veo un calendario configurado en formato de 7 días con el mes y el año claramente visibles en la cabecera.', () => {
      // Validamos que por defecto se inicie la vista 'Week'
      expect(component.currentView()).toBe('Week');
      expect(component.calendarConfig.viewType).toBe('Week');
      
      // Validamos que se extraiga correctamente un string de título para la cabecera
      const title = component.headerTitle;
      expect(title).toBeDefined();
      expect(typeof title).toBe('string');
    });
  });

  describe('HU-04: Agregar nueva consulta', () => {
    it('(Válido) Dado que selecciono un espacio libre en la agenda, cuando completo el formulario de agendamiento y guardo, entonces la cita aparece correctamente en el calendario.', async () => {
      // Simula acción de seleccionar en el calendario (1 hr block)
      component.openNewEventModal('2026-05-15T09:00', '2026-05-15T10:00');
      
      // Rellena formulario
      component.newEvent = { 
        ...component.newEvent, 
        title: 'Paciente Test', 
        descripcion: 'Terapia 1', 
        telefono: '12345678', 
        precio: '50' 
      };
      
      await component.saveEvent();
      
      // Debe haber intentado guardar en supabase con éxito y cerrado el modal
      expect(mockSupabase.guardar).toHaveBeenCalledTimes(1);
      expect(component.showEventModal()).toBe(false);
    });

    it('(Inválido 1) Dado que intento guardar una consulta omitiendo campos obligatorios, cuando presiono "Guardar", entonces el sistema marca error y no me deja continuar.', async () => {
      component.openNewEventModal('2026-05-15T09:00', '2026-05-15T10:00');
      component.newEvent.title = ''; // Falta título obligatorio
      
      await component.saveEvent();
      
      // Debe mostrar error modal y no guardar
      expect(component.modalError()).toBe('Título, descripción y teléfono son obligatorios.');
      expect(mockSupabase.guardar).not.toHaveBeenCalled();
    });
  });

  describe('HU-05: Validar superposición de horarios', () => {
    it('(Inválido 1) Dado que intento crear una nueva cita en una hora donde ya tengo un paciente, el sistema bloquea la acción y muestra "Horario no disponible" (superposición).', async () => {
      // Mock para simular que existe en la DB ese horario
      mockSupabase.existeSuperposicion.mockResolvedValueOnce(true);
      
      component.openNewEventModal('2026-05-15T09:00', '2026-05-15T10:00');
      component.newEvent = { 
        ...component.newEvent, 
        title: 'Paciente 2', 
        descripcion: 'Terapia 2', 
        telefono: '12345678' 
      };
      
      await component.saveEvent();
      
      expect(component.modalError()).toBe('El horario se superpone con una reserva existente.');
      expect(mockSupabase.guardar).not.toHaveBeenCalled();
    });

    it('(Inválido 2) Dado que intento editar la hora de una cita moviéndola a un bloque ocupado, el sistema rechaza la edición y revierte la vista.', async () => {
      const cargarSpy = vi.spyOn(component, 'cargarReservas').mockResolvedValue();
      (component as any)['events'] = [
        { id: '1', start: '2026-05-15T09:00:00', end: '2026-05-15T10:00:00' },
        { id: '2', start: '2026-05-15T10:00:00', end: '2026-05-15T11:00:00' },
      ];

      const fakeEvent = {
        id: () => '2',
        start: () => ({ toString: () => '2026-05-15T09:30:00' }),
        end: () => ({ toString: () => '2026-05-15T10:30:00' }),
      } as any;

      await component.updateEvent(fakeEvent);

      expect(component.errorMsg()).toBe('No se puede mover: el horario se superpone con una reserva existente.');
      expect(cargarSpy).toHaveBeenCalled();
    });
  });

  describe('HU-06: Ver detalles de consulta', () => {
    it('(Válido) Dado que hay un bloque ocupado, cuando hago clic sobre él, entonces se abre el panel de detalles.', () => {
      const fakeEvent = { data: { text: 'Paciente' } } as any;

      component.showEventDetail.set(false);
      component.selectedEvent = null;

      component.calendarConfig.onEventClick?.({ e: fakeEvent } as any);

      expect(component.selectedEvent).toBe(fakeEvent);
      expect(component.showEventDetail()).toBe(true);
    });
  });

  describe('HU-08: Cancelar consulta', () => {
    it('(Válido) Dado que abro una cita existente, cuando presiono "Cancelar Cita" y confirmo, entonces el bloque desaparece y se vuelve espacio disponible.', async () => {
      // Simula evento seleccionado
      component.selectedEvent = { id: () => '99' } as DayPilot.Event;
      
      await component.deleteSelectedEvent();
      
      // Llama a borrar, luego recarga reservas y limpia selección
      expect(mockSupabase.eliminar).toHaveBeenCalledWith(99);
      expect(mockSupabase.cargar).toHaveBeenCalled();
      expect(component.selectedEvent).toBeNull();
    });
  });

  describe('HU-09: Precio de la consulta', () => {
    it('(Inválido 1) Dado que ingreso un valor negativo o letras en precio, cuando intento guardar, entonces el sistema advierte de "Valor monetario inválido".', async () => {
      component.openNewEventModal('2026-05-15T09:00', '2026-05-15T10:00');
      component.newEvent = { 
        ...component.newEvent, 
        title: 'A', 
        descripcion: 'B', 
        telefono: '12345678', 
        precio: 'abc' // Letras inválidas
      };
      
      await component.saveEvent();
      
      expect(component.modalError()).toBe('El precio debe ser un número válido.');
      expect(mockSupabase.guardar).not.toHaveBeenCalled();
    });
  });

  describe('HU-10: Navegación del calendario', () => {
    it('(Válido) Dado que navego por la interfaz, cuando presiono "Ir a Hoy" salta automáticamente a la semana/fecha en curso.', () => {
      // Me muevo a una fecha pasada en el estado
      const pastDate = DayPilot.Date.today().addDays(-30);
      component.selectedDate.set(pastDate);
      
      component.goToday();
      
      // Verificamos que volvimos a la fecha de hoy
      expect(component.selectedDate().toString()).toBe(DayPilot.Date.today().toString());
    });

    it('(Válido) Dado que estoy en la vista semanal, cuando presiono "Siguiente Semana", entonces el calendario avanza 7 días.', () => {
      const baseDate = DayPilot.Date.today();
      const baseDateStr = baseDate.toString();

      component.currentView.set('Week');
      component.selectedDate.set(baseDate);
      component.navigate(1);

      const diffMs = new Date(component.selectedDate().toString()).getTime() - new Date(baseDateStr).getTime();
      expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

});