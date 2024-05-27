// See https://kit.svelte.dev/docs/types#app

import type { createWords } from '$lib/words/words.server';

// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      words: ReturnType<typeof createWords>;
    }
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
