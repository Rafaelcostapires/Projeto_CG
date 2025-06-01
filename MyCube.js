import { CGFobject } from './lib/CGF.js';
import { MyPlane } from "./MyPlane.js";

/**
 * Represents a textured cube made from six individual planes
 * Each face can be toggled on/off individually for debugging or special effects
 */
export class MyCube extends CGFobject {
    constructor(scene, texture) {
        super(scene);

        this.texture = texture;

        // Create six plane objects for cube faces
        this.scene.quad1 = new MyPlane(scene, 1, 0, 2, 0, 2); // Front
        this.scene.quad2 = new MyPlane(scene, 1, 0, 2, 0, 2); // Back
        this.scene.quad3 = new MyPlane(scene, 1, 0, 2, 0, 2); // Right
        this.scene.quad4 = new MyPlane(scene, 1, 0, 2, 0, 2); // Left
        this.scene.quad5 = new MyPlane(scene, 1, 0, 2, 0, 2); // Top
        this.scene.quad6 = new MyPlane(scene, 1, 0, 2, 0, 2); // Bottom

        // Toggle flags for each face (useful for debugging)
        this.scene.displayQuad1 = true;
        this.scene.displayQuad2 = true;
        this.scene.displayQuad3 = true;
        this.scene.displayQuad4 = true;
        this.scene.displayQuad5 = true;
        this.scene.displayQuad6 = true;
    }

    display() {
        // Front face (positive Z)
        if (this.scene.displayQuad1) {
            this.scene.pushMatrix();
            this.scene.translate(0, 0, 0.5);
            this.texture && this.texture.apply(); 
            this.scene.quad1.display();
            this.scene.popMatrix();
        }

        // Back face (negative Z) - rotated and flipped
        if (this.scene.displayQuad2) {
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI, 1, 0, 0); 
            this.scene.translate(0, 0, 0.5);
            this.scene.rotate(Math.PI, 0, 0, 1); // Additional rotation for proper orientation
            this.texture && this.texture.apply(); 
            this.scene.quad2.display();
            this.scene.popMatrix();
        }

        // Right face (positive X)
        if (this.scene.displayQuad3) {
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI / 2, 0, 1, 0); 
            this.scene.translate(0, 0, 0.5);
            this.texture && this.texture.apply(); 
            this.scene.quad3.display();
            this.scene.popMatrix();
        }

        // Left face (negative X)
        if (this.scene.displayQuad4) {
            this.scene.pushMatrix();
            this.scene.rotate(-Math.PI / 2, 0, 1, 0); 
            this.scene.translate(0, 0, 0.5);
            this.texture && this.texture.apply(); 
            this.scene.quad4.display();
            this.scene.popMatrix();
        }

        // Top face (positive Y)
        if (this.scene.displayQuad5) {
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI / 2, 1, 0, 0); 
            this.scene.translate(0, 0, 0.5);
            this.texture && this.texture.apply(); 
            this.scene.quad5.display();
            this.scene.popMatrix();
        }

        // Bottom face (negative Y)
        if (this.scene.displayQuad6) {
            this.scene.pushMatrix();
            this.scene.rotate(-Math.PI / 2, 1, 0, 0); 
            this.scene.translate(0, 0, 0.5);
            this.texture && this.texture.apply(); 
            this.scene.quad6.display();
            this.scene.popMatrix();
        }
    }
}
