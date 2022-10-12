import * as THREE from 'three';
import { GUI } from 'lil-gui';
import * as FOGEO from './fogeo.js';

let backgroundExperienceSettings: FOGEO.ExperienceSettings = {
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
        sizeGetter: (arg: any) => {
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
                camera: new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000),
                active: true,
                override: {
                    position: new THREE.Vector3(0, 3, 15)
                }
            }
        },
        lights: {
            'pointLight' : {
                light: new THREE.PointLight( 'pink', 4, 55 ),
                override: {
                    position: new THREE.Vector3(0, 50, 0)
                }
            }
        }
    },
    geometryModifiers: {
        sinWaveToCursor: {
            modifier: (geo: THREE.BufferGeometry, self: FOGEO.Experience, elapsedTime?: number) => {
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


// Render Loop
var zFactor = 0.3;

var experiences: FOGEO.Experience[] = [];

let init = function(){
    experiences.push(new FOGEO.Experience(backgroundExperienceSettings));

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
                    //TODO: scene.getbyname() ??
                    if(experience.initialSettings.objects.meshes?.[meshNameToApplyTo]){
                        geoMod.modifier(experience.initialSettings.objects.meshes[meshNameToApplyTo].mesh.geometry, experience, elapsedTime);
                    } else if(experience.scene.getObjectByName(meshNameToApplyTo)){
                        const mesh = experience.scene.getObjectByName(meshNameToApplyTo);
                        if(mesh instanceof THREE.Mesh){
                            geoMod.modifier(mesh.geometry, experience, elapsedTime);
                        }
                        
                    }
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




