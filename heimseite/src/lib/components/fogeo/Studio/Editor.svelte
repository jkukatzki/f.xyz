<script lang="ts">
    import { ButtonApi, Pane } from "tweakpane";
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
                const selected: {[key: string]: {btn: ButtonApi, obj: THREE.Object3D}} = {};
                const pressedKeys: {[key: string]: boolean} = {};
                window.onkeyup = function(e) { pressedKeys[e.key] = false; }
                window.onkeydown = function(e) { pressedKeys[e.key] = true; }
                let index = 0;
                const buttonAndFolderCreator = (obj: THREE.Object3D, folder: FolderApi) => {
                    const selectObjBtn = folder.addButton({title: obj.name});
                    selectObjBtn.element.classList.add('fogeo-object-select-button');
                    selectObjBtn.on('click', (e) => {
                        console.log(JSON.stringify(pressedKeys));
                        if(!pressedKeys['Control']){
                            for(let selectedKey in selected){
                                console.log(selectedKey);
                                selected[selectedKey].btn.element.classList.remove('fogeo-object-select-button-active');
                            }
                        }
                        selected[selectObjBtn.title] = {btn: selectObjBtn, obj};
                        selectObjBtn.element.classList.add('fogeo-object-select-button-active');
                        ctx.scene.userData.selected = obj;
                        console.log('Selected obj in outliner', obj);
                        studio.conditionalDraw('selectedObjectUpdate');
                    });
                    if(obj.children.length > 0 || Object.keys(obj.userData).length > 0){
                        const expandObjButton = folder.addButton({title: 'V'});
                        expandObjButton.element.classList.add('fogeo-object-expand-button');
                        let expandedObj: FolderApi;
                        const createExpansionFromChildren = () => {
                            expandObjButton.title = 'Ʌ';
                            obj.userData.fogeo.studio.expanded = true;
                            let expansionIndex = folder.children.indexOf(expandObjButton);
                            expandedObj = folder.addFolder({index: expansionIndex+1, title: ''});
                            obj.children.forEach((expansionChild: THREE.Object3D) => {
                                if(!expansionChild.userData.fogeo?.studio){
                                    expansionChild.userData.fogeo = {studio: {}}
                                }
                                buttonAndFolderCreator(expansionChild, expandedObj);
                            });
                        }
                        const closeExpansion = () => {
                            expandObjButton.title = 'V';
                            expandedObj.dispose();
                            obj.userData.fogeo.studio.expanded = false;
                        }
                        if(obj instanceof THREE.Group){
                            createExpansionFromChildren();

                        }
                        expandObjButton.on('click', () => {
                            const expanded: boolean = obj.userData?.fogeo?.studio?.expanded;
                            expandObjButton.title = !expanded ? 'Ʌ' : 'V';
                            if(!expanded){
                                createExpansionFromChildren();
                            } else {
                                closeExpansion();
                            } 
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
                    if(obj instanceof THREE.Light){
                        let lightFolder = pane.addFolder({title: 'Light Properties'});
                        lightFolder.addInput(obj, 'intensity');
                    }
                    if(obj.userData){
                        let objectUserDataFolder = pane.addFolder({title: 'User Data'});
                        const traverseUserData = (level: any, userDataSubFolder: FolderApi) => {
                            //object as input to have relation in addInput with key
                            for(const userDataSubProperty in level){
                                if(level.hasOwnProperty(userDataSubProperty) && !['parent', '0', 'children', 'object'].includes(userDataSubProperty)){
                                    const entry = level[userDataSubProperty];
                                    switch(typeof entry){
                                        case 'object': {
                                            
                                            console.log('Creating new subfolder for userData', userDataSubProperty);
                                            const newSubFolder = userDataSubFolder.addFolder({title: userDataSubProperty})
                                            traverseUserData(entry, newSubFolder);
                                            break;
                                        }
                                        case 'number': {
                                            userDataSubFolder.addInput(level, userDataSubProperty);
                                            break;
                                        }
                                        default:
                                            break;
                                    }
                                }

                                
                            }
                        };
                        traverseUserData(obj.userData, objectUserDataFolder);
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

<style>
    :global(.fogeo-object-select-button) {
        width: 90%;
        float: left;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin: 0 !important;
        text-align: left !important;
    }
    :global(.fogeo-object-select-button-active) {
        box-sizing: border-box;
        border: orange 2px solid;
    }
    :global(.fogeo-object-expand-button) {
        width: 9%;
        float: left;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin: 0 !important;
    }
    :global(.fogeo-object-select-button > div > div > button > div){
        text-align: left !important;
        padding-left: 0.5em;
    }
</style>