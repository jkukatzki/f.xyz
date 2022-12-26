<script lang="ts">
    import { PerspectiveCamera, PointLight, InstancedMesh, Instance, useThrelte, useFrame, type ThrelteContext} from '@threlte/core';
	import { useGltf, type ThrelteGltf } from '@threlte/extras';
	import { spring, type Spring } from 'svelte/motion';

	import type { Writable } from 'svelte/store';
    import { ConeGeometry, MeshPhongMaterial, BufferGeometry, Material, Mesh, Vector3, Vector2 } from 'three';

    export let amount = 3;
    export let lineStart: Vector3 = new Vector3(0,0,0);
    export let lineEnd: Vector3 = new Vector3(1,0,0);
    export let gltfOrigin: string;
    export let globalPointer: Spring<{x: number, y: number}> = spring({x: 0.5, y: 0.5});
    //TODO: put this in a $: ?
    let lineStartMirrorX: Vector3 = lineStart.clone().setX(lineStart.x*-1);
    let lineEndMirrorX: Vector3 = lineEnd.clone().setX(lineEnd.x*-1)

    let geoLeft: BufferGeometry;
    let materialLeft: Material;
    let geoRight: BufferGeometry;
    let materialRight: Material;
    let gltf: Writable<ThrelteGltf<any> | undefined>;
    
    $: {
        if(gltfOrigin){console.log('Fetching ', gltfOrigin); ({gltf} = useGltf(gltfOrigin));}
    }
    $: if($gltf && $gltf.nodes['left'] instanceof Mesh && $gltf.nodes['right'] instanceof Mesh) { geoLeft = $gltf.nodes['left'].geometry; geoRight = $gltf.nodes['right'].geometry; }
    
    const placeholder = new Mesh(new ConeGeometry(0.2, 0.8, 3), new MeshPhongMaterial({color: 'pink'}));
    [geoLeft, geoRight] =  [placeholder.geometry, placeholder.geometry];
    [materialLeft, materialRight] = [placeholder.material, placeholder.material];
    let time = 0;
    
    useFrame((ctx: ThrelteContext) => {
        time = ctx.clock.getElapsedTime();
    });


    function mix(val: number, toMixBetween: number[]){
        return (1-val)*toMixBetween[0]+val*toMixBetween[1]
    }

    function calcInstancePos(i: number): Vector3 {
        const linePoints = (i < amount ? [lineStartMirrorX.clone(), lineEndMirrorX.clone()] : [lineStart.clone(), lineEnd.clone()]);
        const indexNormalized = (i % amount);
        const travel = linePoints[1].sub(linePoints[0]).divideScalar(amount).multiplyScalar(indexNormalized);
        const pos = linePoints[0].add(travel);
        return pos;
    };
    const rotXLinear = [-1.1, 0.3]
    function calcInstanceRot(i: number, time: number): Vector3 {
        const sideX = (i < amount ? 1 : -1);
        const indexNormalized = (i % amount);
        return new Vector3(
            mix($globalPointer.y, rotXLinear),
            sideX*time*mix(indexNormalized/amount-1, sclLinear),
            0
        );
    }
    const sclLinear = [1, 0.2];
    function calcInstanceScl(i: number): Vector3 {
        const indexNormalized = (i % amount);
        const scale = mix(indexNormalized/amount-1, sclLinear);
        return new Vector3(scale, scale, scale);
    }

</script>


{#if $gltf}
    <InstancedMesh id="left" geometry={geoLeft} material={materialLeft}>
        <InstancedMesh id="right" geometry={geoRight} material={materialRight}>
            {#each Array(amount*2) as _, index (index)}
                <Instance id={index < amount ? 'left' : 'right'}
                    position={calcInstancePos(index)}
                    rotation={calcInstanceRot(index, time)}
                    scale={calcInstanceScl(index)}
                ></Instance>
            {/each}
        </InstancedMesh>
    </InstancedMesh>
{:else}
    <InstancedMesh geometry={placeholder.geometry} material={placeholder.material}>
        {#each Array(amount*2) as _, index (index)}
            <Instance
                position={calcInstancePos(index)}
                rotation={calcInstanceRot(index, time)}
                scale={calcInstanceScl(index)}
            ></Instance>
        {/each}
    </InstancedMesh>
{/if}

