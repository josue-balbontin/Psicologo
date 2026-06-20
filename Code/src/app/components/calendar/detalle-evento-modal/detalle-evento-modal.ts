import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-evento-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-evento-modal.html',
  styleUrl: './detalle-evento-modal.css',
})
export class DetalleEventoModal {
  @Input() showModal = false;
  @Input() selectedEvent: any = null;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  onEdit() {
    this.edit.emit();
  }

  formatDpDate(dpStr: string): string {
    const [datePart, timePart] = dpStr.split('T');
    if (!datePart) return dpStr;
    const [y, m, d] = datePart.split('-');
    const time = timePart ? timePart.substring(0, 5) : '';
    return `${d}/${m}/${y} ${time}`;
  }

  formatDuration(startStr: string, endStr: string): string {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();

    if (Number.isNaN(diffMs) || diffMs <= 0) {
      return 'No disponible';
    }

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }
}
