<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import type { Fields } from '../form';
  import ErrorText from './error-text.svelte';
  type Props = {
    name: string;
    placeholder: string;
    form: { fields: Fields } | null;
    focus?: boolean;
  };
  let elem: HTMLTextAreaElement;
  const {
    name,
    placeholder,
    form,
    focus,
    ...attrs
  }: Props & Omit<HTMLTextareaAttributes, 'form'> = $props();
  $effect(() => {
    focus && elem.focus();
  });
</script>

<textarea
  {...attrs}
  bind:this={elem}
  {name}
  value={form?.fields[name].value || ''}
  {placeholder}
  aria-invalid={form?.fields[name].error ? 'true' : undefined}
></textarea>
<ErrorText {form} {name} />
