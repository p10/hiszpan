<script lang="ts">
  import type { Fields } from '../form';
  type Props = {
    name: string;
    placeholder: string;
    form: { fields: Fields } | null;
    focus?: boolean;
  };
  let elem: HTMLInputElement;
  const { name, placeholder, form, focus }: Props = $props();
  $effect(() => {
    focus && elem.focus();
  });
</script>

<input
  bind:this={elem}
  type="text"
  {name}
  {placeholder}
  value={form?.fields[name].value || ''}
  aria-invalid={form?.fields[name].error ? 'true' : undefined}
/>
{#if form?.fields[name].error}
  <small>{form?.fields[name].error}</small>
{/if}
