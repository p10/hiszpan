<script lang="ts">
  import Top from '$lib/ui/top.svelte';
  import type { ActionData } from './$types';
  export let form: ActionData;
</script>

<Top active="start" />

<main class="container">
  <article>
    <form method="post">
      <input type="text" name="value" placeholder="słówko" />
      <input type="submit" value="Sprawdź" />
    </form>
  </article>
</main>
