import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyWindow } from "./MyWindow.js";
import { MyCube } from "./MyCube.js";
import { MyQuad } from "./MyQuad.js";

/**
 * Represents a 3D building composed of a central tower and two side modules
 * Features windows, door, signage, and helipad on top
 */
export class MyBuilding extends CGFobject {
    constructor(scene, totalWidth, floorsSide, windowsPerFloor, windowTex, wallTex, doorTex, signTex, heliTex, color) {
        super(scene);

        // Convert UI slider value to appropriate 3D scene proportions
        this.totalWidth = (totalWidth / 12.5) * 5;
        this.floorsSide = floorsSide;
        this.centralFloors = this.floorsSide + 1;
        this.windowsPerFloor = windowsPerFloor;
        this.windowtex = windowTex;
        this.wallTex = wallTex;
        this.color = color;

        // Building structure components
        this.cube = new MyCube(scene, this.wallTex);
        this.sideRcube = new MyCube(scene, this.wallTex);
        this.sideLcube = new MyCube(scene, this.wallTex);
        this.window = new MyWindow(scene, this.windowtex);

        // Surface elements (door, signage, helipad)
        this.quad = new MyQuad(scene);
        this.doorTex = doorTex;
        this.quad1 = new MyQuad(scene);
        this.signTex = signTex;
        this.quad2 = new MyQuad(scene);
        this.heliTex = heliTex;
    }

    /**
     * Renders windows for a building module with proper floor and spacing distribution
     * @param {number} x - X position of the module center
     * @param {number} baseY - Total height of the module
     * @param {number} width - Width of the module
     * @param {number} floors - Number of floors in the module
     * @param {number} windowsPerFloor - Windows to place on each floor
     * @param {boolean} isCentral - Whether this is the central tower (affects ground floor rendering)
     */
    displayWindowsPerModule(x, baseY, width, floors, windowsPerFloor, isCentral) {
        const floorHeight = baseY / floors;
        const windowSpacing = width / (windowsPerFloor + 1);
        
        for (let floor = 0; floor < floors; floor++) {
            // Reserve ground floor space for entrance door in central tower
            if (isCentral && floor === 0) continue;
    
            const y = floorHeight * (floor + 0.5); 
    
            for (let w = 0; w < windowsPerFloor; w++) {
                const windowX = x - width / 2 + (w + 1) * windowSpacing;
                
                this.scene.pushMatrix();
                this.scene.translate(windowX, y, width / 2 + 0.01);
                this.scene.scale(this.totalWidth / 10, this.totalWidth / 10, this.totalWidth / 10); 
                this.window.display();
                this.scene.popMatrix();
            }
        }
    }

    /**
     * Main display method that renders the complete building structure
     * @param {number} width - Building width parameter
     * @param {number} floors - Number of floors for side modules
     * @param {number} windowsPerFloor - Windows per floor
     * @param {Array} color - RGB color array for building walls
     */
    display(width, floors, windowsPerFloor, color) {
        // Update dynamic parameters
        this.totalWidth = (width / 12.5) * 5;
        this.floorsSide = floors;
        this.centralFloors = this.floorsSide + 1;
        this.windowsPerFloor = windowsPerFloor;
        this.color = color;

        // Configure wall material properties
        this.wallTex.setAmbient(...this.color);
        this.wallTex.setDiffuse(...this.color);
        this.wallTex.setSpecular(0.1, 0.1, 0.1, 1);
        this.wallTex.setShininess(10);
        this.wallTex.apply();

        // Central tower (full height)
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalWidth / 2, 0);
        this.scene.scale(this.totalWidth, this.totalWidth, this.totalWidth);
        this.cube.display();
        this.scene.popMatrix();
        
        // Left side module (75% scale, positioned relative to center)
        this.scene.pushMatrix();
        this.scene.translate(this.totalWidth * 0.875, this.totalWidth * 0.375, 0);
        this.scene.scale(this.totalWidth * 0.75, this.totalWidth * 0.75, this.totalWidth * 0.75);
        this.sideLcube.display();
        this.scene.popMatrix();

        // Right side module (mirrored positioning)
        this.scene.pushMatrix();
        this.scene.translate(-this.totalWidth * 0.875, this.totalWidth * 0.375, 0);
        this.scene.scale(this.totalWidth * 0.75, this.totalWidth * 0.75, this.totalWidth * 0.75);
        this.sideRcube.display();
        this.scene.popMatrix();

        // Distribute windows across all three modules
        this.displayWindowsPerModule(0, this.totalWidth, this.totalWidth, floors + 1, windowsPerFloor, true);
        this.displayWindowsPerModule(this.totalWidth * 0.875, this.totalWidth * 0.75, this.totalWidth * 0.75, floors, windowsPerFloor, false);
        this.displayWindowsPerModule(-this.totalWidth * 0.875, this.totalWidth * 0.75, this.totalWidth * 0.75, floors, windowsPerFloor, false);

        // Entrance door at ground level of central tower
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalWidth/10, this.totalWidth/2 + 0.01);
        this.scene.scale(this.totalWidth/5, this.totalWidth/5, 1);
        this.doorTex.apply();
        this.quad.display();
        this.scene.popMatrix();

        // Building signage positioned above entrance
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalWidth/4, this.totalWidth/2 + 0.02);
        this.scene.scale(this.totalWidth/5, this.totalWidth/10, 1);
        this.signTex.apply();
        this.quad1.display();
        this.scene.popMatrix();

        // Helipad on central tower roof with alpha blending
        this.scene.pushMatrix();
        this.scene.translate(0, this.totalWidth + 0.02, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(this.totalWidth/2, this.totalWidth/2, 1);
        
        // Enable transparency for helipad texture
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        this.heliTex.apply();
        this.quad2.display();
        this.scene.gl.disable(this.scene.gl.BLEND);
        this.scene.popMatrix();
    }
}