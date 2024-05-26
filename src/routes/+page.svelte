<script lang="ts">
  import Top from '$lib/ui/top.svelte';
  import type { PageData, ActionData } from './$types';
  import type { Variety } from '$lib/words/types';
  import InputText from '$lib/ui/input-text.svelte';

  type Props = {
    data: PageData;
    form: ActionData;
  };
  const { data, form }: Props = $props();

  let { word } = data;
  const varietyMap = new Map<Variety, string>([
    ['p1', 'ja'],
    ['p2', 'ty'],
    ['p3', 'on/ona'],
    ['m1', 'my'],
    ['m2', 'wy'],
    ['m3', 'oni'],
  ]);
</script>

<Top active="start" />

<main class="container">
  <article>
    <header>
      <strong>{word.name}</strong> -
      <small>{varietyMap.get(word.variety)}</small>
    </header>
    <form method="post">
      <input type="hidden" name="name" value={word.name} />
      <input type="hidden" name="variety" value={word.variety} />
      <InputText
        {form}
        name="answer"
        placeholder={varietyMap.get(word.variety) ?? ''}
        focus
      />
      <input type="submit" value="Sprawdź" />
    </form>
  </article>
  {#if form}
    <pre>{JSON.stringify(form, null, 2)}</pre>
  {/if}
</main>

<style>
</style>
