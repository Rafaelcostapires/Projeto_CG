import {CGFobject} from '../lib/CGF.js';

/**
 * MyQuad
 * @constructor
 * @param {MyScene} scene - Reference to MyScene object
 * @param {Array} coords - Array of texture coordinates (optional)
 */
export class MyQuad extends CGFobject {
    constructor(scene, coords) {
        super(scene);
        this.initBuffers();
        if (coords != undefined)
            this.updateTexCoords(coords);
    }
    
    initBuffers() {
        // Square vertices centered at origin, 1x1 unit size
        this.vertices = [
            -0.5, -0.5, 0,  // Bottom-left (0)
             0.5, -0.5, 0,  // Bottom-right (1)
            -0.5,  0.5, 0,  // Top-left (2)
             0.5,  0.5, 0   // Top-right (3)
        ];

        // Two triangles forming a quad (counter-clockwise winding)
        this.indices = [
            0, 1, 2,
            1, 3, 2
        ];

        // All normals point towards positive Z
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        // Standard texture coordinates: (0,0) at top-left, (1,1) at bottom-right
        this.texCoords = [
            0, 1,  // Bottom-left
            1, 1,  // Bottom-right
            0, 0,  // Top-left
            1, 0   // Top-right
        ];
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates the texture coordinates of the quad
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(coords) {
        this.texCoords = [...coords];
        this.updateTexCoordsGLBuffers();
    }
}