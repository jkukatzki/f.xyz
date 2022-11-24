<script context="module" lang="ts">
    import * as THREE from 'three';
    import { PerspectiveCamera, PointLight, useFrame, useThrelte } from '@threlte/core';


    import {
        GLTF, useGltfAnimations
    } from '@threlte/extras'
</script>
<script lang="ts">

export let globalPointer = new THREE.Vector2();
const ctx = useThrelte();


useFrame((ctx) => {ctx.invalidate()});

</script>

<PointLight position={{z:2}}></PointLight>
<PerspectiveCamera position={{y:globalPointer.y, z:2}}></PerspectiveCamera>
<GLTF url={'/models/atopo/apollo_modified.glb'}></GLTF>

