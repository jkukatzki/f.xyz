<script context="module" lang="ts">
    import * as THREE from 'three';


    import {
        GLTF, useGltfAnimations
    } from '@threlte/extras'
</script>
<script lang="ts">
	import { InteractiveObject, Mesh, Object3D } from "@threlte/core";
	import { MeshBasicMaterial, SphereGeometry } from "three";


    const { gltf, actions, mixer } = useGltfAnimations(({ actions }) => {
        console.log('Following actions found for gltf: ', actions);
        actions['face_expression']?.play();
        actions['idle']?.play();
    });

    let tastenEmpty: THREE.Object3D | undefined;
    let lampEmpty: THREE.Object3D | undefined;
    let lampLightCone: THREE.Object3D | undefined;
    let firstParse = false;

    $: if($gltf && !firstParse) {
            firstParse = true;
            console.log('gltf:', $gltf);
            tastenEmpty = $gltf.scene.getObjectByName('tasten_empty');
            tastenEmpty?.children.forEach((child) => {
                child.userData.originalPos = child.position.clone();
            });
            lampEmpty = $gltf.scene.getObjectByName('lamp');
            lampLightCone = $gltf.scene.getObjectByName('lamp_light_cone');
            if(lampLightCone && lampEmpty){lampEmpty.remove(lampLightCone);}
        };

    
    let showcaseVideoSrc = '/videos/grass_hills.mp4'

    let video: HTMLVideoElement;
    let videoTexture: THREE.VideoTexture;
    let videoTextureContainer: HTMLElement;
    $: if($gltf && showcaseVideoSrc && videoTextureContainer){
        videoTextureContainer.innerHTML = '';
        video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        const videoSourceEl: HTMLSourceElement = document.createElement('source');
        videoSourceEl.src = showcaseVideoSrc;
        video.append(videoSourceEl);
        if(videoTexture){
            videoTexture.dispose();
        }
        video.play();
        console.log('setting video texture', video.children[0]);
        videoTexture = new THREE.VideoTexture( video );
        const videoScreen = $gltf.scene.getObjectByName('computer_2');
        if(videoScreen instanceof THREE.Mesh){
            videoScreen.material = new THREE.MeshPhongMaterial({color: 'white', map: videoTexture});
        }

    }
</script>


<div bind:this={videoTextureContainer}></div>
<GLTF interactive on:click={() => {
    showcaseVideoSrc = '/videos/pink_tunnel.mp4';
  }} bind:gltf={$gltf} url={'/models/deskShowcase2.gltf'}></GLTF>
{#if tastenEmpty}
    <Object3D position={tastenEmpty.position} rotation={tastenEmpty.rotation}>
        {#each tastenEmpty.children as keyChild}
            <Mesh visible={false} position={keyChild.userData.originalPos} rotation={keyChild.rotation} geometry={keyChild.geometry} material={keyChild.material}
                interactive
                on:pointerenter={() => {keyChild.position.y -= 0.02}}
                on:pointerleave={() => {keyChild.position.y += 0.02}}>
            </Mesh>
        {/each}
    </Object3D>
{/if}
{#if lampEmpty && lampLightCone}
    <Object3D position={lampEmpty.position} rotation={lampEmpty.rotation} scale={lampEmpty.scale}>
        {#if lampLightCone instanceof THREE.Mesh}
            <Mesh ignorePointer 
                geometry={lampLightCone.geometry} material={lampLightCone.material}
                position={lampLightCone.position} rotation={lampLightCone.rotation} scale={lampLightCone.scale}
            ></Mesh>
        {/if}
    </Object3D>
{/if}