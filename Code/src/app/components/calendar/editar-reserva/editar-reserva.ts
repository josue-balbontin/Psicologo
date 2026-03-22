import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva } from '../../../models/reserva.model';
import { SupabaseService } from '../../../services/supabase/supabase';

@Component({
  selector: 'app-editar-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-reserva.html',
  styleUrl: './editar-reserva.css',
})
export class EditarReserva implements OnInit {
  @Input() reserva!: Reserva;
  @Output() guardado = new EventEmitter<Reserva>();
  @Output() cancelado = new EventEmitter<void>();

  private supabaseService = inject(SupabaseService);

  // Formulario ligado a la plantilla
  form = {
    nombre: '',
    descripcion: '',
    telefono: '',
    correo: '',
    pais: '',
    precio: '',
    start: '',  // 'YYYY-MM-DDTHH:mm'
    end: '',    // 'YYYY-MM-DDTHH:mm'
  };

  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  submitAttempted = signal(false);

  private formatTimeForDb(datetimeLocal: string): string {
    const time = datetimeLocal.split('T')[1] || '';
    if (time.length === 5) {
      return `${time}:00`;
    }
    return time.substring(0, 8);
  }

  isInvalidField(field: 'nombre' | 'descripcion' | 'telefono'): boolean {
    if (!this.submitAttempted()) return false;

    if (field === 'nombre') return !this.form.nombre.trim();
    if (field === 'descripcion') return !this.form.descripcion.trim();
    return !this.form.telefono.trim();
  }

  ngOnInit(): void {
    this.form = {
      nombre: this.reserva.nombre,
      descripcion: this.reserva.descripcion,
      telefono: this.reserva.telefono,
      correo: this.reserva.correo,
      pais: this.reserva.pais,
      precio: this.reserva.precio !== null && this.reserva.precio !== undefined ? String(this.reserva.precio) : '',
      start: `${this.reserva.dia}T${this.reserva.hora_inicio.substring(0, 5)}`,
      end: `${this.reserva.dia}T${this.reserva.hora_final.substring(0, 5)}`,
    };
  }

  async guardar(): Promise<void> {
    this.submitAttempted.set(true);
    this.errorMsg.set(null);

    if (!this.form.nombre.trim() || !this.form.descripcion.trim() || !this.form.telefono.trim()) {
      this.errorMsg.set('Nombre, descripción y teléfono son obligatorios.');
      return;
    }
    if (this.form.end <= this.form.start) {
      this.errorMsg.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    const startDate = new Date(this.form.start);
    const endDate = new Date(this.form.end);
    const dia = startDate.toISOString().substring(0, 10);
    const horaInicio = this.formatTimeForDb(this.form.start);
    const horaFinal = this.formatTimeForDb(this.form.end);

    const haySuperposicion = await this.supabaseService.existeSuperposicion(
      dia,
      horaInicio,
      horaFinal,
      this.reserva.id
    );
    if (haySuperposicion) {
      this.errorMsg.set('El horario se superpone con otra reserva existente.');
      return;
    }

    const cambios: Partial<Reserva> = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim(),
      telefono: this.form.telefono.trim(),
      correo: this.form.correo.trim(),
      pais: this.form.pais.trim(),
      precio: this.form.precio.trim() ? Number(this.form.precio) : null,
      dia,
      hora_inicio: horaInicio,
      hora_final: horaFinal,
    };

    this.isLoading.set(true);
    try {
      const actualizada = await this.supabaseService.actualizar(this.reserva.id!, cambios);
      this.guardado.emit(actualizada);
    } catch (err) {
      console.error('Error al actualizar reserva:', err);
      this.errorMsg.set('No se pudo guardar los cambios. Intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}
