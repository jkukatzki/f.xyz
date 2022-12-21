<script lang="ts">
	import type { ThrelteContext } from "@threlte/core";
	import { onMount } from "svelte";
    import Grid from "svelte-grid";
    import gridHelp from "svelte-grid/build/helper/index.mjs";

	import Editor from "./Editor.svelte";

    export let workspace: string;
    export let ctx: ThrelteContext;
    export let studio: any; //TODO: type annotations
    export let hidden: boolean;
    const COLS = 12;
    const cols = [[1800, 12]]

    let items: any[];

    interface Workspace {
        windows: any
    }
    const workspaces: { [key: string]: Workspace } = {
        layout: {
            windows: [
                {
                    [COLS]: gridHelp.item({
                        x: 8,
                        y: 0,
                        w: 4,
                        h: 4,
                        customDragger: true
                    }),
                    id: 'outlinerRight',
                    data: {
                        editors: ['outliner']
                    }
                },
                {
                    [COLS]: gridHelp.item({
                        x: 8,
                        y: 4,
                        w: 4,
                        h: 4,
                        customDragger: true
                    }),
                    id: 'layoutRight',
                    data: {
                        editors: ['properties']
                    }
                }
            ]
        }
    }
    let fullscreenStudioContainer: HTMLElement;
    let windows: { [key: string]: { editorInstances: {[key:number]: any} } };
    let currentWorkspace: string;
    $: if(workspace && workspace !== currentWorkspace) {
        currentWorkspace = workspace;
        items = workspaces[workspace].windows;
        if(!windows){
            windows = {};
        }
        items.forEach((item) => {
            if(!windows[item.id]){
                windows[item.id] = {editorInstances: {}};
            }
        });
        console.log('Studio.svelte -> setting items for workspace: ', workspace, ' items:', items, ' windows:', windows);
    }

    onMount(() => {
        document.body.appendChild(fullscreenStudioContainer);
        studio = {
            conditionalDraw(condition: string | true){
                //condition points to prop in EditorInstance.props
                if(condition){
                    for(let windowID in windows){
                        const editorInstances = windows[windowID].editorInstances;
                        for(let editorInstancesKey in editorInstances){
                            const editorInstance = editorInstances[editorInstancesKey];
                            if(typeof condition == 'boolean' || editorInstance.rerenderOn[condition]){
                                typeof condition == 'boolean' ? console.log('Rendering editorInstance: ', editorInstance) : console.log('Redrawing because '+condition+' called for update. editorInstance: ', editorInstance);
                                editorInstance.draw();
                            } else {
                                console.error('no draw :(', condition);
                            }
                        }
                    }
                } else {
                    console.error('Conditional Studio UI draw was called with instantly exciting condition.', condition)
                }
            },
            handleChildMount: (child: THREE.Object3D) => {
                console.log('Handling child mount for FOGEO:Studio');
                let newName = child.name ? child.name : child.type;
                child.userData.fogeo = {studio: {}};
                let count = 0;
                const findAndIncreaseCount = (name: string, scene: THREE.Scene) => {
                    if(scene.getObjectByName(name)){
                        count++;
                        findAndIncreaseCount(name+"_"+count, scene);
                    } else {
                        child.name = name+(count > 0 ? "_"+count : '');
                    }
                }
                findAndIncreaseCount(newName, ctx.scene);
                ctx.scene.add(child);
            }
        }
    });


</script>

{#if items && windows}
    <div class="fogeo-studio-fullscreen-fixed" class:hidden-studio="{hidden}" bind:this={fullscreenStudioContainer}>
        <div>Studio</div><div style="float:right">X</div>
        <Grid scroller={fullscreenStudioContainer} bind:items={items} cols={cols} rowHeight={100}  let:item let:dataItem let:movePointerDown>
            <div class="studio-window-dragger" on:pointerdown={movePointerDown}>============</div>
            <div class="studio-window-wrapper">
                {#each dataItem.data.editors as editor, index }
                    <Editor studio={studio} ctx={ctx} bind:editorInstance={windows[dataItem.id].editorInstances[index]} editor={editor}></Editor>  
                {/each}
            </div>
            
        </Grid>
    </div>
{/if}

<style>
    .hidden-studio {
        visibility: hidden;
    }
    .fogeo-studio-fullscreen-fixed {
        position: fixed;
        background-color: rgba(0,0,0,0.2);
        color: white;
        top: 0;
        width: 99vw;
        height: 99vh;

    }

    :global(.svlt-grid-shadow) {
        background: black !important;
        bottom: -1em;
    }

    :global(.svlt-grid-item) {
        padding-top: 1em;
    }

    :global(.svlt-grid-resizer){
        bottom: -1em !important;
    }



    .studio-window-wrapper {
        background-color: darkgray;
        overflow: auto;
        height: 100%;
        padding-top: 1em;
    }

    .studio-window-dragger {
        background-color: rgb(0, 0, 0);
        cursor: grab;
        width: 100%;
        position: fixed;
        z-index: 1
    }
</style>
