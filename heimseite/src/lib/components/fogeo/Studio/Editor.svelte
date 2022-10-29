<script lang="ts">
    import { Pane } from "tweakpane";
    import type { FolderApi } from "tweakpane";
	import type { PaneConfig } from "tweakpane/dist/types/pane/pane-config";
    import type { ThrelteContext } from "@threlte/core";
	import * as THREE from "three";

    export let ctx: ThrelteContext;
    export let studio: {sceneGraphUpdate: Function, selectedObjUpdate: Function, handleChildMount: Function}; //use this to forward selected child update to parent studio
    let el: HTMLElement;
    const editors: { [key: string]: {
        draw: (arg: any) => Pane,
        props: {redrawOnSceneGraphUpdate?: boolean, redrawOnSelectedObjUpdate?: boolean},
        pane?: Pane
    } } = {
        outliner: {
            draw: (parent: THREE.Object3D) => {
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
                            obj.position.set(0,0,0);
                            studio.selectedObjUpdate();
                        });
                    }

                }
                ctx.scene.children.forEach((sceneChild) => {
                    buttonAndFolderCreator(sceneChild, objectsFolder);
                });
                return pane;
            },
            props: {
                redrawOnSceneGraphUpdate: true
            }
        },
        properties: {
            draw: (obj: THREE.Object3D) => {
                el.innerHTML = "";
                return new Pane();
            },
            props: {redrawOnSelectedObjUpdate: true}
        }
    }



    export let editorInstance;
    export let editor: string
    $: if(editor && el) {
        console.log('Lets render an editor of type ', editor);
        editorInstance = editors[editor];
    }
</script>

<div bind:this={el}></div>