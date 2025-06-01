import { CGFobject } from './lib/CGF.js';

/**
 * Represents a flat circular surface made of triangular segments radiating from center
 * Useful for creating flat circular surfaces like platforms, discs, or ground areas
 */
export class MyCircle extends CGFobject {
    constructor(scene, radius, slices, texturePath = null) {
        super(scene);
        
        this.scene = scene;
        this.radius = radius;
        this.slices = slices; // Number of triangular segments
        this.texturePath = texturePath;
        
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Central vertex - all triangles connect to this point
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 1, 0); // Normal pointing up (Y-axis)
        this.texCoords.push(0.5, 0.5); // Center of texture

        // Generate perimeter vertices in a circle
        for (let i = 0; i <= this.slices; i++) {
            const angle = (2 * Math.PI * i) / this.slices;
            const x = this.radius * Math.cos(angle);
            const z = this.radius * Math.sin(angle);
            
            this.vertices.push(x, 0, z);
            this.normals.push(0, 1, 0); // All normals point up for flat surface
            
            // Map circular coordinates to square texture space [0,1]
            const u = (Math.cos(angle) + 1) / 2;
            const v = (Math.sin(angle) + 1) / 2;
            this.texCoords.push(u, v);
        }

        // Create triangular faces from center to consecutive edge vertices
        for (let i = 0; i < this.slices; i++) {
            this.indices.push(0, i + 1, i + 2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display() {
        super.display();
    }
}