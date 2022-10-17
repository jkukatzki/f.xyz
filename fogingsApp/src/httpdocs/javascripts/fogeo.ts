import * as LILGUI from 'lil-gui';
import * as THREE from 'three';
import { CubeCamera } from 'three';
import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader';

const defaults: ExperienceSettings = {
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

interface GUICreator {
    create: (objArray: THREE.Object3D[]) => (void),
    styles?: string
}

const GUIPresets: {[key: string]: GUICreator} = {
    objectOutlinerAndTransforms: {
        create: (objs) => {
            if(!objs){
                console.error('Could not create object outliner because scene is undefined');
                return;
            }
            const panel = new LILGUI.GUI({width: 310});
            const objectsFolder = panel.addFolder('Objects');
            const objectSelectorButtons: {[key: string]: any} = {};
            const transformsFolder = panel.addFolder('Transform');
            const transformPositionFolder = transformsFolder.addFolder('Position');
            let currentPositionTransformControllers : LILGUI.Controller[] = [];
            let activeObject: THREE.Object3D | undefined = undefined;
            function createButtonsFromObjects(objs: THREE.Object3D[], folder: LILGUI.GUI){
                folder.domElement.classList.add('fogeo-objectoutliner-group');
                for(let i = 0; i<objs.length; i++){
                    const child: THREE.Object3D = objs[i];
                    if(child instanceof THREE.Group){
                        //create new folder instead
                        createButtonsFromObjects(child.children, folder.addFolder(child.name));
                    } else {
                        let objectSelectButton: {[key: string]: Function} = {};
                        //on button press:
                        objectSelectButton[child.name] = () => {
                            if(activeObject !== child){
                                activeObject = child;
                                for(let objectSelectorButtonsKey in objectSelectorButtons){
                                    if(objectSelectorButtonsKey !== child.name){
                                        objectSelectorButtons[objectSelectorButtonsKey].domElement.classList.remove('fogeo-objectoutliner-selected')
                                    }
                                }
                                objectSelectorButtons[child.name].domElement.classList.add('fogeo-objectoutliner-selected');
                                
                                //POSITION
                                
                                

                                //destroy old controllers
                                currentPositionTransformControllers.forEach((controller) => {
                                    controller.destroy();
                                });
                                currentPositionTransformControllers = [];
                                //create new controllers
                                const childPositionToString = {
                                    x: child.position.x.toString(),
                                    y: child.position.y.toString(),
                                    z: child.position.z.toString()
                                }
                                for(let axis of ['x', 'y', 'z']){
                                    currentPositionTransformControllers.push(transformPositionFolder.add(childPositionToString, axis));
                                }
                                //bind functions to change events of new controllers
                                currentPositionTransformControllers.forEach((controller) => {
                                    controller.onChange((value: string) => {
                                        const newVal = Number.parseFloat(value);
                                        if(!isNaN(newVal)){
                                            console.log('Setting new position for child.', child, newVal);
                                            child.position.set(controller.property === 'x' ? newVal : child.position.x, controller.property === 'y' ? newVal : child.position.y, controller.property === 'z' ? newVal : child.position.z);
                                        }
                                    });
                                    controller.onFinishChange((value: string) => {
                                        const newVal = Number.parseFloat(value);
                                        if(isNaN(newVal)){
                                            console.log('New value for position is not a valid float, resetting to previous.');
                                            let previousVal = {'x':0, 'y':1, 'z':2}[controller.property];
                                            previousVal = previousVal ? previousVal : 0;
                                            controller.setValue(child.position.getComponent(previousVal).toString());
                                        } else {
                                            controller.setValue(newVal.toString());
                                        }
                                    });
                                })

                            }
                        };
                        objectSelectorButtons[child.name] = ( folder.add(objectSelectButton, child.name) );
                    }
                };
            }
            //start from top of tree
            createButtonsFromObjects(objs, objectsFolder);
            //set first object as default selected: //TODO: do this differently, put controller creation in seperate function and call here
            setTimeout(() => { $(Object.entries(objectSelectorButtons)[0][1].domElement).find('button').trigger('click'); }, 1);
        },
        styles: `
        .fogeo-objectoutliner-group > .children > .controller > .widget > button {
            text-align: left;
            padding-left: 0.5em;
        }
        .fogeo-objectoutliner-selected > .widget {
            border: 1px solid white;
        }
        `
    }
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
    makeInstance?: (mesh: THREE.Mesh) => (THREE.InstancedMesh);
}

interface RenderOptions {
    elSelector: string;
    params?: any,
    clearColor?: [color: THREE.ColorRepresentation, alpha?: number]; 
    sizeGetter: (input: any) => {width: number, height: number};
}

interface GeometryModifier {
    modifier: (mesh: THREE.Mesh, self: Experience, elapsedTime?: number) => void;
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
    },
    GUI?: string[]
}

let loaders : {[key: string]: THREE.Loader} = {};

interface LoaderTemplate {
    loaderFactory: () => (THREE.Loader);
    handler: (loader: THREE.Loader, fromFile: FromFileImport, self: Experience, name: string) => (Promise<THREE.Object3D>);
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
        handler: (loader: THREE.Loader, fromFile: FromFileImport, self: Experience, name: string) => {
            return new Promise<THREE.Object3D>((loadResolve, loadReject) => {
                if(loader instanceof GLTFLoader){
                    let modifiedGltf: THREE.Group;
                    loader.load(fromFile.origin, function ( gltf: GLTF) {
                        gltf.scene.name = name;
                        console.log('Loaded GLTF', JSON.parse(JSON.stringify(gltf.scene)));
                        if(fromFile.extract){
                            let extract = fromFile.extract;
                            //TODO: move this to createFromObjectCollection()?
                            gltf.scene.traverse(function(child: THREE.Object3D<THREE.Event>){
                                if(extract.includes(child.name) && child instanceof THREE.Mesh){
                                    console.log('constructing mesh from gltf scene', child);
                                    if(fromFile.override && fromFile.override[child.name]){
                                        if(!modifiedGltf){
                                            modifiedGltf = gltf.scene.clone();
                                        }
                                        let childOverride = fromFile.override[child.name];
                                        const respectiveChildInClone = modifiedGltf.getObjectByName(child.name);
                                        if(respectiveChildInClone){
                                            self.override(respectiveChildInClone, childOverride, modifiedGltf);
                                        } else {
                                            console.error('Could not get child in clone of group that is being modified.');
                                        };
                                    }
                                }
                            });
                            if(modifiedGltf){
                                gltf.scene = modifiedGltf;
                            }
                            console.log('gltf:', gltf);
                            loadResolve(gltf.scene);
                        };
                        loadResolve(gltf.scene);
                        
                    }, undefined, (error) => {
                        console.error(fromFile.origin+' could not be loaded', error);
                        loadReject();
                    });
                } else {
                    console.error('handler is for type gltf but loader is not of type GTLFLoader');
                }
                
            })
        }
    }
}

class Experience {

    customProps: any;

    scene: THREE.Scene | undefined;

    objects: ObjectCollection = {};

    loadPromises: Promise<THREE.Object3D>[] = [];

    renderer: THREE.WebGLRenderer;

    renderOptions: RenderOptions;

    clock: THREE.Clock = new THREE.Clock();

    activeCam: string | undefined;

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
            //this.objects only includes cameras, no new meshes/lights/fromFile entries are being created, they are present in the scene with overridden values and their initial values are stored in this.initialSettings
            //names are bound to objects in createFromObjectCollection() with their respective keys, access objects with .getObjectByName(name) on this.scene
        };
        this.cameraAndRendererUpdate();
        
        //GUI
        Promise.all(this.loadPromises).then(() => {
            settings.GUI?.forEach((gui) => {
                if(this.scene){
                    const newGUI = GUIPresets[gui];
                    if(newGUI.styles){
                        const styleTagEl = document.createElement('style');
                        styleTagEl.innerHTML = newGUI.styles;
                        document.head.append(styleTagEl);
                    }
                    if(this.objects.cameras){
                        newGUI.create(this.scene.children.concat( Object.entries( this.objects.cameras ).map((cameraEntry) => cameraEntry[1].camera) ) );
                    } else {
                        newGUI.create(this.scene.children);
                    }
                    
                } else {
                    console.error('Could not create gui because this.scene is undefined');
                }
            });
        });

    }

    render = () => {
        if(this.activeCam && this.scene && this.objects.cameras){
            this.renderer.render(this.scene, this.objects.cameras[this.activeCam].camera);
        } else {
            console.error('Could not render, this.activeCam or this.scene is undefined', this);
        }
    }

    cameraAndRendererUpdate = () => {
        if(this.objects.cameras){
            let activeCam: string | undefined;
            let fallback: string = Object.keys(this.objects.cameras)[0];
            for(let camKey in this.objects.cameras){
                if(this.objects.cameras[camKey].active){
                    activeCam = camKey;
                    break;
                }
                if(this.objects.cameras[camKey].active === undefined){
                    fallback = camKey;
                }
            }
            if(!activeCam){
                activeCam = fallback;
            }
            const size = this.renderOptions.sizeGetter(this);
            const activeCamObject = this.objects.cameras[activeCam].camera
            if(activeCamObject instanceof THREE.PerspectiveCamera){
                activeCamObject.aspect = size.width/size.height;
                activeCamObject.updateProjectionMatrix();
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
            newCollection.cameras = {};
            for(let camerasKey in objCollection.cameras){
                objCollection.cameras[camerasKey].camera.name = camerasKey;
                let camera = objCollection.cameras[camerasKey].camera;
                const cameraOverride = objCollection.cameras[camerasKey].override;
                if(cameraOverride){
                    const newCamera = this.override(camera, cameraOverride);
                    if(newCamera instanceof THREE.Camera){
                        objCollection.cameras[camerasKey].camera = newCamera;
                    }
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
                let light = objCollection.lights[lightsKey].light;
                const lightOverride = objCollection.lights[lightsKey].override;
                light.name = lightsKey;
                if(lightOverride){
                    const newLight = this.override(light, lightOverride);
                    if(newLight instanceof THREE.Light){
                        light = newLight;
                    }
                }
                scene.add(light);
            }
        }
        //setup meshes
        if(objCollection.meshes){
            for(let meshesKey in objCollection.meshes) {
                let mesh = objCollection.meshes[meshesKey].mesh;
                const meshOverride = objCollection.meshes[meshesKey].override;
                mesh.name = meshesKey;
                if(meshOverride){
                    const newMesh = this.override(mesh, meshOverride);
                    if(newMesh instanceof THREE.Mesh){
                        mesh = newMesh;
                    }
                };
                scene.add(mesh);
            }
        }
        //setup file loading (async)
        this.loadPromises = this.loadFromFile(objCollection.fromFiles);
        this.loadPromises.forEach((loadPromise) => {
            loadPromise.then((obj) => {
                console.log('Loading of file complete:', obj);
                this.scene?.add(obj);
            })
        });

        return {scene, newCollection};   
    };

    override : (obj: THREE.Object3D, overrides: ObjectOverride, group?: THREE.Group) => (THREE.Object3D) = (obj, overrides, group) => {
        const originalObj = obj;
        obj = obj.clone();
        //TODO: mit dummy und set matrix lösen?
        Object.keys(overrides).forEach((override: string) => {
            const overrideValue: THREE.Vector3 | THREE.Euler | number | THREE.Material | ((mesh: THREE.Mesh) => (THREE.InstancedMesh)) | undefined = overrides[override as keyof typeof overrides];
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
                            obj = overrideValue(obj);
                            obj.name = originalObj.name;
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
        if(group){
            group.remove(originalObj);
            group.add(obj);
        }
        console.log('Override for ', originalObj.name, ':', originalObj, obj);
        return obj;
    }

    loadFromFile: (fromFiles: ObjectCollection["fromFiles"]) => (Promise<THREE.Object3D>[]) = (fromFiles) => {
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
                loaderTemplates[fromFile.loader].handler(loaders[fromFile.loader], fromFile, this, fromFilesKey)
            );
        }
        return loadPromises;
    }

}

export {Experience, ExperienceSettings, RenderOptions, ObjectCollection, ObjectOverride}