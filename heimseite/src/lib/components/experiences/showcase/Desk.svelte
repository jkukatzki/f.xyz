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
        actions['mouse_cursor_action']?.play();
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

    
    let showcaseItems: { path: string, videoMaterial?: THREE.Material, video?: HTMLVideoElement}[] = [
        { path: '/videos/grass_hills.mp4'},
        { path: '/videos/do_nut.mp4'},
        { path: '/videos/pink_tunnel.mp4'},
        { path: '/videos/flesh_ball.mp4'},
        
        
    ]

    let videoScreenMesh: THREE.Mesh;
    let mouseCursorMesh: THREE.Object3D | undefined;
    let mouseCursorVisible = true;
    let currentVideoIndex = 0;
    let prevVideoIndex: number | undefined;
    $: if($gltf){
        
        if(!videoScreenMesh){
            prevVideoIndex = 0;
            let screen = $gltf.scene.getObjectByName('crt_screen_portrait_1');
            if(screen instanceof THREE.Mesh){
                videoScreenMesh = screen;
            }
        }
        if(!mouseCursorMesh){
            mouseCursorMesh = $gltf.scene.getObjectByName('mouse_cursor');
        }
        if(prevVideoIndex !== undefined){
            showcaseItems[prevVideoIndex].video?.pause();
        }
        prevVideoIndex = currentVideoIndex;

        let showcaseItem = showcaseItems[currentVideoIndex];

        if(showcaseItem.videoMaterial){
            showcaseItem.video?.play();
            videoScreenMesh.material = showcaseItem.videoMaterial;
        } else {
            const video = document.createElement('video');
            video.muted = true;
            video.loop = true;
            const videoSourceEl: HTMLSourceElement = document.createElement('source');
            videoSourceEl.src = showcaseItem.path;
            video.append(videoSourceEl);
            video.play();
            console.log('setting video texture', video.children[0]);
            const videoTexture = new THREE.VideoTexture( video );
            const tmp = new THREE.MeshPhongMaterial({color: 'white', map: videoTexture});
            videoScreenMesh.material = tmp;
            showcaseItem.videoMaterial = tmp;
            showcaseItem.video = video;
        }
    }
</script>

<GLTF  bind:gltf={$gltf} url={'/models/deskShowcase.gltf'}></GLTF>
{#if tastenEmpty}
    <Object3D position={tastenEmpty.position} rotation={tastenEmpty.rotation} scale={tastenEmpty.scale}>
        {#each tastenEmpty.children as keyChild}
            <Mesh visible={false} position={keyChild.userData.originalPos} rotation={keyChild.rotation} scale={{x: 1.1, y: 1.1, z: 1.1}} geometry={keyChild.geometry} material={keyChild.material}
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
{#if videoScreenMesh instanceof THREE.Mesh && videoScreenMesh.parent && mouseCursorMesh}
    <Object3D position={videoScreenMesh.parent.position.clone().add(new THREE.Vector3(0.01, 0, 0.02))} rotation={videoScreenMesh.parent.rotation} scale={videoScreenMesh.parent.scale}>
        <Mesh visible={false} geometry={videoScreenMesh.geometry} material={new THREE.MeshStandardMaterial()} interactive on:click={() => {
            currentVideoIndex = (currentVideoIndex+1) % showcaseItems.length; if(mouseCursorVisible){mouseCursorMesh.visible = false; mouseCursorVisible = false;};}}>
        </Mesh>
    </Object3D>
    
{/if}