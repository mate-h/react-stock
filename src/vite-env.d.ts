/// <reference types="vite/client" />

declare namespace React {
  interface HTMLAttributes<T> {
    class?: string;
    for?: string;
  }
}