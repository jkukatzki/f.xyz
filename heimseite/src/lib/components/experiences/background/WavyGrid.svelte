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
</script>
<script lang="ts">


    export let globalPointer: Vector2 = new Vector2(0.5, 0.5);

    const geo: BufferGeometry = new PlaneGeometry(35, 35, 25, 25);
    const gridSineSourceEmpty = new Vector2(0.5, 0.5);
    useFrame((ctx: ThrelteContext) => {
        gridSineSourceEmpty.set((globalPointer.x-0.5)*((Math.abs(globalPointer.y-1)+1)*20), (Math.abs(globalPointer.y-1)-0.5)*12);
        for(let i = 0; i < geo.attributes.position.count; i++){
            let dist = gridSineSourceEmpty.distanceTo(new Vector2(geo.attributes.position.getX(i), geo.attributes.position.getY(i)));
            const sinDist = Math.sin(dist+ctx.clock.getElapsedTime()/2);
            geo.attributes.position.setZ(i, sinDist);
        }
        geo.attributes.position.needsUpdate = true;
    });
    
</script>

<Fog color={'rgb(0,0,0)'} near={0} far={25}></Fog>
<PerspectiveCamera fov={90} position={{x:0, y:3, z:15}}></PerspectiveCamera>
<PointLight color={'pink'} intensity={4} distance={55} position={{y:50}}></PointLight>
<Mesh geometry={geo}
    rotation={{ x : -(Math.PI / 2) }}
    material={new MeshStandardMaterial({wireframe: true, color: 'pink'})}
></Mesh>
