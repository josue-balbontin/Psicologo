import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error',
  standalone: true,
  template: `
    <div class="error-overlay">
      <div class="error-card">
        <div class="error-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="0.5" fill="#ef4444"/>
          </svg>
        </div>
        <h3 class="error-title">Ocurrió un error</h3>
        <p class="error-message">{{ mensaje }}</p>
        <button class="retry-btn" (click)="retry.emit()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(2px);
      z-index: 100;
      border-radius: inherit;
    }
    .error-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: #fff;
      border: 1px solid #fde8e8;
      border-radius: 12px;
      padding: 32px 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      max-width: 320px;
      text-align: center;
    }
    .error-icon {
      background: #fef2f2;
      border-radius: 50%;
      padding: 14px;
      display: flex;
    }
    .error-title {
      font-size: 16px;
      font-weight: 600;
      color: #201f1e;
      margin: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .error-message {
      font-size: 13px;
      color: #8a8886;
      margin: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      line-height: 1.5;
    }
    .retry-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 20px;
      background: #5b5fc7;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      font-family: 'Segoe UI', system-ui, sans-serif;
      margin-top: 4px;
    }
    .retry-btn:hover { background: #4b4fb7; }
  `],
})
export class ErrorComponent {
  @Input() mensaje: string = 'No se pudo completar la operación. Por favor intenta de nuevo.';
  @Output() retry = new EventEmitter<void>();
}
