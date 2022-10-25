<script lang="ts">
    import { PerspectiveCamera, PointLight, InstancedMesh, Instance, useThrelte, useFrame, type ThrelteContext} from '@threlte/core';
	import { useGltf, type ThrelteGltf } from '@threlte/extras';

	import { onMount } from 'svelte/internal';
	import type { Writable } from 'svelte/store';
    import { SphereGeometry, MeshPhongMaterial, BufferGeometry, Material, Mesh, Vector3, Vector2, BoxGeometry, RGB_PVRTC_2BPPV1_Format} from 'three';

    export let amount = 3;
    export let lineStart: Vector3 = new Vector3(0,0,0);
    export let lineEnd: Vector3 = new Vector3(1,0,0);
    export let gltfOrigin: string;

    let geoLeft: BufferGeometry;
    let materialLeft: Material;
    let geoRight: BufferGeometry;
    let materialRight: Material;
    let gltf: Writable<ThrelteGltf<any, any> | undefined>;
    $: {
        if(gltfOrigin){console.log('Fetching ', gltfOrigin); ({gltf} = useGltf(gltfOrigin));}
    }
    
    const placeholder = new Mesh(new SphereGeometry(0.5, 3, 3), new MeshPhongMaterial({color: 'pink'}));
    [geoLeft, geoRight] =  [placeholder.geometry, placeholder.geometry];
    [materialLeft, materialRight] = [placeholder.material, placeholder.material];
    let time = 0;
    let pointer = new Vector2(0, 0);
    useFrame((ctx: ThrelteContext) => {
        time = ctx.clock.getElapsedTime();
        ctx.pointer.subscribe((val) => {
            pointer = val;
        })
    });
    onMount(() => {
        gltf.subscribe((val) => {
            if(!val) return;
            if(!val.nodes['left'] || !val.nodes['right'] || !(val.nodes['left'] instanceof Mesh) || !(val.nodes['right'] instanceof Mesh)) return;
            geoLeft = val.nodes['left'].geometry;
            geoRight = val.nodes['right'].geometry;
        })
        
    });


</script>

<PerspectiveCamera fov={90} position={{ x: 0, y: 0, z: 0 }}/>
<PointLight color={'pink'} intensity={2} distance={55} position={{ y: 50 }} />
<PointLight color={'pink'} intensity={2} distance={55} position={{ y: 0 }} />
{#if $gltf}
    <InstancedMesh id="left" geometry={geoLeft} material={materialLeft}>
        <InstancedMesh id="right" geometry={geoRight} material={materialRight}>
            {#each Array(amount*2) as _, index (index)}
                <Instance id={index < amount ? 'left' : 'right'}
                    position={{x: (index < amount ? -1 : 1)*(((index % amount)+1)), y: Math.sin(time), z: (index % amount)+1 * -5}}
                    rotation={{x: pointer.y, y:(index < amount ? -1 : 1)*time}}
                    scale={{x:2, y:2, z:2}}
                ></Instance>
            {/each}
        </InstancedMesh>
    </InstancedMesh>
{:else }
<InstancedMesh geometry={placeholder.geometry} 
{/if}
