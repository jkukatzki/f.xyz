<script lang="ts">

    import { Experience } from '$lib/components/fogeo/fogeo'; 
	import WavyGrid from '$lib/components/experiences/background/WavyGrid.svelte';
    import SpinningStuff from '$lib/components/experiences/title/SpinningStuff.svelte';
    import Desk from '$lib/components/experiences/showcase/Desk.svelte';
    import Skills from '$lib/components/Skills.svelte';

    import { PerspectiveCamera, PointLight, SpotLight, AmbientLight, OrbitControls} from '@threlte/core';
    
	import * as THREE from 'three';
	import { onMount } from 'svelte';

    let titleLogoSrc = '/images/title/gothic_tag_logo.png';
    let titleVideoSrc = '/videos/cat_low.mp4';


    let pausedTitle = true;

    const globalPointer = new THREE.Vector2(0.5, 0.5);
    onMount(() => {
        document.addEventListener('mousemove', (e) => {
            globalPointer.set(e.clientX/window.innerWidth, e.clientY/window.innerHeight);
        });
    });
    
</script>

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
                        <PointLight color={"#ff9cd7"} intensity={(pausedTitle ? 0.5 : 0.3)} distance={100} position={{ z: -0.5 }} />
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
                on:mouseenter={(e) => {pausedTitle = false}}
                on:mouseleave={(e) => {pausedTitle = true}}>
                    <source src="{titleVideoSrc}" type="video/mp4">
                </video>
                <img alt="fogings" class="logo" src="{titleLogoSrc}">
            </div>
        </div>
    </div>
    <p id="intro">
        Hey! Schön, dass du da bist :-)<br>
        Ich bin Jona - aka fogings - und du befindest dich auf meiner Seite.<br>
        <br>
        Schau dich gerne um, machs dir gemütlich, fühl dich wohl.<br>
        Kann ich dir 'ne Tasse Tee oder so anbieten?
    </p>
    <div style="position:absolute; height: 100%; width: 100%">
        <div id="mobile-showcase-text-pusher"></div>
        <p class="showcase-text">
            Das Gesamte hier soll einen Einblick geben in das, was ich gerne verfolge:<br>
            
            Visuell kreativ zu sein und dabei insbesondere das Zeichnen, bereitet mir Freude, seitdem ich denken kann.
            Zusammen mit dem Programmieren habe ich mittlerweile eine Methodik entwickelt, mit der es mir gelingt, digitale Erfahrungen verschiedenster Art zu erschaffen.
            Ich strebe stets danach, einen Stil für mich zu finden, der sowohl unabhängig von Trends ist als auch mir persönlich am meisten gefällt und trotzdem einer ansprechenden Ästhetik folgt.
    
        </p>
    </div>
    
    <div id="showcase-threejs-render">
        <Experience><!-- studioWorkspace={"layout"}> -->
            <PerspectiveCamera fov={40} position={{x: 5.05, y: 0.72, z: 2.42}} rotation={{x: 0, y: 1.11}}>
                <OrbitControls enablePan={false} enableZoom={false} enableDamping target={{y: 0.9}}></OrbitControls>
            </PerspectiveCamera>
            <Desk></Desk>
        </Experience>
    </div>
    <p id="mobile-skills-pusher" class="showcase-text">
        Das Gesamte hier soll einen Einblick geben in das, was ich gerne verfolge:<br>
        
        Visuell kreativ zu sein und dabei insbesondere das Zeichnen, bereitet mir Freude, seitdem ich denken kann.
        Zusammen mit dem Programmieren habe ich mittlerweile eine Methodik entwickelt, mit der es mir gelingt, digitale Erfahrungen verschiedenster Art zu erschaffen.
        Ich strebe stets danach, einen Stil für mich zu finden, der sowohl unabhängig von Trends ist als auch mir persönlich am meisten gefällt und trotzdem einer ansprechenden Ästhetik folgt.

    </p>
    <div id="showcase-placeholder"></div>
    <Skills></Skills>
</div>

<style lang="postcss">

    @media (max-aspect-ratio: 3/4) {
        #mobile-showcase-text-pusher {
            height: 100vh;
            max-height: 70vw;
        }
        .showcase-text {
            width: 70% !important;
            right: unset !important;
            left: 45%;
            -webkit-transform: translate(-47.5%, 0%);
            -moz-transform: translate(-47.5%, 0%);
            transform: translate(-47.5%, 0%);
        }
        #mobile-skills-pusher {
            width: 70% !importantf;
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
    @media (min-aspect-ratio: 3/4) and (max-aspect-ratio: 1/1) {

    }
    @media (min-aspect-ratio: 1/1) and (max-aspect-ratio: 4/3) {

    }
    @media (min-aspect-ratio: 4/3) {

    }

    :global(body) {
        background-color: black;
        margin: 0;
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
        margin-top: 5em;
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
      padding: 1.5em;
      color: rgba(248, 213, 238, 0.801);
      text-align: left;
      transform: translateX(10%);
      width: 40%;

      font-size: 16px;
      font-family: 'roboto';
      
      
      border-radius: 10px;
      background-color:rgba(20, 4, 24, 0.75);
  }

  .showcase-text {
      position: absolute;
      margin-top: 1em;
      padding: 1.5em;
      color: rgba(248, 213, 238, 0.801);
      text-align: left;
      width: 40%;
      right: 15vw;
      font-size: 16px;
      font-family: 'roboto';

      border-radius: 10px;
      background-color:rgba(20, 4, 24, 0.75);
  }

  #mobile-skills-pusher {
    visibility: collapse;
  }

  #showcase-threejs-render {
      width: 90vw;
      height: 100vh;
      max-height: 70vw;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
  }
  #showcase-placeholder {
    height: 100vh;
    max-height: 70vw;
  }


</style>
