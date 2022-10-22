
<script lang="ts">
    import { Canvas, ContextBridge, HierarchicalObject, type ThrelteContext} from '@threlte/core';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { useProgress } from '@threlte/extras';

    import Studio from './Studio/Studio.svelte';

    export let studio = false;
    let studioHandler: {createOutliner: () => void};

    let ctx: ThrelteContext;
    let experienceScene: THREE.Object3D = new THREE.Object3D();
    const { active } = useProgress();
    

    onMount(() => {
        // @ts-ignore
       window.navigator.requestMIDIAccess();
    });

   $: if(ctx) {experienceScene = ctx.scene}
    
   
</script>


<Canvas>
    {#if studio}
        <Studio objects={experienceScene} bind:studio={studioHandler}></Studio>
        <ContextBridge bind:ctx />
        <HierarchicalObject object={experienceScene} onChildMount={(child) => {experienceScene.add(child); console.log('child!!!', child); studioHandler.createOutliner()}} onChildDestroy={(child) => experienceScene.remove(child)}>
            <slot></slot>
        </HierarchicalObject>
    {:else}
        <slot></slot>
    {/if}
    
    
</Canvas>



