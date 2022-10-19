
<script lang="ts">
    import { Canvas, ContextBridge, type ThrelteContext} from '@threlte/core';
	import { HTML } from '@threlte/extras';

    export let studio = false;
    let ctx: ThrelteContext;

    

    $: if(studio && ctx) constructStudio();

</script>

<Canvas>
    <ContextBridge bind:ctx />
    <slot></slot>
</Canvas>



