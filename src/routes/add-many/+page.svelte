<script lang="ts">
  import Textarea from '$lib/ui/textarea.svelte';
  import Top from '$lib/ui/top.svelte';
  import type { ActionData } from './$types';

  const { form }: { form: ActionData } = $props();
</script>

<Top active="add-many" />

<main class="container">
  <article>
    {#if form?.success}
      <p class="color-valid">dodano</p>
    {:else if form && !form.success}
      <p class="color-invalid">formularz zawiera błędy</p>
      {#if form.error}
        <p class="color-invalid">{form.error}</p>
      {/if}
    {/if}

    <form method="post">
      <Textarea
        {form}
        rows={10}
        name="text"
        placeholder="espanol, ja, ty, ona, my, wy, oni"
      />
      <input type="submit" value="Dodaj" />
    </form>
  </article>
</main>
