
<script lang="ts">
    import { Canvas, ContextBridge, HierarchicalObject, useThrelte, type ThrelteContext} from '@threlte/core';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { useProgress } from '@threlte/extras';

    import Studio from './Studio/Studio.svelte';

    export let studio = false;
    let studioHandler: {createOutliner: (objs: THREE.Object3D) => void};

    let ctx: ThrelteContext = useThrelte();

    

    onMount(() => {
        // @ts-ignore
        window.navigator.requestMIDIAccess();
    });


    const assignUniqueName = function( obj: THREE.Object3D ) {
        if
        if(ctx.scene.getObjectByName())
    }
    
   
</script>


<Canvas>
    {#if studio}
        <Studio ctx={ctx} bind:studio={studioHandler}></Studio>
        <ContextBridge bind:ctx />
        {#if ctx}
            <HierarchicalObject onChildMount={(child) => {ctx.scene.add(child); if(studioHandler){studioHandler.createOutliner(ctx.scene)} }} onChildDestroy={(child) => ctx.scene.remove(child)}>
                <slot></slot>
            </HierarchicalObject>
        {/if}
    {:else}
        <slot></slot>
    {/if}
</Canvas>



