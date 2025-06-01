import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MySphere } from "./MySphere.js";

export class MyPanorama extends CGFobject {
    /**
     * Constructs the panorama.
     * @param {CGFscene} scene - The scene where the panorama will be rendered.
     * @param {CGFtexture} texture - The equirectangular panoramic texture.
     */
    constructor(scene, texture) {
        super(scene);
        this.texture = texture;
        
        // Inverted sphere with inward-facing normals for viewing from inside
        this.sphere = new MySphere(scene, 40, 20, true);

        // Emissive material to ensure panorama is always fully lit regardless of scene lighting
        this.material = new CGFappearance(scene);
        this.material.setAmbient(1, 1, 1, 1);
        this.material.setDiffuse(0, 0, 0, 1);    // No diffuse lighting
        this.material.setSpecular(0, 0, 0, 1);   // No specular highlights
        this.material.setEmission(1, 1, 1, 1);   // Full emission for consistent brightness
        this.material.setShininess(10);
        this.material.setTexture(this.texture);
        this.material.setTextureWrap('REPEAT', 'REPEAT');
    }

    /**
     * Display the panorama.
     * The panorama sphere follows the camera position to create infinite distance illusion.
     */
    display() {
        this.scene.pushMatrix();

        // Move panorama center to camera position so it appears infinitely distant
        const camPos = this.scene.camera.position;
        this.scene.translate(camPos[0], camPos[1], camPos[2]);

        // Large scale ensures panorama encompasses entire scene
        this.scene.scale(200, 200, 200);

        this.material.apply();
        this.sphere.display();

        this.scene.popMatrix();
    }
}