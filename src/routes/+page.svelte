<script lang="ts">
  import Top from '$lib/ui/top.svelte';
  import type { PageData, ActionData } from './$types';
  import { variantLabel } from '$lib/words/types';
  import InputText from '$lib/ui/input-text.svelte';

  type Props = {
    data: PageData;
    form: ActionData;
  };
  const { data, form }: Props = $props();

  let { word } = data;
</script>

<Top active="start" />

<main class="container">
  <article>
    {#if word}
      <header>
        <strong>{word.name}</strong> -
        <small>{variantLabel(word.variant)}</small>
      </header>
      <form method="post">
        <input type="hidden" name="name" value={word.name} />
        <input type="hidden" name="variant" value={word.variant} />
        <InputText
          {form}
          name="answer"
          placeholder={variantLabel(word.variant)}
          focus
        />
        <input type="submit" value="Sprawdź" />
      </form>
    {:else}
      <p>baza nie zawiera słów. Dodaj jakieś.</p>
    {/if}
  </article>
</main>

<style>
</style>
