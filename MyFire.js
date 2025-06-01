import {CGFobject,CGFappearance,CGFtexture} from '../lib/CGF.js';
import { MyFirePlane } from './MyFirePlane.js';

/**
 * Animated fire effect using custom shader with randomized parameters
 * Each fire instance has unique timing and behavior for realistic variation
 */
export class MyFire extends CGFobject {
    constructor(scene) {
        super(scene);         
        this.fire = new MyFirePlane(this.scene, 30);
        
        // Randomize animation timing to prevent synchronized fire effects
        this.timeOffset = Math.random() * 100;
        this.animationSpeed = 0.7 + Math.random() * 0.6; // Vary speed between 0.7x - 1.3x
        
        // Pre-generate random seeds for consistent shader noise patterns
        this.randomSeed1 = Math.random() * 10.0; 
        this.randomSeed2 = Math.random() * 10.0; 
        this.randomSeed3 = Math.random() * 10.0; 
        this.randomSeed4 = Math.random() * 10.0; 
    }
    
    display(){
        // Activate custom fire shader for animated flame effects
        this.scene.setActiveShader(this.scene.fire_shader);

        // Calculate personalized time factor for this fire instance
        const baseTimeFactor = this.scene.getTimeFactor ? this.scene.getTimeFactor() : 0;
        const personalizedTimeFactor = (baseTimeFactor * this.animationSpeed) + this.timeOffset;
        
        // Pass animation parameters to shader
        this.scene.fire_shader.setUniformsValues({ 
            timeFactor: personalizedTimeFactor,
            randomSeed1: this.randomSeed1,
            randomSeed2: this.randomSeed2,
            randomSeed3: this.randomSeed3,
            randomSeed4: this.randomSeed4
        });

        this.scene.fireAppearance.apply();   
        this.scene.texturefire.bind(1);      

        this.scene.pushMatrix();
            this.scene.translate(2.5, 0.8, 2.5);  
            this.scene.rotate(-Math.PI/2, 1, 0, 0); // Orient fire vertically
            this.scene.scale(5, 5, 1);          
            this.fire.display();
        this.scene.popMatrix();

        // Restore default shader for other objects
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}
