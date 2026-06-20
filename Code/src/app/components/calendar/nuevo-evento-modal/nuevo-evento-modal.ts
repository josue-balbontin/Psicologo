import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nuevo-evento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-evento-modal.html',
  styleUrl: './nuevo-evento-modal.css',
})
export class NuevoEventoModal {
  @Input() showModal = false;
  @Input() isSaving = false;
  @Input() errorMsg: string | null = null;
  @Input() set initialStart(val: string) {
    this.newEvent.start = val;
  }
  @Input() set initialEnd(val: string) {
    this.newEvent.end = val;
  }

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  newEvent = {
    title: '',
    descripcion: '',
    telefono: '',
    correo: '',
    pais: '',
    precio: '' as string | number | null,
    start: '',
    end: '',
  };

  createSubmitAttempted = signal(false);
  localError = signal<string | null>(null);

  isCreateFieldInvalid(field: 'title' | 'descripcion' | 'telefono'): boolean {
    if (!this.createSubmitAttempted()) return false;

    if (field === 'title') return !this.newEvent.title.trim();
    if (field === 'descripcion') return !this.newEvent.descripcion.trim();
    return !this.newEvent.telefono.trim();
  }

  onClose() {
    if (!this.isSaving) {
      this.close.emit();
    }
  }

  onSave() {
    if (this.isSaving) return;

    this.createSubmitAttempted.set(true);
    this.localError.set(null);

    if (!this.newEvent.title.trim() || !this.newEvent.descripcion.trim() || !this.newEvent.telefono.trim()) {
      this.localError.set('Título, descripción y teléfono son obligatorios.');
      return;
    }

    const phoneDigits = this.newEvent.telefono.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      this.localError.set('El teléfono debe tener al menos 7 dígitos.');
      return;
    }

    if (this.newEvent.end <= this.newEvent.start) {
      this.localError.set('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    this.save.emit({ ...this.newEvent });
  }


  reset() {
    this.newEvent = {
      title: '',
      descripcion: '',
      telefono: '',
      correo: '',
      pais: '',
      precio: '',
      start: '',
      end: '',
    };
    this.createSubmitAttempted.set(false);
    this.localError.set(null);
  }
}
