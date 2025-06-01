import { CGFinterface, dat } from './lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();
        this.gui.add(this.scene, 'cameraZoom', 0.1, 2.0).step(0.01).name("Camera Zoom").listen().onChange((value) => {
            this.scene.updateCameraZoom(value);
        });
        this.gui.add(this.scene, 'showSkySphere').name("Show Sky Sphere");

        this.gui.add(this.scene, 'size', 25, 125).step(12.5).name("Building Width").listen().onChange((size) => {
            this.scene.updateBuildingSize(size);
        });

        this.gui.add(this.scene, 'floors', 1, 5).step(1).name("Nº Floors (Side)").listen().onChange((floors) => {
            this.scene.updateBuildingFloors(floors);
        });

        this.gui.add(this.scene, 'windowsPerFloor', 1, 3).step(1).name("WindowsPerFloor").listen().onChange((windowsPerFloor) => {
            this.scene.updateBuildingWindows(windowsPerFloor);
        });

        this.gui.add(this.scene, 'colorR', 0, 255).step(1).name("Red").listen().onChange((colorR) => {
            this.scene.updateColorRed(colorR);
        });
        this.gui.add(this.scene, 'colorG', 0, 255).step(1).name("Green").listen().onChange((colorG) => {
            this.scene.updateColorGreen(colorG);
        });
        this.gui.add(this.scene, 'colorB', 0, 255).step(1).name("Blue").listen().onChange((colorB) => {
            this.scene.updateColorBlue(colorB);
        });

        this.gui.add(this.scene, 'speedFactor', 0.1, 3.0).step(0.1).name('Speed Factor');

        const heliInfoFolder = this.gui.addFolder('Helicopter Controls Info');

        const controlsInfo = {
            'Movement': '--- Keyboard Controls ---',
            'W': 'Move Forward',
            'S': 'Move Backward', 
            'A': 'Turn Left',
            'D': 'Turn Right',
            'P': 'Take Off / Leave water',
            'L': 'Land / Reach water',
            'R': 'Reset',
            'O': 'Drop Water',
        };

        Object.keys(controlsInfo).forEach(key => {
            const controller = heliInfoFolder.add(controlsInfo, key).name(key + ':');
            controller.domElement.style.pointerEvents = 'none'; // Make it read-only
            controller.domElement.querySelector('input').style.background = 'transparent';
            controller.domElement.querySelector('input').style.border = 'none';
            controller.domElement.querySelector('input').style.color = '#ddd';
        });

        heliInfoFolder.open();
        
        this.initKeys();

        return true;
    }

    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui = this;

        // disable the processKeyboard function
        this.processKeyboard = function () { };

        // create a named array to store which keys are being pressed
        this.activeKeys = {};
    }
    processKeyDown(event) {
        // called when a key is pressed down
        // mark it as active in the array
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        // called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        // returns true if a key is marked as pressed, false otherwise
        return this.activeKeys[keyCode] || false;
    }

}