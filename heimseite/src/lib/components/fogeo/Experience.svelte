
<script lang="ts">
    import { Canvas, ContextBridge, HierarchicalObject, useThrelte, type ThrelteContext} from '@threlte/core';
	import { useProgress } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
    import { fade } from 'svelte/transition';

    import Studio from './Studio/Studio.svelte';

    export let dpr: number | undefined = undefined;
    export let indicateProgress = false;
    export let studioWorkspace: string = '';
    export let reenableTouchPan: boolean = false;
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
        if(reenableTouchPan){
            ctx.renderer?.domElement.classList.add('fogeo-touch-pan-orbit-controls');
        }
    }
    let tweenedProgress = tweened(0, {duration: 800});
    let progress: any = undefined;
    $: if(indicateProgress){
        if(progress == undefined){
            progress = useProgress().progress;
            
        }
        tweenedProgress.set($progress);
    }

   
</script>

{#if indicateProgress && $tweenedProgress < 1}
    <div
        transition:fade|local={{
            duration: 200
        }}
        class="wrapper"
    >
    <p class="loading">Lädt...</p>
    <div class="bar-wrapper">
        <div class="bar" style="width: {$tweenedProgress * 100}%" />
    </div>
    </div>
{/if}
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

<style>
    :global(.fogeo-touch-pan-orbit-controls){
        touch-action: pan-y !important;
    }
    .wrapper {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		color: rgb(255, 122, 195);
	}

	.loading {
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.bar-wrapper {
		width: 33.333333%;
		height: 10px;
		border: 1px solid rgb(213, 0, 233);
		position: relative;
	}

	.bar {
		height: 100%;
		background-color: rgb(53, 0, 58);
	}
</style>