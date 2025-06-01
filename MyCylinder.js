import { CGFobject } from '../lib/CGF.js';

/**
 * Represents a 3D cylinder with configurable dimensions and optional end caps
 * Height extends along Z-axis from 0 to 1, radius in XY plane
 */
export class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks, capped = false) {
        super(scene);
        this.slices = slices; // Number of sides around circumference
        this.stacks = stacks; // Number of vertical divisions (unused in current implementation)
        this.capped = capped; // Whether to include top/bottom circular faces
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const alphaAng = 2 * Math.PI / this.slices;

        // Generate vertex pairs (bottom and top) around the cylinder circumference
        for (let i = 0; i <= this.slices; i++) {
            const alpha = i * alphaAng;
            const x = Math.cos(alpha);
            const y = Math.sin(alpha);

            // Bottom vertex (Z = 0)
            this.vertices.push(x, y, 0);
            this.normals.push(x, y, 0); // Outward-pointing normal
            this.texCoords.push(i / this.slices, 0); // Wrap texture around

            // Top vertex (Z = 1)
            this.vertices.push(x, y, 1);
            this.normals.push(x, y, 0); // Same outward-pointing normal
            this.texCoords.push(i / this.slices, 1); // Top of texture
        }

        // Create rectangular faces around cylinder sides
        for (let i = 0; i < this.slices; i++) {
            // Two triangles per rectangular face
            this.indices.push(2 * i, 2 * i + 2, 2 * i + 1);
            this.indices.push(2 * i + 1, 2 * i + 2, 2 * i + 3);
        }

        // Add circular end caps if requested
        if (this.capped) {
            // Bottom cap (Z = 0, normal pointing down)
            const bottomCenterIndex = this.vertices.length / 3;
            this.vertices.push(0, 0, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push(0.5, 0.5); // Center of circular texture
            
            // Bottom cap perimeter vertices
            for (let i = 0; i <= this.slices; i++) {
                const alpha = i * alphaAng;
                const x = Math.cos(alpha);
                const y = Math.sin(alpha);
                
                this.vertices.push(x, y, 0);
                this.normals.push(0, 0, -1);
                // Map circle to square texture coordinates
                this.texCoords.push(0.5 + 0.5 * x, 0.5 + 0.5 * y);
            }
            
            // Bottom cap triangular faces
            for (let i = 0; i < this.slices; i++) {
                this.indices.push(
                    bottomCenterIndex,
                    bottomCenterIndex + i + 2,
                    bottomCenterIndex + i + 1
                );
            }
            
            // Top cap (Z = 1, normal pointing up)
            const topCenterIndex = this.vertices.length / 3;
            this.vertices.push(0, 0, 1);
            this.normals.push(0, 0, 1);
            this.texCoords.push(0.5, 0.5);
            
            // Top cap perimeter vertices
            for (let i = 0; i <= this.slices; i++) {
                const alpha = i * alphaAng;
                const x = Math.cos(alpha);
                const y = Math.sin(alpha);
                
                this.vertices.push(x, y, 1);
                this.normals.push(0, 0, 1);
                this.texCoords.push(0.5 + 0.5 * x, 0.5 + 0.5 * y);
            }
            
            // Top cap triangular faces
            for (let i = 0; i < this.slices; i++) {
                this.indices.push(
                    topCenterIndex,
                    topCenterIndex + i + 1,
                    topCenterIndex + i + 2
                );
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
