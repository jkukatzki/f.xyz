<script lang="ts">
	import type { ThrelteContext } from "@threlte/core";
    import Grid from "svelte-grid";
    import gridHelp from "svelte-grid/build/helper/index.mjs";

	import Editor from "./Editor.svelte";

    export let workspace: string;
    export let ctx: ThrelteContext;
    export const studio = {
        sceneGraphUpdate: () => {
            for(let windowID in windows){
                const editorInstances = windows[windowID].editorInstances;
                for(let editorInstancesKey in editorInstances){
                    const editorInstance = editorInstances[editorInstancesKey];
                    console.log('Editor instance checking if it needs update bcecause scene updated', editorInstance)
                    if(editorInstance.props.redrawOnSceneGraphUpdate){
                        console.log('Redrawing because of scene graph update...');
                        editorInstance.draw();
                    }
                }
            }
        },
        selectedObjUpdate: () => {
            for(let windowID in windows){
                const editorInstances = windows[windowID].editorInstances;
                for(let editorInstancesKey in editorInstances){
                    const editorInstance = editorInstances[editorInstancesKey];
                    if(editorInstance.props.redrawOnSelectedObjUpdate){
                        editorInstance.draw();
                    }
                }
            }
        },
        handleChildMount: (child: THREE.Object3D) => {
            console.log('Handling child mount for FOGEO:Studio');
            let newName = child.name ? child.name : typeof child;

            let count = 0;
            const findAndIncreaseCount = (name: string, scene: THREE.Scene) => {
                if(scene.getObjectByName(name)){
                    count++;
                    findAndIncreaseCount(name+"_"+count, scene);
                } else {
                    child.name = name+"_"+count;
                }
            }
            findAndIncreaseCount(newName, ctx.scene);
            ctx.scene.add(child);
        }
    }

    const COLS = 12;
    const cols = [[1800, 12], [1200, 6]]

    let items: any[];

    interface Workspace {
        windows: any
    }
    const workspaces: { [key: string]: Workspace } = {
        layout: {
            windows: [
                {
                    [COLS]: gridHelp.item({
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 4,
                        customDragger: true
                    }),
                    id: 'right',
                    data: {
                        editors: ['outliner', 'properties']
                    }
                }
            ]
        }
    }
    let fullscreenStudioContainer;
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

</script>

{#if items && windows}
    <div class="fogeo-studio-fullscreen-fixed" bind:this={fullscreenStudioContainer}>
        I'm a studio!
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
    .fogeo-studio-fullscreen-fixed {
        position: fixed;
        background-color: rgba(0,0,0,0.2);
        color: white;
        top: 0;
        left: 0;
        width: 99vw;
        height: 99vh;

    }

    :global(.svlt-grid-shadow) {
        background: navy;
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
