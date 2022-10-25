<script context="module" lang="ts">
    import {PlaneGeometry, MeshStandardMaterial, Vector2, BufferGeometry} from 'three';

    import {
        PerspectiveCamera,
        Mesh,
        PointLight,
        Fog,
        useFrame,
        type ThrelteContext,
    } from '@threlte/core'

    import {
        GLTF, useGltfAnimations
    } from '@threlte/extras'
</script>
<script lang="ts">
    const { gltf } = useGltfAnimations<'idle'>(({ actions }) => {
        actions['idle']?.play();
    });

    $: if($gltf) console.log('gltf:', $gltf);

    
    
    
</script>



<GLTF bind:gltf={$gltf} url={'/models/deskShowcase.glb'}></GLTF>
