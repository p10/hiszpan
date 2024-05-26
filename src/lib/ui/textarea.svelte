<script lang="ts">
  import type { Fields } from '../form';
  type Props = {
    name: string;
    placeholder: string;
    form: { fields: Fields } | null;
  };
  const { name, placeholder, form }: Props = $props();
</script>

<textarea
  {placeholder}
  value={form?.fields[name].value || ''}
  aria-invalid={form?.fields[name].error ? 'true' : undefined}
></textarea>
{#if form?.fields[name].error}
  <small>{form?.fields[name].error}</small>
{/if}
