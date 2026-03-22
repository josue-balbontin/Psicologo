import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-overlay">
      <div class="spinner-wrapper">
        <div class="spinner"></div>
        <p class="loading-text">Cargando...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(2px);
      z-index: 10000;
    }
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 4px solid #e1dfdd;
      border-top-color: #5b5fc7;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    .loading-text {
      font-size: 14px;
      font-weight: 500;
      color: #605e5c;
      font-family: 'Segoe UI', system-ui, sans-serif;
      margin: 0;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingComponent {}
