<script>
  export let emojis;
</script>

<ul lang="ts">
  {#each emojis as emoji}
    <li> {emoji} </li>
  {/each}
</ul>
