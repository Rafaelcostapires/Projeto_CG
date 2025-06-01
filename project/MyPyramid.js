import { CGFobject } from '../lib/CGF.js';

export class MyPyramid extends CGFobject {
    constructor(scene, base, height) {
        super(scene);
        this.base = base;
        this.height = height;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const slices = 8;
        const b = this.base / 2;
        const h = this.height;
        const angleStep = (2 * Math.PI) / slices;

        let index = 0;

        // Pre-calculate circle vertices to ensure consistent positioning
        const circleVerts = [];
        for (let i = 0; i <= slices; i++) {
            const angle = i * angleStep;
            circleVerts.push([b * Math.cos(angle), 0, b * Math.sin(angle)]);
        }

        // Base construction: triangular fan from center to perimeter
        for (let i = 0; i < slices; i++) {
            const v0 = [0, 0, 0];
            const v1 = circleVerts[i];
            const v2 = circleVerts[i + 1];
            this.vertices.push(...v0, ...v1, ...v2);
            this.indices.push(index, index + 1, index + 2);
            
            // Downward-pointing normals for base
            for (let j = 0; j < 3; j++) this.normals.push(0, -1, 0);
            
            // Radial texture mapping for base
            this.texCoords.push(0.5, 0.5,
                                 (v1[0] / this.base) + 0.5, (v1[2] / this.base) + 0.5,
                                 (v2[0] / this.base) + 0.5, (v2[2] / this.base) + 0.5);
            index += 3;
        }

        // Side faces with smooth cone normals for rounded appearance
        const slope = b / h;
        for (let i = 0; i < slices; i++) {
            const v1 = circleVerts[i + 1];
            const v0 = [0, h, 0]; // apex
            const v2 = circleVerts[i];

            this.vertices.push(...v0, ...v1, ...v2);
            this.indices.push(index, index + 1, index + 2);

            // Calculate smooth cone normals for each vertex
            const na = [0, 1, 0]; // Apex normal points upward
            
            // Base vertex normals: outward and upward based on cone geometry
            const n1 = [v1[0], b, v1[2]];
            const n2 = [v2[0], b, v2[2]];
            const len1 = Math.hypot(n1[0], n1[1], n1[2]);
            const len2 = Math.hypot(n2[0], n2[1], n2[2]);
            
            this.normals.push(
                na[0], na[1], na[2],
                n1[0]/len1, n1[1]/len1, n1[2]/len1,
                n2[0]/len2, n2[1]/len2, n2[2]/len2
            );

            // Simple triangular texture mapping for sides
            this.texCoords.push(0.5, 0,
                                 1, 1,
                                 0, 1);
            index += 3;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}