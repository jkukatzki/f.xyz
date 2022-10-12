import * as THREE from 'three';
import { Clock } from 'three';
import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader';

var defaults: ExperienceSettings = {
    renderOptions: {
        elSelector: 'body',
        sizeGetter: (input: any) => {
            return {width: window.innerWidth, height: window.innerHeight}
        }
    },
    objects: {
        cameras: {
            'camera': {
                camera: new THREE.PerspectiveCamera(),
                active: true
            }
        }
    },
    geometryModifiers: {}
}

interface ObjectCollection {
    cameras?: {
        [key: string] : {
            camera: THREE.Camera;
            override?: ObjectOverride;
            active?: boolean;
        }
    },
    meshes?: {
        [key: string] : {
            mesh: THREE.Mesh;
            override?: ObjectOverride;
        }
    },
    lights?: {
        [key: string] : {
            light: THREE.Light;
            override?: ObjectOverride;
        }
    },
    splines?: {
        [key: string] : {
            spline: THREE.SplineCurve;
            override: ObjectOverride;
        }
    },
    fromFiles?: {
        [key: string] : FromFileImport
    }
}

interface ObjectOverride {
    position?: THREE.Vector3;
    rotation?: THREE.Euler | THREE.Vector3 | number;
    scale?: THREE.Vector3;
    material?: THREE.Material;
    makeInstance?: (mesh: THREE.Mesh) => {iMesh: THREE.InstancedMesh};
}

interface RenderOptions {
    elSelector: string;
    params?: any,
    clearColor?: [color: THREE.ColorRepresentation, alpha?: number]; 
    sizeGetter: (input: any) => {width: number, height: number};
}

interface GeometryModifier {
    modifier: (geo: THREE.BufferGeometry, self: Experience, elapsedTime?: number) => void;
    applyTo: string[] | "*";
    updateInterval?: number;
}

interface ExperienceSettings {
    renderOptions: RenderOptions;
    objects: ObjectCollection;
    customProps?: Object;
    geometryModifiers?: {
        [key: string]: GeometryModifier;
    },
    eventFunctions?: {
        onResize?: Function;
        onCursorMove?: Function;
        [key: string] : Function | undefined;
    }
}

let loaders : {[key: string]: THREE.Loader} = {};

interface LoaderTemplate {
    loaderFactory: () => (THREE.Loader);
    handler: (loader: THREE.Loader, fromFile: FromFileImport, self: Experience) => (Promise<THREE.Object3D>);
}

interface FromFileImport {
    origin: string,
    loader: string,
    extract?: string[],
    override?: {
        [key: string]: ObjectOverride
    }
}

let loaderTemplates: {
    [key: string]: LoaderTemplate
} = {
    gltf: {
        loaderFactory: () => {return new GLTFLoader()},
        handler: (loader: THREE.Loader, fromFile: FromFileImport, self: Experience) => {
            return new Promise<THREE.Object3D>((loadResolve, loadReject) => {
                if(loader instanceof GLTFLoader){
                    loader.load(fromFile.origin, function ( gltf: GLTF) {
                        console.log('Loaded GLTF', gltf);
                        if(fromFile.extract){
                            let extract = fromFile.extract;
                            gltf.scene.traverse(function(child: THREE.Object3D<THREE.Event>){    
                                if(extract.includes(child.name) && child instanceof THREE.Mesh){
                                    console.log('constructing mesh from gltf scene', child);
                                    if(fromFile.override && fromFile.override[child.name]){
                                        let overrideChild = fromFile.override[child.name];
                                        self.override(child, overrideChild);
                                        if(overrideChild.makeInstance){
                                            const name = child.name;
                                            child = overrideChild.makeInstance(child).iMesh;
                                            child.name = name;
                                        }
                                    }
                                }
                            })
                            loadResolve(gltf.scene);
                        };
                        loadResolve(gltf.scene);
                        
                    }, undefined, (error) => {
                        console.error(fromFile.origin+' could not be loaded', error);
                        loadReject();
                    });
                } else {

                }
                
            })
        }
    }
}

class Experience {

    customProps: any;

    scene: THREE.Scene;

    objects: ObjectCollection = {};

    renderer: THREE.WebGLRenderer;

    renderOptions: RenderOptions;

    clock: THREE.Clock = new THREE.Clock();

    activeCam: THREE.Camera | undefined;

    geometryModifiers?: {
        [key: string] : GeometryModifier;
    }

    eventFunctions: {
        onResize: Function;
        onCursorMove?: Function;
        [key: string] : Function | undefined;
    } = {
        onResize : () => {
            this.cameraAndRendererUpdate();
        }
    }

    initialSettings: ExperienceSettings;

    constructor(settings: ExperienceSettings){
        this.scene = new THREE.Scene();
        this.initialSettings = settings;
        this.customProps = settings.customProps === undefined ? {} : settings.customProps;
        if(settings.eventFunctions){
            for(let eventFunctionsKey in settings.eventFunctions){
                this.eventFunctions[eventFunctionsKey] = settings.eventFunctions[eventFunctionsKey];
            }
        }
        //setup renderer
        this.renderer = new THREE.WebGLRenderer(settings.renderOptions.params);
        this.renderOptions = settings.renderOptions;
        if(settings.renderOptions.clearColor){
            this.renderer.setClearColor(settings.renderOptions.clearColor[0], settings.renderOptions.clearColor[1]);
        };
        const size: {width: number, height: number} = this.renderOptions.sizeGetter(this);
        this.renderer.setSize(size.width, size.height);
        document.querySelector(this.renderOptions.elSelector)?.appendChild(this.renderer.domElement);


        if(settings.geometryModifiers){
            this.geometryModifiers = settings.geometryModifiers;
        }

        //setup objects
        if(!settings.objects){
            settings.objects = defaults.objects;
        };
        if(settings.objects){
            const newlyCreated = this.createFromObjCollection(settings.objects);
            this.scene = newlyCreated.scene;
            this.objects = newlyCreated.newCollection;
        };
        this.cameraAndRendererUpdate();

    };

    render = () => {
        if(this.activeCam){
            this.renderer.render(this.scene, this.activeCam);
        } else {
            console.error('Could not render, this.activeCam is undefined.', this);
        }
    }

    cameraAndRendererUpdate = () => {
        if(this.objects.cameras){
            let activeCam: THREE.Camera | undefined;
            let fallback: THREE.Camera | undefined = undefined;
            for(let camKey in this.objects.cameras){
                if(this.objects.cameras[camKey].active){
                    activeCam = this.objects.cameras[camKey].camera;
                    break;
                }
                if(this.objects.cameras[camKey].active === undefined){
                    fallback = this.objects.cameras[camKey].camera;
                }
            }
            if(!activeCam){
                activeCam = fallback;
            }
            const size = this.renderOptions.sizeGetter(this.renderOptions.elSelector);
            if(activeCam instanceof THREE.PerspectiveCamera){
                activeCam.aspect = size.width/size.height;
                activeCam.updateProjectionMatrix();
            }
            this.activeCam = activeCam;

            this.renderer.setSize(size.width, size.height);
        }
    }

    createFromObjCollection: (objCollection: ObjectCollection) => {scene: THREE.Scene, newCollection: ObjectCollection} = (objCollection) => {
        const scene = new THREE.Scene();
        const newCollection: ObjectCollection = {};
        //setup cameras
        if(objCollection.cameras){
            for(let camerasKey in objCollection.cameras){
                const camera = objCollection.cameras[camerasKey].camera;
                const cameraOverride = objCollection.cameras[camerasKey].override;
                if(cameraOverride){
                    this.override(camera, cameraOverride);
                }
            }
            newCollection.cameras = objCollection.cameras;
        } else {
            newCollection.cameras = defaults.objects.cameras;
        }

        //setup lights
        if(objCollection.lights){
            const lightsKeys = Object.keys(objCollection.lights);
            for(let lightsKey in objCollection.lights) {
                const light = objCollection.lights[lightsKey].light;
                const lightOverride = objCollection.lights[lightsKey].override;
                if(lightOverride){
                    this.override(light, lightOverride);
                }
                light.name = lightsKey;
                scene.add(light);
            }
        }
        //setup meshes
        if(objCollection.meshes){
            for(let meshesKey in objCollection.meshes) {
                const mesh = objCollection.meshes[meshesKey].mesh;
                const meshOverride = objCollection.meshes[meshesKey].override;
                if(meshOverride){
                    this.override(mesh, meshOverride);
                };
                mesh.name = meshesKey;
                scene.add(mesh);
            }
        }
        //setup file loading (async)
        this.loadFromFile(objCollection.fromFiles);

        return {scene, newCollection};   
    };

    override : (obj: THREE.Object3D, overrides: ObjectOverride) => (THREE.Object3D) = (obj, overrides) => {
        //TODO: mit dummy und set matrix lösen?
        Object.keys(overrides).forEach((override: string) => {
            const overrideValue: THREE.Vector3 | THREE.Euler | number | THREE.Material | ((mesh: THREE.Mesh) => {iMesh: THREE.InstancedMesh}) | undefined = overrides[override as keyof typeof overrides];
            if(overrideValue === undefined){
                console.error('Override value is undefined for ', override, ' in ', overrides);
                return;
            }
            switch(override){
                case 'position': {
                    if(overrideValue instanceof THREE.Vector3){
                        obj.position.copy(overrideValue);
                    } else {
                        console.error('No valid value to override position for ', obj, ' overrides: ', overrides);
                    }
                    break;
                }
                case 'rotation': {
                    if(overrideValue instanceof THREE.Vector3){
                        obj.rotation.setFromVector3(overrideValue);
                    } else {
                        console.error('No valid value to override rotation for ', obj, ' overrides: ', overrides);
                    }
                    break;
                }
                case 'scale': {
                    if(overrideValue instanceof THREE.Vector3){
                        obj.scale.copy(overrideValue);
                    } else if(typeof overrideValue === 'number'){
                        obj.scale.set(overrideValue, overrideValue, overrideValue);
                    } else {
                        console.error('No valid value to override scale for ', obj, ' overrides: ', overrides);
                    }
                    break;
                }
                case 'material': {
                    if(overrideValue instanceof THREE.Material){
                        if(obj instanceof THREE.Mesh){
                            obj.material = overrideValue;
                        } else {
                            console.error('Object is not of type THREE.Mesh, could not set material.');
                        }
                    } else {
                        console.error('No valid value to override material for ', obj, ' overrides: ', override);
                    }
                    break;
                }
                case 'makeInstance': {
                    if(typeof overrideValue === 'function'){
                        if(obj instanceof THREE.Mesh){
                            obj = overrideValue(obj).iMesh;
                        } else {
                            console.error('Could not convert ', obj, ' to THREE.InstancedMesh since it is not an instance of THREE.Mesh');
                        }
                    } else {
                        console.error('Wrong type for makeInstance function.');
                    }
                    break;
                }
                default: {break;}

            }
        });
        return obj;
    }

    loadFromFile: (this: Experience, fromFiles: ObjectCollection["fromFiles"]) => (Promise<THREE.Object3D>[]) = (fromFiles) => {

        if(!fromFiles){
            return [];
        }
        const loadPromises: Promise<THREE.Object3D>[] = [];
        for(let fromFilesKey in fromFiles){
            let fromFile = fromFiles[fromFilesKey];
            if(!loaders[fromFile.loader]){
                loaders[fromFile.loader] = loaderTemplates[fromFile.loader].loaderFactory();
            }
            loadPromises.push(
                loaderTemplates[fromFile.loader].handler(loaders[fromFile.loader], fromFile, this)
            );
        }
        return loadPromises;
    }

}

export {Experience, ExperienceSettings, RenderOptions, ObjectCollection}