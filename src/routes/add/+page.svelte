<script lang="ts">
  import InputText from '$lib/ui/input-text.svelte';
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
      <InputText {form} name="name" placeholder="po hiszpańsku" focus />
      <div class="grid">
        <div><InputText {form} name="p1" placeholder="ja" /></div>
        <div><InputText {form} name="p2" placeholder="ty" /></div>
        <div><InputText {form} name="p3" placeholder="on/ona" /></div>
      </div>
      <div class="grid">
        <div><InputText {form} name="m1" placeholder="my" /></div>
        <div><InputText {form} name="m2" placeholder="wy" /></div>
        <div><InputText {form} name="m3" placeholder="oni" /></div>
      </div>
      <input type="submit" value="Dodaj" />
    </form>
  </article>
</main>
