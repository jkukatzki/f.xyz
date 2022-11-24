<script lang="ts">

    import { Experience } from '$lib/components/fogeo/fogeo'; 

	import AtopoBackground from '$lib/components/experiences/background/AtopoBackground.svelte';



    
	import * as THREE from 'three';
	import { onMount } from 'svelte';


    const globalPointer = new THREE.Vector2(0.5, 0.5);
    onMount(() => {
        document.addEventListener('mousemove', (e) => {
            globalPointer.set(e.clientX/window.innerWidth, e.clientY/window.innerHeight);
        });
    });
    
</script>

<div id="background-threejs-render">
    <Experience>
        <AtopoBackground globalPointer={globalPointer}></AtopoBackground>>
    </Experience>
</div>
<div id="front">           
    <p id="intro">
        Willkommen!<br>
        Wir sind atopo, ein Kollektiv.<br>
        <br>
    </p>
    <p id="showcase-text">
        
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
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
      width: 100%;
      height: 100%;
      z-index: -1;
  }

  #front {
      width: 90%;
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
  }

  #showcase-threejs-render {
      width: 120vw;
      height: 100vh;
      max-height: 70vw;
      transform: translateX(-20%);
      min-width: 20em;
      min-height: 100%;
  }


</style>
