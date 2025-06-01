import { CGFobject } from '../lib/CGF.js';

export class MySphere extends CGFobject {
    constructor(scene, slices, stacks, inverted = false) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.inverted = inverted; // Creates inside-out sphere for skyboxes/environment mapping
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Angular increments for longitude and latitude divisions
        const alpha = (2 * Math.PI) / this.slices;
        const beta = Math.PI / this.stacks;  

        // Generate vertices using spherical coordinates
        for (let stack = 0; stack <= this.stacks; stack++) {
            let delta = stack * beta; // Latitude angle from north pole
            
            for (let slice = 0; slice <= this.slices; slice++) {
                let theta = slice * alpha; // Longitude angle
                
                // Convert spherical to cartesian coordinates
                let x = Math.sin(delta) * Math.cos(theta);
                let y = Math.cos(delta);
                let z = Math.sin(delta) * Math.sin(theta);
                
                this.vertices.push(x, y, z);
                this.normals.push(x, y, z); // Normal equals position for unit sphere
                this.texCoords.push(slice / this.slices, stack / this.stacks);
            }
        }

        // Generate triangle indices for each quad formed by adjacent vertices
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                let first = stack * (this.slices + 1) + slice;
                let second = first + this.slices + 1;

                // Handle degenerate triangles at poles
                if (stack == 0) {
                    this.indices.push(second + 1, second, first);
                } else if (stack == this.stacks - 1) {
                    this.indices.push(first + 1, second, first);
                } else {
                    // Create two triangles for each quad
                    this.indices.push(first + 1, second, first);
                    this.indices.push(second + 1, second, first + 1);
                }
            }
        }

        // Invert sphere for inside-out rendering (skyboxes, environment maps)
        if (this.inverted) {
            // Flip normals to point inward
            for (let i = 0; i < this.normals.length; i++) {
                this.normals[i] = -this.normals[i];
            }
            // Reverse triangle winding order for correct backface culling
            for (let i = 0; i < this.indices.length; i += 3) {
                let temp = this.indices[i];
                this.indices[i] = this.indices[i + 2];
                this.indices[i + 2] = temp;
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}