<script lang="ts">
  // import type { Snippet } from 'svelte';
  // const { children }: { children?: Snippet } = $props();
  type Active = 'start' | 'add' | 'add-many';
  const { active }: { active: Active } = $props();
</script>

<header class="container">
  <nav>
    <ul>
      <li class:active={active === 'start'}><a href="/">Zgaduj</a></li>
      <li class:active={active === 'add'}><a href="/add">Dodaj</a></li>
      <li class:active={active === 'add-many'}>
        <a href="/add-many">importuj</a>
      </li>
    </ul>
  </nav>
</header>

<style>
  header {
    margin-block: 1rem;
  }
  nav {
    justify-content: center;
  }
  nav ul {
    margin-inline: 0;
    gap: 0.5rem;
  }
  .active a {
    background: var(--pico-primary);
    color: var(--pico-primary-inverse);
    cursor: default;
    text-decoration: none;
  }
</style>
