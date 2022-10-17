import * as THREE from 'three';
import * as FOGEO from './fogeo.js';

let backgroundGridSettings: FOGEO.ExperienceSettings = {
    customProps: {sinCenter: {x: 0.5, y: 0.5}, zFactor: 0.2},
    eventFunctions: {
        onCursorMove: function(self: FOGEO.Experience, x: number, y: number) {
            self.customProps.sinCenter.x = ((x)-0.5)*(1+2*Math.abs(y-1));
            self.customProps.sinCenter.y = Math.abs(y-1)-0.5;
            self.customProps.zFactor = Math.abs(y-1)/2;
        }
    },
    renderOptions: {
        params: {antialias: true},
        elSelector: '#background-threejs-render',
        sizeGetter: (arg: FOGEO.Experience) => {
            return { width: window.innerWidth, height: window.innerHeight }
        },
        clearColor: ['#000000']
    },
    objects : {
        meshes : {
            'plane' : {
                mesh: new THREE.Mesh(
                new THREE.PlaneGeometry(50, 30, 50/1.5-((50/1.5) % 2), 30/1.5-((30/1.5) % 2)),
                new THREE.MeshStandardMaterial({color: 'pink', wireframe: true})
                ),
                override: {
                    rotation: new THREE.Vector3(-(Math.PI / 2), 0 , 0)
                }
            }
        },
        cameras : {
            'camera01' : {
                camera: new THREE.PerspectiveCamera( 90, 1, 0.1, 1000),
                active: true,
                override: {
                    position: new THREE.Vector3(0, 3, 15)
                }
            }
        },
        lights: {
            'mainLight' : {
                light: new THREE.PointLight( 'pink', 4, 55 ),
                override: {
                    position: new THREE.Vector3(0, 50, 0)
                }
            }
        }
    },
    geometryModifiers: {
        sinWaveToCursor: {
            modifier: (mesh: THREE.Mesh, self: FOGEO.Experience, elapsedTime?: number) => {
                const geo = mesh.geometry;
                //set wireframe grid height
                if(elapsedTime){
                    const sinAdd = elapsedTime;
                    for(let i = 0; i < geo.attributes.position.count; i++){
                        const x = geo.attributes.position.getX(i);
                        const y = geo.attributes.position.getY(i);
                        //let distToCenter = Math.sqrt(x*x + y*y);
                        let distToSinCenter = Math.sqrt((x-self.customProps.sinCenter.x*20)**2 + (y-self.customProps.sinCenter.y*30)**2)
                        let dist = distToSinCenter;
                        const xsin = Math.sin(dist + sinAdd);
                        geo.attributes.position.setZ(i, xsin * self.customProps.zFactor);
                    }
                    geo.attributes.position.needsUpdate = true;
                } else {
                    console.error('Could not apply sinWaveToCursor because customProps.sinCenter == undefined');
                }
            },
            applyTo: ['plane']
        }
    }
};

let spiralMeshOverride : FOGEO.ObjectOverride = {
    material: new THREE.MeshPhongMaterial( {color: 'pink'}),
    scale : new THREE.Vector3(2, 2, 2),
    makeInstance: (mesh: THREE.Mesh) => {
        const count = 3;
        const iMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, count);
        iMesh.scale.copy(mesh.scale);
        iMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
        return iMesh;
    }

}

let spiralsTitleSettings : FOGEO.ExperienceSettings = {
    customProps: {
        cursorCords: {x: 0.5, y: 0.5}
    },
    eventFunctions: {
        onCursorMove: function(self: FOGEO.Experience, x: number, y: number) {
            self.customProps.cursorCords = {x, y};
        }
    },
    renderOptions: {
        params: {antialias: true},
        elSelector: '#title-threejs-render',
        sizeGetter: (arg: FOGEO.Experience) => {
            const el = document.querySelector(arg.renderOptions.elSelector);
            if(el){
                return { width: el.clientWidth, height: el.clientHeight }
            } else {
                console.error('Could not set render size because element selector did not return an element.', arg);
                return { width: 0, height: 0}
            }
            
        },
        clearColor: ['#000000', 0]
    },
    objects : {
        fromFiles: {
            'spirals' : {
                origin: 'models/dna.glb',
                loader: 'gltf',
                extract: ['dna', 'dna_mirrored'],
                override: {
                    'dna': spiralMeshOverride,
                    'dna_mirrored': spiralMeshOverride
                }
            }
        },
        cameras : {
            'camera01' : {
                camera: new THREE.PerspectiveCamera( 83, 1, 0.1, 1000), //TODO: decrease far culling value as far as possible
                active: true,
                override: {
                    position: new THREE.Vector3(0, 0, 1.55)
                }
            }
        },
        lights: {
            'center' : {
                light: new THREE.PointLight( "#ff9cd7", 0.3, 100 ),
                override: {
                    position: new THREE.Vector3(0, 0, -0.5)
                }
            },
            'back' : {
                light: new THREE.PointLight( 'blue', 0.2, 200 ),
                override: {
                    position: new THREE.Vector3(0, 0, -5)
                }
            },
            'front' : {
                light: new THREE.SpotLight( 'white', 0.6, 60, 2),
                override: {
                    position: new THREE.Vector3(0, 0, 5)
                }
            }
        }
    },
    GUI: ['objectOutlinerAndTransforms'],
    geometryModifiers: {
        lineSpreadAndRotateToCursor: {
            modifier: (mesh: THREE.Mesh, self: FOGEO.Experience, elapsedTime?: number) => {
                if(!(mesh instanceof THREE.InstancedMesh)){
                    console.error('This geometry modifier only works on meshes of type InstancedMesh', mesh);
                    return;
                }
                let xDir = 1;
                if(mesh.name === 'dna_mirrored'){
                    xDir = -1;
                }
                const line = {
                    start: new THREE.Vector3(0.6*xDir, 0, 0),
                    end : new THREE.Vector3(3.4*xDir, 0 , -1.3)
                }
                const sizeLinear = [1, 0.2];
                const rotationXLinear = [-1.1, 0.3];
                function mix(val: number, toMixBetween: number[]){
                    return (1-val)*toMixBetween[0]+val*toMixBetween[1]
                }
                for(let i = 0; i < mesh.count; i++){
                    //spread along line
                    const scaleSmallerLinear = mix(i/(mesh.count+1), sizeLinear);
                    const travel = new THREE.Vector3(i*((line.end.x-line.start.x)/mesh.count), i*((line.end.y-line.start.y)/mesh.count), i*((line.end.z-line.start.z)/mesh.count));
                    const pos = line.start.add(travel);
                    const scale = new THREE.Vector3(scaleSmallerLinear, scaleSmallerLinear, scaleSmallerLinear);
                    const dummy = new THREE.Object3D();
                    dummy.position.copy(pos);
                    dummy.scale.copy(scale);
                    dummy.rotation.set(mix(self.customProps.cursorCords.y, rotationXLinear), xDir*(elapsedTime ? elapsedTime : 0)*scaleSmallerLinear, 0);
                    dummy.updateMatrix();
                    mesh.setMatrixAt(i, dummy.matrix);
                    mesh.instanceMatrix.needsUpdate = true;
                }
            },
            applyTo: ['dna', 'dna_mirrored']
        }
    }
}

let deskShowcaseSettings: FOGEO.ExperienceSettings = {
    renderOptions: {
        params: {antialias: true},
        elSelector: '#showcase-threejs-render',
        sizeGetter: (arg: FOGEO.Experience) => {
            const el = document.querySelector(arg.renderOptions.elSelector);
            if(el){
                return { width: el.clientWidth, height: el.clientHeight }
            } else {
                console.error('Could not set render size because element selector did not return an element.', arg);
                return { width: 0, height: 0}
            }
            
        },
        clearColor: ['#000000', 0]
    },
    objects : {
        fromFiles: {
            'desk' : {
                origin: 'models/deskShowcase.glb',
                loader: 'gltf'
            }
        },
        cameras : {
            'camera01' : {
                camera: new THREE.PerspectiveCamera( 100, 4/3, 0.1, 100), //TODO: decrease far culling value as far as possible
                active: true,
                override: {
                    position: new THREE.Vector3(3.2, 1, 1),
                    rotation: new THREE.Vector3(0, Math.PI / 180 * 63, 0)
                }
            }
        },
        lights: {
            'center' : {
                light: new THREE.PointLight( "#ff9cd7", 0.3, 100 ),
                override: {
                    position: new THREE.Vector3(0, 0, -0.5)
                }
            },
            'back' : {
                light: new THREE.PointLight( 'blue', 0.2, 200 ),
                override: {
                    position: new THREE.Vector3(0, 0, -5)
                }
            },
            'front' : {
                light: new THREE.SpotLight( 'white', 0.6, 60, 2),
                override: {
                    position: new THREE.Vector3(0, 0, 5)
                }
            }
        }
    },
    GUI: ['objectOutlinerAndTransforms']
}

var experiences: FOGEO.Experience[] = [];

let init = function(){
    experiences = [
        new FOGEO.Experience(backgroundGridSettings),
        new FOGEO.Experience(spiralsTitleSettings),
        new FOGEO.Experience(deskShowcaseSettings)
    ];

    //start clocks 
    experiences.forEach((exp: FOGEO.Experience) => {
        exp.clock.start();
    });

    //add general event listeners and call their respective functions
    //CURSOR MOVE:
    function executeCursorMoveFunctions(x: number, y: number){
        experiences.forEach((exp: FOGEO.Experience) => {
            if(exp.eventFunctions.onCursorMove){
                exp.eventFunctions.onCursorMove(exp, x, y);
            }
        })
    };
    window.addEventListener('mousemove', (event) => {
        executeCursorMoveFunctions(event.clientX/window.innerWidth, event.clientY/window.innerHeight);
    });
    window.addEventListener('touchmove', (event) => {
        executeCursorMoveFunctions(event.targetTouches[0].clientX/window.innerWidth, event.targetTouches[0].clientY/window.innerHeight);
    });
    //RESIZE
    window.addEventListener( 'resize', () => {
        experiences.forEach((exp: FOGEO.Experience) => {
            if(exp.eventFunctions.onResize){
                exp.eventFunctions.onResize();
            }
        });
    });

}

let animate = function(){

    //apply modifiers every frame TODO: maybe add property: animated to FOGEO.GeometryModifier
    for( let i=0; i<experiences.length; i++ ){
        const experience = experiences[i];
        const elapsedTime = experience.clock.getElapsedTime();
        for(let geoModsKey in experience.geometryModifiers){
            const geoMod = experience.geometryModifiers[geoModsKey];
            if(geoMod.applyTo !== '*'){
                geoMod.applyTo.forEach((meshNameToApplyTo) => {
                   if(experience.scene?.getObjectByName(meshNameToApplyTo)){
                        const mesh = experience.scene.getObjectByName(meshNameToApplyTo);
                        if(mesh instanceof THREE.Mesh){
                            geoMod.modifier(mesh, experience, elapsedTime);
                        }   
                    };
                })
            } else {
                //TODO: apply modifier to all meshes in scene
            }
        }
        experience.render();
    }
    requestAnimationFrame(animate);
}

init();
//initial render
for( let i=0; i<experiences.length; i++ ){
    const experience = experiences[i];
    console.log('INITIAL RENDER', experience);
    experience.render();
}
//animate
animate();

export {experiences}

/*
function easeIntoValue(firstValue, secondValue, duration, resolution, result){
    function linear(x){
        return x;
    }
    return something;
}*/




