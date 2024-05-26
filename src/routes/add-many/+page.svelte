<script lang="ts">
  import ErrorText from '$lib/ui/error-text.svelte';
  import Top from '$lib/ui/top.svelte';
  import type { ActionData } from './$types';
  export let form: ActionData;
</script>

<Top active="add" />

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
      <textarea>{form?.fields['text'].value ?? ''}</textarea>
      <ErrorText {form} name="text" />
      <input type="submit" value="Dodaj" />
    </form>
  </article>
</main>
