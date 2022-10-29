
<script lang="ts">
    import { Canvas, ContextBridge, HierarchicalObject, useThrelte, type ThrelteContext} from '@threlte/core';
	import { onMount } from 'svelte';

    import Studio from './Studio/Studio.svelte';


    export let studioWorkspace: string = '';
    let studioHandler: {
        sceneGraphUpdate: () => void;
        selectedObjUpdate: () => void;
        handleChildMount: (child: THREE.Object3D) => void;
    };

    let ctx: ThrelteContext;

    

    onMount(() => {
        // @ts-ignore
        window.navigator.requestMIDIAccess();
    });

    $: if (ctx) {
        console.log('context here', ctx);
        console.log('Scene', ctx.scene);
    }

   
</script>

{#if studioWorkspace}
    <Studio ctx={ctx} workspace={studioWorkspace} bind:studio={studioHandler}></Studio>
{/if}
<Canvas bind:ctx>
    {#if studioWorkspace }
        <HierarchicalObject onChildMount={(child) => {ctx.scene.add(child); studioHandler.handleChildMount(child); studioHandler.sceneGraphUpdate();}} onChildDestroy={(child) => {ctx.scene.remove(child); }}><slot></slot></HierarchicalObject>
    {:else}
        <slot></slot>
    {/if}
</Canvas>





