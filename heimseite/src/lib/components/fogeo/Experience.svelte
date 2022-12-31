
<script lang="ts">
    import { Canvas, ContextBridge, HierarchicalObject, useThrelte, type ThrelteContext} from '@threlte/core';
	import { onMount } from 'svelte';

    import Studio from './Studio/Studio.svelte';

    export let dpr: number | undefined = undefined;
    export let studioWorkspace: string = '';
    let activeStudio = false;
    let studioHandler: {
        conditionalDraw: (condition: string | boolean) => void;
        handleChildMount: (child: THREE.Object3D) => void;
    };

    let ctx: ThrelteContext;


    onMount(() => {
        // @ts-ignore
        //window.navigator.requestMIDIAccess();
        if(studioWorkspace){
            document.addEventListener('keydown', (e) => {
            if( document.activeElement?.tagName !== "input" ){
                if(e.key == 'f'){
                    if(activeStudio){
                        activeStudio = false;
                    } else {
                        activeStudio = true;
                    }
                }
            } else {
                console.log('active element', document.activeElement);
            }          
        });
        }

    });


    $: if (ctx && studioHandler) {
        console.log('context here', ctx);
        console.log('Scene', ctx.scene);
    }

   
</script>

{#if studioWorkspace}
    <Studio ctx={ctx} workspace={studioWorkspace} bind:studio={studioHandler} hidden={!activeStudio}></Studio>
{/if}
<Canvas bind:ctx dpr={dpr}>
    {#if studioWorkspace }
        <HierarchicalObject 
        onChildMount={(child) => {ctx.scene.add(child); studioHandler.handleChildMount(child); studioHandler.conditionalDraw('sceneGraphUpdate');}}
        onChildDestroy={(child) => {ctx.scene.remove(child); studioHandler.conditionalDraw('sceneGraphUpdate')}}>
            <slot></slot>
        </HierarchicalObject>
    {:else}
        <slot></slot>
    {/if}
</Canvas>