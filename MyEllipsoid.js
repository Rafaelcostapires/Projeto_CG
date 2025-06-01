import { CGFobject } from './lib/CGF.js';

/**
 * Represents a 3D ellipsoid (stretched sphere) with independent scaling on each axis
 * Uses spherical coordinate mapping with custom scaling factors for each axis
 */
export class MyEllipsoid extends CGFobject {
    constructor(scene, a, b, c, slices, stacks) {
        super(scene);
        this.a = a; // X-axis scaling factor
        this.b = b; // Y-axis scaling factor  
        this.c = c; // Z-axis scaling factor
        this.slices = slices; // Horizontal divisions (longitude)
        this.stacks = stacks; // Vertical divisions (latitude)
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Generate vertices using spherical coordinates with ellipsoid scaling
        for (let stack = 0; stack <= this.stacks; stack++) {
            const phi = (stack / this.stacks) * Math.PI; // Latitude angle (0 to π)
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            for (let slice = 0; slice <= this.slices; slice++) {
                const theta = (slice / this.slices) * 2 * Math.PI; // Longitude angle (0 to 2π)
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                
                // Unit sphere coordinates
                const xUnit = cosTheta * sinPhi;
                const yUnit = cosPhi;
                const zUnit = sinTheta * sinPhi;
                
                // Scale by ellipsoid factors
                const x = this.a * xUnit;
                const y = this.b * yUnit;
                const z = this.c * zUnit;
                
                this.vertices.push(x, y, z);

                // Calculate normal for ellipsoid surface (requires inverse scaling)
                const nx = xUnit / this.a;
                const ny = yUnit / this.b;
                const nz = zUnit / this.c;
                
                // Normalize the normal vector
                const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
                this.normals.push(nx/length, ny/length, nz/length);
                
                // Spherical texture mapping
                this.texCoords.push(slice / this.slices, stack / this.stacks);
            }
        }

        // Generate triangular faces for ellipsoid surface
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                // Four vertices of current quad
                const a = stack * (this.slices + 1) + slice;
                const b = a + 1;
                const c = a + this.slices + 1;
                const d = c + 1;
                
                // Split quad into two triangles
                this.indices.push(a, b, c);
                this.indices.push(b, d, c);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}