import { CGFobject, CGFappearance, CGFtexture } from './lib/CGF.js';
import { MyCone } from './MyCone.js';
import { MyPyramid } from './MyPyramid.js';
import { MyCircle } from './MyCircle.js';
import { MyFire } from './MyFire.js';

export class MyTree extends CGFobject {
    constructor(scene, tiltAngle, tiltAxis, trunkRadius, treeHeight, crownColor, trunkTexturePath, crownTexturePath, topPyramidTexturePath, shadowTexturePath, fire = false) {
        super(scene);
        this.fire = fire;
        if (this.fire) { this.fire1 = new MyFire(this.scene, 30); }

        this.scene = scene;
        this.tiltAngle = tiltAngle;
        this.tiltAxis = tiltAxis;
        this.trunkRadius = trunkRadius;
        this.treeHeight = treeHeight;
        this.crownColor = crownColor;
        this.trunkTexturePath = trunkTexturePath;
        this.crownTexturePath = crownTexturePath;
        this.topPyramidTexturePath = topPyramidTexturePath;
        this.shadowTexturePath = shadowTexturePath;
        
        // Calculate tree proportions - trunk is 20% of total height
        this.trunkHeight = this.treeHeight * 0.2;
        this.crownHeight = this.treeHeight * 0.8;
        this.pyramidBase = this.trunkRadius * 2.5;
        this.pyramidHeight = 5;
        this.numPyramids = Math.ceil(this.crownHeight / this.pyramidHeight);
        
        // Create tree components
        this.trunk = new MyCone(this.scene, this.trunkRadius, this.treeHeight / 2, 20);
        this.crownLayers = [];
        for (let i = 0; i < this.numPyramids; i++) {
            this.crownLayers.push(new MyPyramid(this.scene, this.pyramidBase, this.pyramidHeight));
        }

        // Shadow is larger than trunk radius for realistic appearance
        this.shadow = new MyCircle(this.scene, 1.4 * this.trunkRadius, 16, this.shadowTexturePath);
        
        // Trunk appearance with brown wood-like colors
        this.trunkAp = new CGFappearance(this.scene);
        this.trunkAp.setAmbient(0.2, 0.11, 0.03, 1);
        this.trunkAp.setDiffuse(0.55, 0.27, 0.07, 1);
        this.trunkAp.setSpecular(0.1, 0.1, 0.1, 1);
        this.trunkAp.setShininess(10);
        if (this.trunkTexturePath) this.trunkAp.setTexture(new CGFtexture(this.scene, this.trunkTexturePath));

        // Crown appearance using provided crown color
        this.crownAp = new CGFappearance(this.scene);
        const [r, g, b, a = 1] = this.crownColor;
        this.crownAp.setAmbient(r * 0.3, g * 0.3, b * 0.3, a);
        this.crownAp.setDiffuse(r, g, b, a);
        this.crownAp.setSpecular(0.1, 0.1, 0.1, a);
        this.crownAp.setShininess(10);
        if (this.crownTexturePath) this.crownAp.setTexture(new CGFtexture(this.scene, this.crownTexturePath));

        // Top pyramid can have different texture from other crown layers
        this.topPyramidAp = new CGFappearance(this.scene);
        this.topPyramidAp.setAmbient(r * 0.3, g * 0.3, b * 0.3, a);
        this.topPyramidAp.setDiffuse(r, g, b, a);
        this.topPyramidAp.setSpecular(0.1, 0.1, 0.1, a);
        this.topPyramidAp.setShininess(10);
        if (this.topPyramidTexturePath) this.topPyramidAp.setTexture(new CGFtexture(this.scene, this.topPyramidTexturePath));

        // Shadow appearance with transparency
        this.shadowAp = new CGFappearance(this.scene);
        this.shadowAp.setAmbient(1.0, 1.0, 1.0, 1.0);  
        this.shadowAp.setDiffuse(0.5, 0.5, 0.5, 1.0);  
        this.shadowAp.setSpecular(0.1, 0.1, 0.1, 1.0); 
        this.shadowAp.setShininess(1);
        if (this.shadowTexturePath) {
            this.shadowAp.setTexture(new CGFtexture(this.scene, this.shadowTexturePath));
        }
    }

    display() {
        this.scene.pushMatrix();

        // Render shadow first (stays flat on ground regardless of tree tilt)
        this.scene.pushMatrix();
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        this.scene.translate(0, 0.01, 0); // Prevent z-fighting with ground
        this.scene.rotate(-Math.PI, 1, 0, 0); // Flip to lay flat
        this.shadowAp.apply();
        this.shadow.display();
        this.scene.gl.disable(this.scene.gl.BLEND);
        this.scene.popMatrix();

        // Apply tree tilt transformation
        const rad = this.tiltAngle * Math.PI / 180;
        if (this.tiltAxis === 'x') {
            this.scene.rotate(rad, 1, 0, 0);
            this.scene.translate(0, -1, 0);
        }
        else if (this.tiltAxis === 'z') {
            this.scene.rotate(rad, 0, 0, 1);
            this.scene.translate(0, -1, 0);
        }

        // Render fire effect if enabled
        if (this.fire && this.fire1) {
            this.scene.pushMatrix();
            
            // Position fire near top of tree crown
            const fireY = this.trunkHeight + (this.numPyramids - 2) * this.pyramidHeight * 2 / 3 + this.pyramidHeight;
            this.scene.translate(1, fireY, 8);
            
            // Orient fire effect properly
            this.scene.rotate(Math.PI/2, 0, 0, 1);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.scene.scale(0.4, 6, 0.4);
            this.fire1.display();
            this.scene.popMatrix();
        }

        // Render trunk
        this.scene.pushMatrix();
        this.trunkAp.apply();
        this.trunk.display();
        this.scene.popMatrix();

        // Render overlapping crown layers to create dense foliage effect
        for (let i = 0; i < this.numPyramids; i++) {
            const y = this.trunkHeight + i * this.pyramidHeight * 2 / 3; // 2/3 overlap
            this.scene.pushMatrix();
            this.scene.translate(0, y, 0);
            
            // Top pyramid gets special texture treatment
            if (i === this.numPyramids - 1) {
                this.topPyramidAp.apply();
            } else {
                this.crownAp.apply();
            }
            
            this.crownLayers[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}