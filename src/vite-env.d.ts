/// <reference types="vite/client" />

declare namespace React {
  interface HTMLAttributes<T> {
    class?: string;
    for?: string;
  }
  interface SVGAttributes<T> {
    class?: string;
    for?: string;
  }
}