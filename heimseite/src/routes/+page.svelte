<script lang="ts">
    import {onMount} from 'svelte';
	import WavyGrid from '$lib/components/experiences/background/WavyGrid.svelte';
    import {Canvas} from '@threlte/core';
    let titleLogoSrc = '/images/title/gothic_tag_logo.png';
    let titleVideoSrc = '/videos/cat_low.mp4';
    let backgroundSize = {width: 100, height: 100}
    onMount(() => {
        //render sizes
        backgroundSize = {width: window.innerWidth, height: window.innerHeight}
        
    });
</script>

<div id="background-threejs-render">
    <Canvas size={backgroundSize}>
        <WavyGrid></WavyGrid>
    </Canvas>
</div>
<div id="front">
    <div id="title">
        <div id="title-threejs-aspect-wrapper">
            <div id="title-threejs-render">
                <video 
                id="title-middle-video"
                class="cat-mask"
                loop muted disableRemotePlayback>
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
    <p id="showcase-text">
        dings 3D ist cool und so lorem ipsum mipsum forum salve sklave christus sheeshstus silentium por favor blalnalbllalllalallalbllblbubububuufuf
    </p>
    <div id="showcase-threejs-aspect-wrapper">
        <div id="showcase-threejs-render"></div>
    </div>
</div>

<style>

    :global(body) {
        background-color: black;
        margin: 0;
    }
  @font-face {
      font-family: "roboto";
      src: url(fonts/Roboto-Regular.ttf);
  }
  #background-threejs-render {
      position: fixed;
      z-index: -1;
  }

  #front {
      width: 85%;
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
      cursor: none;
      height: 70%;
      left: 50%;
      top: 50%;
      -webkit-transform: translate(-50%, -50%);
      -moz-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      position:absolute;
  }

  .cat-mask  {
      -webkit-mask-image:url(images/title/mask_cat.png);
      -webkit-mask-position:center center;
      -webkit-mask-repeat:no-repeat;
      -webkit-mask-size:contain;
    
      mask-image:url(images/title/mask_cat.png);
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

  #showcase-text {
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

  #showcase-threejs-aspect-wrapper {
      position: relative;
      margin-left: 3em;
  }

  #showcase-threejs-render {
      width: 50vw;
      height: 37.5vw;
      min-width: 20em;
      min-height: 15em;
  }
</style>
