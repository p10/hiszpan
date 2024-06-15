<script lang="ts">
  import type { Fields } from '../form';
  import ErrorText from './error-text.svelte';
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
  autocomplete="off"
  aria-invalid={form?.fields[name].error ? 'true' : undefined}
/>
<ErrorText {name} {form} />
