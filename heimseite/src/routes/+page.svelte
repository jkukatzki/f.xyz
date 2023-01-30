<script lang="ts">

    import { Experience } from '$lib/components/fogeo/fogeo'; 
	import WavyGrid from '$lib/components/experiences/background/WavyGrid.svelte';
    import SpinningStuff from '$lib/components/experiences/title/SpinningStuff.svelte';
    import Desk from '$lib/components/experiences/showcase/Desk.svelte';
    import Skills from '$lib/components/Skills.svelte';

    import { PerspectiveCamera, PointLight, SpotLight, AmbientLight, OrbitControls} from '@threlte/core';
    
	import * as THREE from 'three';
	import { onMount } from 'svelte';
    import { spring } from 'svelte/motion';
    import { tweened } from 'svelte/motion';

    let currentLogoIndex = 0;
    const titleLogoArray = [
        'gothic_tag_low.png',
        'throwie_low.png',
        'clean_tag_low.png',
            
    ]
    let titleVideoSrc = '/videos/cat_lower.mp4';


    let pausedTitle = true;
    const spiralsLight = tweened(0.25);
    const globalPointer = spring({x: 0.5, y: 0.5});
    onMount(() => {
        document.addEventListener('mousemove', (e) => {
            globalPointer.set({x: e.clientX/window.innerWidth, y: e.clientY/window.innerHeight});
        });
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            globalPointer.set({x: touch.clientX/window.innerWidth, y: touch.clientY/window.innerHeight});
        });
        
    });
    
    let deskCamera: THREE.PerspectiveCamera;
    let deskCameraReadjust = spring(0, {damping: 1});
    
    let readjustCamera = () => {
        const tmp = Math.abs(deskCamera.position.x)/10;
        if(tmp > 0.1){
            deskCameraReadjust.set(tmp).then(() => {setTimeout(() => {
                deskCameraReadjust.set(0)
            }, 1000); });
        }
    }
    $: if(deskCamera){
        deskCamera.position.set(0, 0.59, 2.1)
    }

    let showcaseText = `Das Gesamte hier soll einen kleinen Einblick geben in das, was ich gerne verfolge: <br>
            
            Visuell kreativ zu sein und dabei insbesondere das Zeichnen bereitet mir schon lange Freude.
            Zusammen mit dem Programmieren versuche ich dauerhaft eine Methodik weiterzuentwickeln, mit der es mir gelingt, auf einfache Weise digitale Erfahrungen verschiedenster Arten zu erschaffen.
            Dabei strebe ich stets danach, einen Stil für mich zu finden, der sowohl unabhängig von Trends ist als auch mir persönlich am meisten gefällt und trotzdem einer ansprechenden Ästhetik folgt.`

</script>

<svelte:head>
	<title>fogings.xyz</title>
</svelte:head>
<div id="background-threejs-render">
    <Experience>
        <WavyGrid globalPointer={globalPointer}></WavyGrid>
    </Experience>
</div>
<div id="front">
    <div id="title">
        <div id="title-threejs-aspect-wrapper">
            <div id="title-threejs-render">
                <div style="position:absolute; width:100%; height:100%">
                    <Experience>
                        <PerspectiveCamera fov={83} position={{ x: 0, y: 0, z: 1.55 }}/>
                        <PointLight color={"#ff9cd7"} intensity={$spiralsLight} distance={100} position={{ z: -0.5 }} />
                        <PointLight color={"blue"} intensity={0.3} distance={100} position={{z: -5}} />
                        <SpotLight color={"white"} intensity={0.15} distance={60} position={{z: 5}} angle={2}></SpotLight>
                        <SpinningStuff gltfOrigin="/models/spirals.glb" lineStart={new THREE.Vector3(1.2, 0, 0)} lineEnd={new THREE.Vector3(4.8, 0, -1.3)} globalPointer={globalPointer}></SpinningStuff>
                    </Experience>
                </div>
                <!--'e.currentTarget.paused = false?'-->
                <video 
                id="title-middle-video"
                class="cat-mask"
                loop muted disableRemotePlayback
                bind:paused={pausedTitle}
                on:mouseenter={(e) => {pausedTitle = false; spiralsLight.set(0.6);}}
                on:mouseleave={(e) => {pausedTitle = true; spiralsLight.set(0.25);}}
                on:click={(e) => {currentLogoIndex = (currentLogoIndex+1) % titleLogoArray.length}}>
                    <source src="{titleVideoSrc}" type="video/mp4">
                </video>
                <img alt="fogings" class="logo" src="{'/images/title/logo/'+titleLogoArray[currentLogoIndex]}">
            </div>
        </div>
    </div>
    <p id="intro" class="text-card">
        Hey! Schön, dass du da bist :-)<br>
        Ich bin Jona - aka fogings - und du befindest dich auf meiner Seite.<br>
        <br>
        Schau dich gerne um, machs dir gemütlich, fühl dich wohl.<br>
        Kann ich dir 'ne Tasse Tee oder so anbieten?
    </p>
    <div style="position:absolute; width: 100%; left: 0">
        <div id="mobile-showcase-text-pusher"></div>
        <p class="showcase-text text-card">
            {@html showcaseText}
        </p>
    </div>
    
    <div id="showcase-threejs-render">
        <Experience studioWorkspace={"layout"} reenableTouchPan={true} indicateProgress={true}>
            <PerspectiveCamera bind:camera={deskCamera} fov={40} position={{x: 0.0, y: 0.39, z: 1.9}}>
                <OrbitControls on:end={readjustCamera} enablePan={false} enableZoom={false} enableDamping target={{y: 0.34}} maxPolarAngle={1.63} minPolarAngle={1.45+$deskCameraReadjust} minAzimuthAngle={-0.6} maxAzimuthAngle={0.6}></OrbitControls>
            </PerspectiveCamera>
            <Desk></Desk>
        </Experience>
        <div style="background-color: red; opacity: 50%"></div>
    </div>
    <p id="mobile-skills-pusher" class="showcase-text text-card">
        {@html showcaseText}
    </p>
    <div class="ender-desktop">
        <div style="display: flex; justify-content: space-around; align-items: center;">
            <img style="width: 100%; height: 100%; max-width: 30vw; pointer-events: none; margin-left: 2em; transform: scale(1.3)" src="/images/work_with_me.png" alt="please work with me">
            <div style="max-width: 50vw; align-self: center; margin-right: 2em; padding-top: 2em;">
                <div class="text-card" style="max-width: 40em; font-size: 20px;">
                    Meine Kenntnisse beinhalten unter anderem diese Bereiche:
                </div>
                <div class="text-card" style="display: flex; justify-content: space-around; white-space: nowrap; overflow: hidden; margin-top: 0.4em;">
                    <Skills></Skills>
                </div>
                <div class="text-card center-horiz-rel" style="font-size: 22px; width: 80%; margin-top: 0.4em;">
                    Kontaktiere mich:
                    <div>
                        <span><img src="/images/logos/email.svg" style="margin: 0.15em; width: 1.5em; top: 0.6em; left: -0.1em; position: relative;"></span>
                        <a href="mailto:j.kukatzki@gmail.com" style="color: white; -webkit-user-select: none; -ms-user-select: none; user-select: none;">j.kukatzki@gmail.com</a>
                    </div>
                    <div>
                        <span><img src="/images/logos/instagram-logo.svg" style="margin: 0.15em; width: 1.3em; top: 0.5em; position: relative;"></span>
                        <a href="https://www.instagram.com/cooktildone/" target="_blank" rel="noreferrer" style="color: white; -webkit-user-select: none; -ms-user-select: none; user-select: none;">@cooktildone</a>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    <div class="ender-mobile">
        <div class="text-card center-horiz-rel" style="width: 50%; max-width: 30em;">
            Meine Kenntnisse beinhalten unter anderem diese Bereiche:
        </div>
        <div class="text-card skills" style="white-space: nowrap; max-width: 80%; overflow: hidden; margin-top: 0.4em;">
            <Skills></Skills>
        </div>
        <img class="center-horiz-rel" style="width: 80%; max-width: 70vw; pointer-events: none; transform: translateX(-51%)" src="/images/work_with_me.png" alt="please work with me">
        <div class="text-card center-horiz-rel" style="font-size: 22px; width: 50%; text-align: center; ">
            Kontaktiere mich:
            <div>
                <span><img src="/images/logos/email.svg" style="margin: 0.15em; width: 1.5em; top: 0.6em; position: relative;"></span>
                <a href="mailto:j.kukatzki@gmail.com" style="color: white; -webkit-user-select: none; -ms-user-select: none; user-select: none;">j.kukatzki@gmail.com</a>
            </div>
            <div>
                <span><img src="/images/logos/instagram-logo.svg" style="margin: 0.15em; width: 1.3em; top: 0.5em; position: relative;"></span>
                <a href="https://www.instagram.com/cooktildone/" target="_blank" rel="noreferrer" style="color: white; -webkit-user-select: none; -ms-user-select: none; user-select: none;">@cooktildone</a>
            </div>
        </div>
    </div>
    
</div>

<style lang="postcss">

    .ender-mobile {
        display: none;
    }

    .center-horiz-abs {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
    .center-horiz-rel {
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }

    .skills {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    @media (max-aspect-ratio: 29/32) {
        #front {
            width: 95vw !important;
            margin-top: 1em !important;
        }
    }

    @media (max-aspect-ratio: 31/32) {
        .ender-desktop {
            display: none;
        }
        .ender-mobile {
            display: block;
        }
        .skills {
            position: relative !important;
        }
        #mobile-showcase-text-pusher {
            height: 100vh;
            max-height: 46vw;
        }
        .showcase-text {
            width: 70% !important;
            right: unset !important;
            left: 50%;
            -webkit-transform: translateX(-50%);
            -moz-transform: translateX(-50%);
            transform: translateX(-50%) !important;
        }
        #mobile-skills-pusher {
            visibility: hidden;
            position: relative !important;
        }
        #intro {
            width: 70% !important;
            position: relative;
            left: 50%;
            transform: translateX(-50%) !important;
        }
    }

    :global(body) {
        background-color: black;
        margin: 0;
        overflow-x: hidden;
    }

    @font-face {
        font-family: "roboto";
        src: url(/fonts/Roboto-Regular.ttf);
    }

    #background-threejs-render {
        position: fixed;
        width: 100%;
        height: 100%;
        z-index: -1;
    }

    #front {
        height: 100%;
        width: 90vw;
        margin: auto;
        margin-top: 3em;
        padding-bottom: 5em;
        background-color: rgb(80 42 89 / 30%);
        border-left: pink 1px solid;
        border-right: pink 1px solid;
    }

  #title {
      padding-top: 2em;
      padding-bottom: 40%;
  }

  .logo {
      height: 40%;
      left: 50%;
      -webkit-transform: translate(-50%, 0%);
      -moz-transform: translate(-50%, 0%);
      transform: translate(-50%, 0%);
      position:absolute;
  }

  #title-middle-video {
      cursor: crosshair;
      height: 70%;
      left: 50%;
      top: 50%;
      -webkit-transform: translate(-50%, -50%);
      -moz-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      position:absolute;
  }

  .cat-mask  {
      -webkit-mask-image:url(/images/title/mask_cat.png);
      -webkit-mask-position:center center;
      -webkit-mask-repeat:no-repeat;
      -webkit-mask-size:contain;
    
      mask-image:url(/images/title/mask_cat.png);
      mask-position:center center;
      mask-repeat:no-repeat;
      mask-size:contain;
  }


    #title-threejs-aspect-wrapper {
        position: relative;
    }

    #title-threejs-render {
        padding-bottom: 40%;
        height: 100%;
        width: 100%;
        max-width: 80vw;
        left: 50%;
        -webkit-transform: translate(-50%, 0%);
        -moz-transform: translate(-50%, 0%);
        transform: translate(-50%, 0%);
        position: absolute;
    }

    #intro {
        transform: translateX(10%);
        width: 25%;
    }

    .text-card {
        padding: 1.5em;
        color: rgba(248, 213, 238, 0.801);
        font-size: 16px;
        font-family: 'roboto';
        border-radius: 10px;
        background-color:rgba(20, 4, 24, 0.75);
        text-align: left;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .showcase-text {
        position: absolute;
        margin-top: 1em;
        width: 40%;
        right: 8vw;
        transform: translateY(-90%);
    }

    #mobile-skills-pusher {
        visibility: collapse;
    }

    #showcase-threejs-render {
        width: 90vw;
        height: 100vh;
        max-height: 46vw;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }


</style>
