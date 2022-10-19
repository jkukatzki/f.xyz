<script context="module" lang="ts">
    import { Instance, useFrame, type ThrelteContext } from '@threlte/core';
	import { onMount } from 'svelte';
    import { Vector3 } from 'three';
</script>

<script lang="ts">
    export let xAlley: {index: number, res: number, mirror: boolean};
    export let yAlley: {index: number, res: number, mirror: boolean};
    export let zAlley: {index: number, res: number, mirror: boolean};
    export let update: {position?: boolean, rotation?: boolean; scale?: boolean} = {};

    export let avenuePath: THREE.CurvePath<THREE.Vector3>;

    let position = new Vector3(0, 0, 0);
    let rotation = new Vector3(0, 0, 0);
    let scale = new Vector3(1, 1, 1);
    


    onMount(() => {

    });
    useFrame((ctx: ThrelteContext, delta: number) => {
        
    });

</script>

<Instance position={position} rotation={rotation} scale={scale}></Instance>