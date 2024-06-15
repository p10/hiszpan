<script lang="ts">
  import Top from '$lib/ui/top.svelte';
  import { variantLabel, type Word } from '$lib/words/types';
  import type { ActionData } from './$types';
  import type { PageData } from './$types';

  const { data, form }: { data: PageData; form: ActionData } = $props();

  function wordInForm(word: Word) {
    return (
      form?.fields.name?.value === word.name &&
      form?.fields.variant?.value === word.variant
    );
  }

  function displayValue(word: Word) {
    if (wordInForm(word)) {
      return form?.fields.value?.value;
    }
    return word.value;
  }
</script>

<Top active="edit" />

{#snippet edit(word: Word)}
  <form method="post">
    <input type="hidden" name="name" value={word.name} />
    <input type="hidden" name="variant" value={word.variant} />
    <!-- svelte-ignore a11y_no_redundant_roles -->
    <fieldset role="group">
      <input
        type="text"
        name="value"
        placeholder={word.value}
        value={displayValue(word)}
        autocomplete="off"
        aria-invalid={wordInForm(word) && form?.fields.value?.error
          ? 'true'
          : undefined}
      />
      <button type="submit" class="secondary">zmień</button>
    </fieldset>
    {#if wordInForm(word) && form?.fields.value?.error}
      <small class="err">{form?.fields.value?.error}</small>
    {/if}
  </form>
{/snippet}

<div class="container">
  {#if form?.success}
    <p class="color-valid">Zapisano</p>
  {:else if form && !form.success}
    <p class="color-invalid">Formularz zawiera błędy</p>
  {/if}

  {#each data.words as combo}
    <article>
      <header>{combo.name}</header>
      <dl>
        <dt>{variantLabel('p1')}</dt>
        <dd>{@render edit(combo.p1)}</dd>
        <dt>{variantLabel('p2')}</dt>
        <dd>{@render edit(combo.p2)}</dd>
        <dt>{variantLabel('p3')}</dt>
        <dd>{@render edit(combo.p3)}</dd>
        <dt>{variantLabel('m1')}</dt>
        <dd>{@render edit(combo.m1)}</dd>
        <dt>{variantLabel('m2')}</dt>
        <dd>{@render edit(combo.m2)}</dd>
        <dt>{variantLabel('m3')}</dt>
        <dd>{@render edit(combo.m3)}</dd>
      </dl>
    </article>
  {/each}
</div>

<style>
  .err {
    color: var(--pico-del-color);
  }
</style>
