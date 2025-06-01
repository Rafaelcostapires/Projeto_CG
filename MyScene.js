import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture,CGFshader } from "./lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyForest } from "./MyForest.js";
import { MyHeli } from "./MyHeli.js";
import { MyLake} from "./MyLake.js";
import { MyFire } from "./MyFire.js";

/**
 * Main scene class that manages the 3D helicopter rescue simulation
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    this.showSkySphere = false;
    this.speedFactor = 1.0;
    this.currentTimeFactor = 0;
  }

  init(application) {
    super.init(application);
    
    this.cameraZoom = 1;
    this.initCameras();
    this.initLights();

    this.gl.clearColor(0, 0, 0, 1.0);
    this.gl.clearDepth(100.0);
    
    this.appearance = new CGFappearance(this);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.enableTextures(true);
    this.setUpdatePeriod(50);

    // Scene objects initialization
    this.axis = new CGFaxis(this, 20, 1);
    this.plane = new MyPlane(this, 64, 0, 150, 0, 150);
    this.skySphere = new MySphere(this, 80, 40);

    // Panoramic background setup
    this.panoramaTexture = new CGFtexture(this, "textures/panorama.jpg");
    this.panorama = new MyPanorama(this, this.panoramaTexture);

    this.displayAxis = false;

    // Material definitions for different scene elements
    this.skyTexture = new CGFappearance(this);
    this.skyTexture.setAmbient(0.3, 0.3, 0.3, 1);
    this.skyTexture.setDiffuse(0.7, 0.7, 0.7, 1);
    this.skyTexture.setSpecular(0.0, 0.0, 0.0, 1);
    this.skyTexture.setShininess(10);
    this.skyTexture.setTexture(new CGFtexture(this, "textures/earth.jpg"));
    this.skyTexture.setTextureWrap('REPEAT', 'REPEAT');

    this.grassTexture = new CGFappearance(this);
    this.grassTexture.setAmbient(1, 1, 0.2, 1);
    this.grassTexture.setDiffuse(1, 1, 0.4, 1);
    this.grassTexture.setSpecular(0.1, 0.1, 0.1, 1);
    this.grassTexture.setShininess(5);
    this.grassTexture.setTexture(new CGFtexture(this, "textures/grass.jpg"));
    this.grassTexture.setTextureWrap('REPEAT', 'REPEAT');

    this.wallTexture = new CGFappearance(this);
    this.wallTexture.setAmbient(0.3, 0.3, 0.3, 1);
    this.wallTexture.setDiffuse(0.7, 0.7, 0.7, 1);
    this.wallTexture.setSpecular(0.1, 0.1, 0.1, 1);
    this.wallTexture.setShininess(10);
    this.wallTexture.setTexture(new CGFtexture(this, "textures/wall.jpg"));
    this.wallTexture.setTextureWrap('REPEAT', 'REPEAT');

    this.windowTexture = new CGFappearance(this);
    this.windowTexture.setAmbient(0.3, 0.3, 0.3, 1);
    this.windowTexture.setDiffuse(0.7, 0.7, 0.7, 1);
    this.windowTexture.setSpecular(0.1, 0.1, 0.1, 1);
    this.windowTexture.setShininess(10);
    this.windowTexture.setTexture(new CGFtexture(this, "textures/window.jpg"));
    this.windowTexture.setTextureWrap('REPEAT', 'REPEAT');

    // Building configuration parameters
    this.size = 50;
    this.floors = 3;
    this.windowsPerFloor = 2;
    this.colorR = 135;
    this.colorG = 96;
    this.colorB = 66;
    this.color = [this.colorR / 255, this.colorG / 255, this.colorB / 255, 1];

    // Additional building materials (door, sign, helipad)
    this.quadMaterial = new CGFappearance(this);
    this.quadMaterial.setAmbient(0.1, 0.1, 0.1, 1);
    this.quadMaterial.setDiffuse(0.9, 0.9, 0.9, 1);
    this.quadMaterial.setSpecular(0.1, 0.1, 0.1, 1);
    this.quadMaterial.setShininess(10.0);
    this.quadMaterial.setTexture(new CGFtexture(this, 'textures/door.jpg'));
    this.quadMaterial.setTextureWrap('REPEAT', 'REPEAT');

    this.quadMaterial1 = new CGFappearance(this);
    this.quadMaterial1.setAmbient(0.1, 0.1, 0.1, 1);
    this.quadMaterial1.setDiffuse(0.9, 0.9, 0.9, 1);
    this.quadMaterial1.setSpecular(0.1, 0.1, 0.1, 1);
    this.quadMaterial1.setShininess(10.0);
    this.quadMaterial1.setTexture(new CGFtexture(this, 'textures/sign.jpg'));
    this.quadMaterial1.setTextureWrap('REPEAT', 'REPEAT');

    this.quadMaterial2 = new CGFappearance(this);
    this.quadMaterial2.setAmbient(0.1, 0.1, 0.1, 1);
    this.quadMaterial2.setDiffuse(0.9, 0.9, 0.9, 1);
    this.quadMaterial2.setSpecular(0.1, 0.1, 0.1, 1);
    this.quadMaterial2.setShininess(10.0);
    this.quadMaterial2.setTexture(new CGFtexture(this, 'textures/helipad.png'));
    this.quadMaterial2.setTextureWrap('REPEAT', 'REPEAT');

    this.building = new MyBuilding(this, this.size, this.floors, this.windowsPerFloor, this.windowTexture, this.wallTexture,this.quadMaterial,this.quadMaterial1,this.quadMaterial2, this.color);
    
    // Water shader setup for animated water effects
    this.texture2 = new CGFtexture(this, "textures/waterMap.jpg");
    this.water_shader = new CGFshader(this.gl, "shaders/water.vert", "shaders/water.frag");
    this.waterquad= new MyPlane(this,50);
    this.water_shader.setUniformsValues({ uSampler2: 1, timeFactor: 0 });

    this.waterAppearance = new CGFappearance(this);
    this.waterAppearance.setTexture(new CGFtexture(this, "textures/waterTex.jpg"));
    this.waterAppearance.setTextureWrap('REPEAT','REPEAT');

    // Fire shader setup for animated fire effects
    this.texturefire = new CGFtexture(this, "textures/waterMap.jpg");
    this.fire_shader = new CGFshader(this.gl, "shaders/fire.vert", "shaders/fire.frag");
    this.fire_shader.setUniformsValues({ uSampler2: 1, timeFactor: 0 });

    this.fireAppearance = new CGFappearance(this);
    this.fireAppearance.setTexture(new CGFtexture(this, "textures/fire.jpg"));
    this.fireAppearance.setTextureWrap('REPEAT','REPEAT');

    this.fire = new MyFire(this);  
    this.lake = new MyLake(this);

    // Forest configuration with fire positions
    this.forest1= new MyForest(this,
      4,    // minimum trees
      6,    // maximum trees  
      90,   // forest area size
      60,   // minimum distance from center
      80,  // maximum distance from center
      0,    // rotation angle
      [[0,1],[1,0],[1,1]], // fire positions (relative coordinates)
    );

    // Helicopter initialization with starting position
    this.helicopter = new MyHeli(this, [0, (this.size/12.5*5) + 3, 0]);
    this.helicopter.helipadPosition = [0, 22, 0];
    this.helicopter.setForestReference(this.forest1);
  }

  initLights() {
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
        this.cameraZoom,
        0.1,
        1000,
        vec3.fromValues(100, 50, 100),
        vec3.fromValues(0, 0, 0)
    );
  }

  // GUI interface methods for real-time parameter adjustment
  updateCameraZoom(value) {
    this.camera.fov = value;
    this.camera.updateProjectionMatrix();
  }

  updateBuildingSize(size) {
    this.size = size;
  }

  updateBuildingFloors(floors) {
    this.floors = floors;
  }

  updateBuildingWindows(windowsPerFloor) {
    this.windowsPerFloor = windowsPerFloor;
  }

  updateColorRed(colorR) {
    this.colorR = colorR;
  }

  updateColorGreen(colorG) {
    this.colorG = colorG;
  }

  updateColorBlue(colorB) {
    this.colorB = colorB;
  }

  /**
   * Handles keyboard input for helicopter control and simulation actions
   */
  checkKeys() {
    var text = "Keys pressed: ";
    var keysPressed = false;
    
    // Reset helicopter to initial state
    if (this.gui.isKeyPressed("KeyR")) {
        text += " R ";
        this.helicopter.reset();
        keysPressed = true;
    }

    // Helicopter movement controls (only when user control is enabled)
    if (this.helicopter.userControlEnabled) {
      if (this.gui.isKeyPressed("KeyW")) {
          text += " W ";
          this.helicopter.accelerate(1);
          keysPressed = true;
      }

      if (this.gui.isKeyPressed("KeyS")) {
          text += " S ";
          this.helicopter.accelerate(-1);
          keysPressed = true;
      }
      
      if (this.gui.isKeyPressed("KeyD")) {
          text += " A ";
          this.helicopter.turn(-1);
          keysPressed = true;
      }
      
      if (this.gui.isKeyPressed("KeyA")) {
          text += " D ";
          this.helicopter.turn(1);
          keysPressed = true;
      }
      
      // Water drop for fire extinguishing
      if (this.gui.isKeyPressed("KeyO")) {
            text += " O ";
            const result = this.helicopter.attemptFireExtinguish();
            keysPressed = true;
        }
    }
    
    // Take off control
    if (this.gui.isKeyPressed("KeyP")) {
        text += " P ";
        if (this.helicopter.isCollectingWater && this.helicopter.waterCollectionStage === 1) {
            this.helicopter.takeOffFromLake();
        } else {
            this.helicopter.takeOff();
        }
        keysPressed = true;
    }

    // Auto landing/water collection
    if (this.gui.isKeyPressed("KeyL")) {
        text += " L ";
        this.helicopter.startAutoLandingOrWaterCollecting();
        keysPressed = true;
    }
  }

  /**
   * Main update loop - handles time-based animations and helicopter physics
   */
  update(t) {
    this.checkKeys();

    if (this.lastT == null) this.lastT = t;
    let deltaTime = t - this.lastT;
    this.lastT = t;
    
    this.helicopter.update(deltaTime * this.speedFactor);

    // Update shader time factor for animated water effects
    const tf = (t/100) % 100;
    this.currentTimeFactor = tf; 
    this.water_shader.setUniformsValues({ timeFactor: tf });
  }

  updateSpeedFactor(value) {
      this.speedFactor = value;
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }

  getTimeFactor() {
    return this.currentTimeFactor;
  }

  /**
   * Main rendering method - draws all scene elements
   */
  display() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Ground plane rendering
    this.pushMatrix();
    this.grassTexture.apply();
    this.scale(4000, 1, 4000);
    this.rotate(-Math.PI / 2, 1, 0, 0); 
    this.plane.display();
    this.popMatrix();

    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();

    this.panorama.display();

    // Dynamic building rendering with current parameters
    this.color = [this.colorR / 255, this.colorG / 255, this.colorB / 255, 1];
    this.building.display(this.size, this.floors, this.windowsPerFloor, this.color);

    if (this.displayAxis) this.axis.display();
    this.setDefaultAppearance();

    // Optional sky sphere for testing
    if (this.showSkySphere) {
      this.pushMatrix();
      this.skyTexture.apply();
      this.translate(0, 30, 0);
      this.scale(30, 30, 30);
      this.skySphere.display();
      this.popMatrix();
    }

    this.helicopter.display();

    // Helicopter shadow rendering (only when flying)
    if (this.helicopter.isFlying) {
        this.pushMatrix();
        
        this.setAmbient(0.1, 0.1, 0.1, 1);
        this.setDiffuse(0.2, 0.2, 0.2, 1);
        this.setSpecular(0.1, 0.1, 0.1, 1);
        
        this.translate(this.helicopter.pos[0], 0.1, this.helicopter.pos[2]);
        this.scale(2, 0.2, 2);
        
        const dotSphere = new MySphere(this, 8, 4);
        dotSphere.display();
        
        this.popMatrix();
        this.setDefaultAppearance();
    }

    this.pushMatrix();
    this.forest1.display();
    this.popMatrix();

    // Water lake for helicopter water collection
    this.pushMatrix();
    this.translate(-60,0,0);
    this.scale(5,1.5,5);
    this.lake.display();
    this.popMatrix();
  }
}