<script lang="ts">
    import { Pane } from "tweakpane";
    import type { FolderApi } from "tweakpane";
	import type { PaneConfig } from "tweakpane/dist/types/pane/pane-config";
    import type { ThrelteContext } from "@threlte/core";
	import * as THREE from "three";
	import { onMount } from "svelte";

    export let ctx: ThrelteContext;
    export let studio: {conditionalDraw: Function, handleChildMount: Function}; //use this to forward selected child update to parent studio
    let el: HTMLElement;
    const editors: { [key: string]: {
        draw: () => Pane,
        rerenderOn: { sceneGraphUpdate?: boolean, selectedObjectUpdate?: boolean}
        pane?: Pane
    } } = {
        outliner: {
            draw: () => {
                el.innerHTML = '';
                const paneCfg: PaneConfig = {title: 'Outliner', container: el};
                const pane = new Pane(paneCfg);
                const objectsFolder: FolderApi = pane.addFolder({title: 'Objects', expanded: true});
                const buttonAndFolderCreator = (obj: THREE.Object3D, folder: FolderApi) => {
                    if(obj instanceof THREE.Group){
                        const nextFolder = folder.addFolder({title: obj.name});
                        obj.children.forEach((child) => {
                            buttonAndFolderCreator(child, nextFolder);
                        });
                    } else {
                        const btn = folder.addButton({title: obj.name});
                        btn.on('click', () => {
                            ctx.scene.userData.selected = obj;
                            console.log('Selected obj in outliner', obj);
                            studio.conditionalDraw('selectedObjectUpdate');
                        });
                    }

                }
                ctx.scene.children.forEach((sceneChild) => {
                    buttonAndFolderCreator(sceneChild, objectsFolder);
                });
                return pane;
            },
            rerenderOn: {
                sceneGraphUpdate: true
            }
        },
        properties: {
            draw: () => {
                const obj: THREE.Object3D = ctx.scene.userData.selected;

                el.innerHTML = "";
                const paneCfg: PaneConfig = {title: 'Properties', container: el};
                const pane = new Pane(paneCfg);
                if(obj){
                    let transformFolder = pane.addFolder({title:'Transform'});
                    transformFolder.addInput(obj, 'position');
                    transformFolder.addInput(obj, 'scale');
                    transformFolder.addInput(obj, 'rotation');
                    if(obj instanceof THREE.Mesh && obj.material){
                        let materialFolder = pane.addFolder({title:'Material'});
                        materialFolder.addInput(obj.material, 'color', {color: {type: 'float'}});
                    }
                }
                return pane;
            },
            rerenderOn: {selectedObjectUpdate: true}
        }
    }



    export let editorInstance;
    export let editor: string
    onMount(() => {
        editorInstance = editors[editor];
        editorInstance.draw();
    });
</script>

<div bind:this={el}>An editor should be here</div>