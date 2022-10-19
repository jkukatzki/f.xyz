// COMPONENT TO SPREAD INSTANCES AROUND A POINT
<script context="module" lang="ts">
    import type { Writable } from 'svelte/store';
    import AvenueTree from './AvenueTree.svelte';
    import {
        PerspectiveCamera,
        Instance,
        InstancedMesh,
        PointLight,
        useFrame,
        type ThrelteContext
    } from '@threlte/core'
    import {
        useGltf
    } from '@threlte/extras'
</script>
<script lang="ts">

	import * as THREE from 'three';
	import { onMount } from 'svelte';

    export let gltfOrigin: string;
    export let resX = 2;
    export let resY = 1;
    export let resZ = 3;
    export let linePoints: 
    [number, number, number][] = [
        [0, 0, 0],
        [1, 1, 1]
    ];

    export let object: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshPhongMaterial({color: 'pink'}));
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;


    

    const sizeFallofLinear = [1, 0.2];
    const rotationPointerMapLinear = [-1.1, 0.3];
    function mix(val: number, toMixBetween: number[]){
        return (1-val)*toMixBetween[0]+val*toMixBetween[1]
    }

    useFrame((ctx: ThrelteContext, delta: number) => {
    });
    
</script>

<PerspectiveCamera fov={90} position={{x:0, y:3, z:15}}></PerspectiveCamera>
<PointLight color={'pink'} intensity={4} distance={55} position={{y:50}}></PointLight>
<InstancedMesh id="left" geometry={object.geometry} material={object.material}>
    {#each Array(resZ) as _, index (index)}
        
    {/each}
</InstancedMesh>

