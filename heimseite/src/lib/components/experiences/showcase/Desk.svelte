<script context="module" lang="ts">
    import * as THREE from 'three';


    import {
        GLTF, useGltfAnimations
    } from '@threlte/extras'
</script>
<script lang="ts">
	import { InteractiveObject, Mesh } from "@threlte/core";
	import { MeshBasicMaterial } from "three";


    const { gltf, actions, mixer } = useGltfAnimations(({ actions }) => {
        console.log('Following actions found for gltf: ', actions);
        actions['face_expression']?.play();
        actions['idle']?.play();
    });

    let key: THREE.Mesh;
    let keyPosition: THREE.Vector3;
    $: if($gltf) {
            console.log('gltf:', $gltf);
            const tastenEmpty = $gltf.scene.getObjectByName('tasten_empty');
            /* tastenEmpty?.children.forEach((child) => {
                console.log('das ne taste', child);
                if(child instanceof THREE.Mesh){
                    key = new THREE.Mesh(child.geometry, child.material);
                }
            }); */
            let child = tastenEmpty?.children[0];
            console.log('das ne taste', child);
            if(child instanceof THREE.Mesh){
                key = new THREE.Mesh(child.geometry, child.material);
                keyPosition = child.position;
            }
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

    const onHover = (obj: THREE.Object3D) => {
        obj.position.setY(obj.position.y-0.5);
        console.log('HIIIIIIIIT');
    }


</script>


<div bind:this={videoTextureContainer}></div>
<GLTF interactive on:click={() => {
    showcaseVideoSrc = '/videos/pink_tunnel.mp4';
  }} bind:gltf={$gltf} url={'/models/deskShowcase2.gltf'}></GLTF>
{#if key}
    <Mesh position={{x: keyPosition.x, y: keyPosition.y, z: keyPosition.z}} geometry={key.geometry} material={key.material} interactive on:pointerenter={() => {console.log('pls'); onHover(key)}}></Mesh>
    <InteractiveObject object={key} interactive on:pointerenter={() => {console.log('pls'); onHover(key)}}></InteractiveObject>    
{/if}


<!--     <Mesh interactive on:pointerenter={() => {key.position.setY(key.position.y -0.5)}} geometry={new THREE.SphereGeometry()} material={new THREE.MeshBasicMaterial()}></Mesh> -->