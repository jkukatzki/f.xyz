<script lang="ts">
    import type { Writable } from 'svelte/store';

    import {PlaneGeometry, MeshStandardMaterial, Vector2, BufferGeometry, Clock, Color} from 'three';

    import {
        PerspectiveCamera,
        Mesh,
        PointLight,
        useFrame,
		useThrelte,
		type ThrelteContext
    } from '@threlte/core'

    let plane: THREE.Mesh;
    const context: ThrelteContext = useThrelte();
    const pointer: Writable<Vector2> = context.pointer;
    const clock: Clock = context.clock;
    if(context.renderer){
        context.renderer.setClearColor(new Color(0,0,0))
    }
    const invalidate = context.invalidate;
    const gridSineSourceEmpty = new Vector2(0.5, 0.5);
    useFrame(() => {
        const geo: BufferGeometry = plane.geometry;
        gridSineSourceEmpty.set((($pointer.x)-0.5)*(1+2*Math.abs($pointer.y-1)), Math.abs($pointer.y-1)-0.5);
        for(let i = 0; i < geo.attributes.position.count; i++){
            let dist = gridSineSourceEmpty.distanceTo(new Vector2(geo.attributes.position.getX(i), geo.attributes.position.getY(i)));

            const timeAdd = clock.getElapsedTime();
            const sinDist = Math.sin(dist+timeAdd);
            geo.attributes.position.setZ(i, sinDist);
        }
        geo.attributes.position.needsUpdate = true;
        invalidate();
    });
    
    



</script>

<PerspectiveCamera fov={90} position={{x:0, y:3, z:15}}></PerspectiveCamera>
<PointLight color={'pink'} intensity={4} distance={55} position={{y:50}}></PointLight>
<Mesh bind:mesh={plane}
    rotation={{ x : -(Math.PI / 2) }}
    geometry={new PlaneGeometry(50, 30, 50/1.5-((50/1.5) % 2), 30/1.5-((30/1.5) % 2))}
    material={new MeshStandardMaterial({wireframe: true, color: 'pink'})}
></Mesh>
