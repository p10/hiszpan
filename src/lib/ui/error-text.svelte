<script lang="ts">
  import type { Fields } from '../form';
  type Props = {
    name: string;
    form: { fields: Fields } | null;
  };
  const { form, name }: Props = $props();
</script>

{#if form?.fields[name].error}
  <small>{form?.fields[name].error}</small>
{/if}
