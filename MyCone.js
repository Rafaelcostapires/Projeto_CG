import { CGFobject } from '../lib/CGF.js';

/**
 * Represents a 3D cone with circular base and pointed top
 * Includes both the conical sides and flat bottom surface
 */
export class MyCone extends CGFobject {
    constructor(scene, baseRadius, height, slices = 20) {
        super(scene);
        this.baseRadius = baseRadius;
        this.height = height;
        this.slices = slices; // Number of sides around the cone
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Apex vertex at the top of the cone
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0); // Approximate normal for apex
        this.texCoords.push(0.5, 0); // Center of texture top

        const angleStep = 2 * Math.PI / this.slices;

        // Generate base circle vertices
        for (let i = 0; i <= this.slices; i++) {
            let angle = i * angleStep;
            let x = this.baseRadius * Math.cos(angle);
            let z = this.baseRadius * Math.sin(angle);

            this.vertices.push(x, 0, z);

            // Calculate outward-pointing normal for cone surface
            // Normal slopes outward based on cone geometry
            let sideNormal = [x, this.baseRadius / this.height, z];
            let len = Math.sqrt(sideNormal[0]**2 + sideNormal[1]**2 + sideNormal[2]**2);
            this.normals.push(sideNormal[0] / len, sideNormal[1] / len, sideNormal[2] / len);

            this.texCoords.push(i / this.slices, 1);
        }

        // Create triangular faces from apex to base edge
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(0, i + 1, i);
        }

        // Add center vertex for base circle
        const bottomCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0);
        this.normals.push(0, -1, 0); // Normal pointing down for base
        this.texCoords.push(0.5, 0.5);

        // Create triangular faces for the flat base
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(bottomCenterIndex, i, i + 1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}