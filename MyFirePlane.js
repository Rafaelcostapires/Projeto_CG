import {CGFobject} from './lib/CGF.js';

/**
 * Triangular mesh plane optimized for fire shader effects
 * Creates a triangle-shaped surface with dense subdivision for smooth flame animation
 */
export class MyFirePlane extends CGFobject {
    constructor(scene, nrDivs) {
        super(scene);
        this.nrDivs = nrDivs || 20;
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];
        
        let vertexIndex = 0;
        const vertexMap = []; // Track vertex indices for triangle generation
        
        // Generate vertices in triangular grid pattern
        for (let row = 0; row <= this.nrDivs; row++) {
            const rowVertices = [];
            const verticesInRow = row + 1; // Each row has one more vertex than the previous
            
            for (let col = 0; col < verticesInRow; col++) {
                const t = row / this.nrDivs; // Vertical interpolation parameter
                const s = verticesInRow > 1 ? col / (verticesInRow - 1) : 0.5; // Horizontal parameter
                
                // Define triangle corners: top point and two bottom corners
                const topX = 1, topY = 0;
                const bottomLeftX = -1, bottomLeftY = -1;
                const bottomRightX = -1, bottomRightY = 1;
                
                // Interpolate along bottom edge based on horizontal position
                const bottomX = (1 - s) * bottomLeftX + s * bottomRightX;
                const bottomY = (1 - s) * bottomLeftY + s * bottomRightY;
                
                // Interpolate from top vertex to bottom edge based on row position
                const x = (1 - t) * topX + t * bottomX;
                const y = (1 - t) * topY + t * bottomY;
                
                this.vertices.push(x, y, 0);
                this.normals.push(0, 0, 1);
                this.texCoords.push((x + 1) / 2, (y + 1) / 2); // Map coordinates to [0,1] range
                
                rowVertices.push(vertexIndex++);
            }
            vertexMap.push(rowVertices);
        }
        
        // Generate triangle indices for the triangular mesh
        for (let row = 0; row < this.nrDivs; row++) {
            const currentRow = vertexMap[row];
            const nextRow = vertexMap[row + 1];
            
            for (let i = 0; i < currentRow.length; i++) {
                // Upward-pointing triangles
                if (i < nextRow.length - 1) {
                    this.indices.push(currentRow[i], nextRow[i], nextRow[i + 1]);
                }
                
                // Downward-pointing triangles (fill gaps between upward triangles)
                if (i < currentRow.length - 1) {
                    this.indices.push(currentRow[i], nextRow[i + 1], currentRow[i + 1]);
                }
            }
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}