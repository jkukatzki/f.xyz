<script context="module" lang="ts">
    import * as THREE from 'three';


    import {
        GLTF, useGltfAnimations
    } from '@threlte/extras'
</script>
<script lang="ts">

    const { gltf } = useGltfAnimations<'idle'>(({ actions }) => {
        actions['idle']?.play();
    });

    $: if($gltf) console.log('gltf:', $gltf);

    
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
  }} bind:gltf={$gltf} url={'/models/deskShowcase.glb'}></GLTF>
