import {CGFobject,CGFappearance,CGFtexture} from '../lib/CGF.js';
import {MyCylinder} from './MyCylinder.js';
import {MySphere} from './MySphere.js';
import { MyPlane } from './MyPlane.js';

export class MyLake extends CGFobject {
    constructor(scene) {
        super(scene); 
        this.corner = new MySphere(this.scene, 10, 10);
        this.edge = new MyCylinder(this.scene, 10, 10);
        this.plane = new MyPlane(this.scene, 50);

        // Appearance for lake border elements (using grass texture)
        this.scene.skyTexture1 = new CGFappearance(this.scene);
        this.scene.skyTexture1.setAmbient(0.3, 0.3, 0.3, 1);
        this.scene.skyTexture1.setDiffuse(0.7, 0.7, 0.7, 1);
        this.scene.skyTexture1.setSpecular(0.0, 0.0, 0.0, 1);
        this.scene.skyTexture1.setShininess(10);
        this.scene.skyTexture1.setTexture(new CGFtexture(this.scene, "textures/grass.jpg"));
        this.scene.skyTexture1.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        // Lake border construction using cylinders and spheres
        // Creates a rectangular border with rounded corners
        
        this.scene.skyTexture1.apply();
        
        // Bottom edge (horizontal cylinder)
        this.scene.pushMatrix();
        this.scene.translate(15.5, 0, 11.5);
        this.scene.scale(1, 1, 5);
        this.edge.display();
        this.scene.popMatrix();

        // Left edge (vertical cylinder)
        this.scene.pushMatrix();
        this.scene.translate(15.5, 0, 11.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(1, 1, 5);
        this.edge.display();
        this.scene.popMatrix();

        // Top edge (vertical cylinder)
        this.scene.pushMatrix();
        this.scene.translate(15.5, 0, 16.5);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(1, 1, 5);
        this.edge.display();
        this.scene.popMatrix();

        // Right edge (horizontal cylinder)
        this.scene.pushMatrix();
        this.scene.translate(20.5, 0, 11.5);
        this.scene.scale(1, 1, 5);
        this.edge.display();
        this.scene.popMatrix();

        // Corner spheres for rounded border appearance
        this.scene.pushMatrix();
        this.scene.translate(15.5, 0, 16.5);
        this.corner.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(20.5, 0, 11.5);
        this.corner.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(20.5, 0, 16.5);
        this.corner.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(15.5, 0, 11.5);
        this.corner.display();
        this.scene.popMatrix();

        // Water surface rendering with shader effects
        this.scene.setActiveShader(this.scene.water_shader);

        // Apply water textures (primary texture + secondary for effects)
        this.scene.waterAppearance.apply(); // Texture unit 0
        this.scene.texture2.bind(1);        // Texture unit 1

        // Render lake surface as horizontal plane
        this.scene.pushMatrix();
        this.scene.translate(18, 0.8, 14);    // Center the lake
        this.scene.rotate(-Math.PI/2, 1, 0, 0); // Orient horizontally
        this.scene.scale(5, 5, 1);            // Scale to desired size
        this.plane.display();
        this.scene.popMatrix();

        // Restore default shader for other objects
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}