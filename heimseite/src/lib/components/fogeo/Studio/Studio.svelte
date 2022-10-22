<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import type { BladeApi, FolderApi } from '@tweakpane/core';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
    import { Pane } from 'tweakpane';

    export let objects: THREE.Object3D;

    
    let top: number;
    let outlinerPane: Pane;
    let objectsFolder: FolderApi; 
    let propertiesFolder: FolderApi;
    onMount(() => {
        outlinerPane = new Pane();
        objectsFolder = outlinerPane.addFolder({title: 'Objects', expanded: true});
        propertiesFolder = outlinerPane.addFolder({title: 'Properties'});
    });
    export const studio = {
        createOutliner : function(){
            if(!outlinerPane){
                return;
            }
            console.log('Creating Studio from Objects:', objects);
            outlinerPane.element.parentElement?.setAttribute('style', "top: "+top+"px")
            console.log('Context Scene:', objects);

            const unnamedObjectsRegister: {[key: string]: number} = {};
            const namedObjectsRegister: string[] = [];
            function checkForAndCreateUniqueName(obj: THREE.Object3D){
                if(!obj.name){
                    if(!unnamedObjectsRegister[obj.type]){
                        obj.name = obj.type;
                        unnamedObjectsRegister[obj.type] = 0;
                    } else {
                        unnamedObjectsRegister[obj.type]++;
                        obj.name = obj.type+"_"+unnamedObjectsRegister[obj.type];
                    }
                }
                if(namedObjectsRegister.includes(obj.name)){
                    obj.name = obj.name+"_0"
                }
                while(namedObjectsRegister.includes(obj.name)){
                    obj.name = obj.name.slice(0, -1)+parseInt(obj.name[obj.name.length])+1;
                }
                namedObjectsRegister.push(obj.name);
            }

            //TODO: instead of ev: any ev: TpEvent is suggested, cant get it to be imported though, might be wrong type defintions for tweakpane. - TpChangeEvent exists...
            function createButtonBladesGroupTraversal(group: THREE.Object3D, segmentToAddTo: Pane | FolderApi){
                console.log('Traversing group for UI elms:', group.children);
                for(let i=0; i<group.children.length; i++){
                    const groupChild = group.children[i];
                    console.log('groupChild!!!!!!',groupChild);
                    checkForAndCreateUniqueName(group.children[i]);;
                    if(groupChild instanceof THREE.Group){
                        console.log('groupChild is a group');
                        const newFolder = segmentToAddTo.addFolder({title: groupChild.name});
                        createButtonBladesGroupTraversal(groupChild, newFolder);
                    } else {
                        segmentToAddTo.addButton({title: group.children[i].name}).on('click', () => console.log(groupChild));
                    }
                }
                
            }
            createButtonBladesGroupTraversal(objects, objectsFolder);
        }
    };

    function createTransformMenu(obj: THREE.Object3D){

    }

    let currentObjects: THREE.Object3D;
    const { renderer } = useThrelte();
    $: if(objects && renderer){
        currentObjects = objects;
        top = renderer.domElement.getBoundingClientRect().y;
        studio.createOutliner();
    }
</script>