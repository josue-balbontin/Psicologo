import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarComponent } from './calendar.component';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { signal } from '@angular/core';

describe('Componente Calendar', () => {
  let cmp: any;
  let mockSupabaseService: any;

  beforeEach(() => {
    mockSupabaseService = {
      cargar: vi.fn().mockResolvedValue([]),
      existeSuperposicion: vi.fn(),
      guardar: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn(),
    };

    cmp = Object.create(CalendarComponent.prototype);
    cmp['supabaseService'] = mockSupabaseService;
    
    
    cmp.currentView = signal('Week');
    cmp.selectedDate = signal(DayPilot.Date.today());
    cmp.isLoading = signal(false);
    cmp.isSavingEvent = signal(false);
    cmp.errorMsg = signal<string | null>(null);
    cmp.modalError = signal<string | null>(null);
    cmp.showEventModal = signal(false);
    cmp.showEventDetail = signal(false);
    cmp.newEventStart = signal('');
    cmp.newEventEnd = signal('');
    
    
    cmp.updateCalendarDate = vi.fn();
    cmp.cargarReservas = CalendarComponent.prototype.cargarReservas;
    cmp.onSaveNewEvent = CalendarComponent.prototype.onSaveNewEvent;
    cmp.onDeleteEvent = CalendarComponent.prototype.onDeleteEvent;
    cmp.hasOverlap = CalendarComponent.prototype['hasOverlap'];
    cmp.parsePrecio = CalendarComponent.prototype['parsePrecio'];
    cmp.formatTimeForDb = CalendarComponent.prototype['formatTimeForDb'];
    cmp.reservaToEvent = vi.fn();
    cmp.loadEvents = vi.fn();

    
    cmp['events'] = [];
  });


  it('HU-10: Puede navegar a la siguiente semana', () => {
    const initDate = DayPilot.Date.today();
    cmp.selectedDate = signal(initDate);
    cmp.navigate = CalendarComponent.prototype.navigate;
    
    cmp.navigate(1);
    
    expect(cmp.selectedDate().toString()).toBe(initDate.addDays(7).toString());
    expect(cmp.updateCalendarDate).toHaveBeenCalledWith(cmp.selectedDate());
  });

  it('HU-10: Puede navegar a Hoy', () => {
    cmp.selectedDate = signal(DayPilot.Date.today().addDays(14));
    cmp.goToday = CalendarComponent.prototype.goToday;
    
    cmp.goToday();
    
    expect(cmp.selectedDate().toString()).toBe(DayPilot.Date.today().toString());
    expect(cmp.updateCalendarDate).toHaveBeenCalledWith(cmp.selectedDate());
  });

  it('HU-04: Guarda la reserva si los datos son correctos y no hay overlap', async () => {
    mockSupabaseService.existeSuperposicion.mockResolvedValue(false);
    cmp['events'] = []; 

    const eventData = {
      title: 'Prueba',
      descripcion: 'Desc',
      telefono: '3001234567',
      correo: 'test@test.com',
      pais: 'Col',
      precio: '100',
      start: '2023-10-10T10:00',
      end: '2023-10-10T11:00'
    };

    await cmp.onSaveNewEvent(eventData);

    expect(mockSupabaseService.existeSuperposicion).toHaveBeenCalled();
    expect(mockSupabaseService.guardar).toHaveBeenCalled();
  
    expect(mockSupabaseService.cargar).toHaveBeenCalled();
    expect(cmp.showEventModal()).toBe(false);
  });

  

  it('HU-08: Puede cancelar y borrar un evento desde el calendario', async () => {
    cmp.selectedEvent = { id: () => '5' } as any;

    await cmp.onDeleteEvent();

    expect(mockSupabaseService.eliminar).toHaveBeenCalledWith(5);
    expect(mockSupabaseService.cargar).toHaveBeenCalled();
    expect(cmp.showEventDetail()).toBe(false);
    expect(cmp.selectedEvent).toBeNull();
  });

  it('HU-02: Se muestra el título correcto en vista de Mes', () => {
    cmp.selectedDate = signal(new DayPilot.Date('2023-10-15T00:00:00'));
    cmp.currentView = signal('Month');
    const titleDescriptor = Object.getOwnPropertyDescriptor(CalendarComponent.prototype, 'headerTitle');
    const title = titleDescriptor?.get?.call(cmp);
    expect(title).toContain('octubre'); 
    expect(title).toContain('2023');
  });



  it('HU-02: switchView cambia la vista y la configuración del calendario', () => {
    cmp.calendarConfig = { viewType: 'Week' };
    cmp.monthConfig = {};
    cmp.switchView = CalendarComponent.prototype.switchView;

    vi.useFakeTimers();
    cmp.switchView('Day');
    expect(cmp.currentView()).toBe('Day');
    expect(cmp.calendarConfig.viewType).toBe('Day');

    cmp.switchView('Month');
    expect(cmp.currentView()).toBe('Month');
    vi.useRealTimers();
  });

  it('HU-04: openNewEventModal inicializa las fechas de inicio y fin correctamente', () => {
    cmp.openNewEventModal = CalendarComponent.prototype.openNewEventModal;
    
    
    cmp.openNewEventModal('2023-10-10T10:00:00', '2023-10-10T11:00:00');
    expect(cmp.newEventStart()).toBe('2023-10-10T10:00');
    expect(cmp.newEventEnd()).toBe('2023-10-10T11:00');
    expect(cmp.showEventModal()).toBe(true);

    
    cmp.openNewEventModal('', '');
    expect(cmp.newEventStart()).toBeTruthy();
    expect(cmp.newEventEnd()).toBeTruthy();
    expect(cmp.showEventModal()).toBe(true);
  });

  it('HU-05: updateEvent rechaza mover evento si hay superposición', async () => {
    cmp.updateEvent = CalendarComponent.prototype.updateEvent;
    
    cmp.hasOverlap = vi.fn().mockReturnValue(true);
    

    const e = {
      id: () => '1',
      start: () => ({ toString: () => '2023-10-10T10:30:00' }),
      end: () => ({ toString: () => '2023-10-10T11:30:00' })
    } as any;

    await cmp.updateEvent(e);

    expect(cmp.hasOverlap).toHaveBeenCalled();
    expect(mockSupabaseService.actualizar).not.toHaveBeenCalled();
  
  });


 
});
