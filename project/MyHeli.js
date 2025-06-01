import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyCylinder } from './MyCylinder.js';

export class MyHeli extends CGFobject {
    constructor(scene, position) {
        super(scene);
        this.scene = scene;
        this.originalpos = position ? [...position] : [0, 0, 0];
        this.pos = position ? [...position] : [0, 0, 0]; 
        this.velocity = [0, 0, 0];
        this.orientation = 0; // rotation around Y axis
        this.speed = 0;
        
        // Rotor animation properties
        this.rotorAngle = 0;
        this.tailRotorAngle = 0;
        this.rotorSpeed = 0;
        
        // Flight state machine
        this.isFlying = false;
        this.targetAltitude = 0;
        this.cruisingAltitude = 35;
        this.landingAltitude = 2;
        this.lowAltitude = 10;

        this.userControlEnabled = false;
        this.isAutoLanding = false;
        this.autoLandingStage = 0;
        this.helipadPosition = [0, 0, 0];
        
        // Realistic helicopter tilt for banking/pitching
        this.forwardTilt = 0;
        this.sideTilt = 0;
        this.targetForwardTilt = 0;
        this.targetSideTilt = 0;
        
        // Water collection and fire fighting system
        this.hasWater = false;
        this.bucketVisible = false;
        this.bucketHeight = -2;
        this.ropeLength = 1.5;
        this.bucketSwing = 0; // Physics simulation for bucket movement
        this.isCollectingWater = false;
        this.waterCollectionStage = 0;
        this.lakePosition = [30, 0, 70];
        this.lakeRadius = 20;
        this.waterSphere = null;

        // Water dropping physics and fire detection
        this.isDropping = false;
        this.dropTimer = 0;
        this.waterDropY = 0;
        this.waterDropWorldX = 0;
        this.waterDropWorldZ = 0;
        this.waterDropTargetX = 0;
        this.waterDropTargetZ = 0;
        this.shouldCheckForFires = false;
        this.forestReference = null; // Reference to forest for fire extinguishing

        this.cockpitTexturePath = 'textures/cockpit.jpg';
        this.skidsTexturePath = 'textures/skids.jpg';
        this.bodyTexturePath = 'textures/body.jpg';
        this.engineTexturePath = 'textures/engine.jpg';
        this.bucketTexturePath = 'textures/bucket.jpg';

        this.initMaterials();
    }
    
    initMaterials() {
        // Red helicopter body material
        this.bodyMaterial = new CGFappearance(this.scene);
        this.bodyMaterial.setAmbient(0.2, 0.05, 0.05, 1);
        this.bodyMaterial.setDiffuse(0.9, 0.1, 0.1, 1);
        this.bodyMaterial.setSpecular(0.8, 0.8, 0.8, 1);
        this.bodyMaterial.setShininess(50);
        this.bodyMaterial.setTexture(new CGFtexture(this.scene, this.bodyTexturePath));
        
        // Dark rotor blades (low visibility when spinning)
        this.rotorMaterial = new CGFappearance(this.scene);
        this.rotorMaterial.setAmbient(0.05, 0.05, 0.05, 1);
        this.rotorMaterial.setDiffuse(0.05, 0.05, 0.05, 1);
        this.rotorMaterial.setSpecular(0.3, 0.3, 0.3, 1);
        this.rotorMaterial.setShininess(30);
        
        // Transparent cockpit glass with high reflectivity
        this.glassMaterial = new CGFappearance(this.scene);
        this.glassMaterial.setAmbient(0.1, 0.1, 0.3, 1);
        this.glassMaterial.setDiffuse(0.1, 0.1, 0.4, 0.6);
        this.glassMaterial.setSpecular(1, 1, 1, 1);
        this.glassMaterial.setShininess(100);
        this.glassMaterial.setTexture(new CGFtexture(this.scene, this.cockpitTexturePath));
        
        // Metallic engine and detail components
        this.detailMaterial = new CGFappearance(this.scene);
        this.detailMaterial.setAmbient(0.2, 0.2, 0.2, 1);
        this.detailMaterial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.detailMaterial.setSpecular(0.7, 0.7, 0.7, 1);
        this.detailMaterial.setShininess(70);
        this.detailMaterial.setTexture(new CGFtexture(this.scene, this.engineTexturePath));
        
        // Landing skid material (matte metal)
        this.skidMaterial = new CGFappearance(this.scene);
        this.skidMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.skidMaterial.setDiffuse(0.3, 0.3, 0.3, 1);
        this.skidMaterial.setSpecular(0.2, 0.2, 0.2, 1);
        this.skidMaterial.setShininess(20);
        this.skidMaterial.setTexture(new CGFtexture(this.scene, this.skidsTexturePath));

        this.bucketMaterial = new CGFappearance(this.scene);
        this.bucketMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.bucketMaterial.setDiffuse(0.3, 0.3, 0.3, 1);
        this.bucketMaterial.setSpecular(0.2, 0.2, 0.2, 1);
        this.bucketMaterial.setShininess(20);
        this.bucketMaterial.setTexture(new CGFtexture(this.scene, this.bucketTexturePath));

        // Translucent water with high reflectivity
        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0.1, 0.3, 0.8, 1);
        this.waterMaterial.setDiffuse(0.2, 0.5, 1.0, 0.8);
        this.waterMaterial.setSpecular(0.8, 0.8, 1.0, 1);
        this.waterMaterial.setShininess(100);
    }

    setForestReference(forest) {
        this.forestReference = forest;
    }

    // User control methods with realistic helicopter physics
    turn(direction) {
        if (!this.userControlEnabled) return;
        this.orientation += direction * 0.05;
        this.targetSideTilt = -direction * 0.2; // Bank helicopter when turning
    }

    accelerate(direction) {
        if (!this.userControlEnabled) return;
        const maxSpeed = 3;
        this.speed += direction * 0.05 * this.scene.speedFactor;
        this.speed = Math.max(-maxSpeed, Math.min(maxSpeed, this.speed));
        
        this.targetForwardTilt = direction * 0.15; // Pitch nose down/up when accelerating
        
        // Convert orientation and speed to world velocity
        this.velocity[0] = Math.sin(this.orientation) * this.speed;
        this.velocity[2] = Math.cos(this.orientation) * this.speed;
    }
    
    takeOff() {
        if (!this.isFlying) {
            this.isFlying = true;
            this.targetAltitude = this.cruisingAltitude;
            this.rotorSpeed = 1.0;
            this.userControlEnabled = false;
            this.bucketVisible = true;
        }
    }

    // Intelligent landing/water collection based on helicopter location
    startAutoLandingOrWaterCollecting() {
        const dx = this.pos[0] - this.lakePosition[0];
        const dz = this.pos[2] - this.lakePosition[2];
        const distanceToLake = Math.sqrt(dx*dx + dz*dz);
        
        // If over lake, collect water; otherwise land at helipad
        if (distanceToLake <= this.lakeRadius && this.isFlying && this.userControlEnabled) {
            this.isCollectingWater = true;
            this.waterCollectionStage = 0;
            this.userControlEnabled = false;
            this.targetAltitude = 6;
            this.bucketVisible = true;
        } else if (this.isFlying && this.userControlEnabled) {
            this.isAutoLanding = true;
            this.autoLandingStage = 0;
            this.userControlEnabled = false;
            this.hasWater = false;
            this.bucketVisible = false;
        }
    }

    takeOffFromLake() {
        if (this.isCollectingWater && this.waterCollectionStage === 1) {
            this.waterCollectionStage = 2;
            this.targetAltitude = this.cruisingAltitude;
            this.userControlEnabled = false;
        }
    }
    
    dropWater() {
        if (this.hasWater) {
            this.hasWater = false;
            this.isDropping = true;
            this.dropTimer = 0;
            this.waterDropY = this.pos[1] - 5.6;
            this.waterDropWorldX = this.pos[0];
            this.waterDropWorldZ = this.pos[2];
            
            // Store target for fire detection when water hits ground
            this.waterDropTargetX = this.pos[0];
            this.waterDropTargetZ = this.pos[2];
            this.shouldCheckForFires = true;
        }
    }

    // Main game loop update method
    update(deltaTime) {
        // Animate rotors when helicopter is active
        if (this.isFlying || this.rotorSpeed > 0) {
            this.rotorAngle += deltaTime * this.rotorSpeed * 0.01;
            this.tailRotorAngle += deltaTime * this.rotorSpeed * 0.01;
            
            if (this.rotorAngle > 2 * Math.PI) this.rotorAngle -= 2 * Math.PI;
            if (this.tailRotorAngle > 2 * Math.PI) this.tailRotorAngle -= 2 * Math.PI;
        }

        // Bucket physics - swings based on movement
        if (this.bucketVisible && this.isFlying) {
            this.bucketSwing += (this.speed * 0.1 * 0.5);
            this.bucketSwing *= 0.95; // Damping
        }

        if (this.isFlying) {
            // Smooth altitude transitions
            const altitudeDiff = this.targetAltitude - this.pos[1];
            if (Math.abs(altitudeDiff) > 0.1) {
                this.pos[1] += altitudeDiff * 0.06;
            }

            // Update world position
            this.pos[0] += this.velocity[0];
            this.pos[2] += this.velocity[2];

            // Realistic helicopter physics with gradual deceleration
            this.speed *= 0.98;
            this.forwardTilt += (this.targetForwardTilt - this.forwardTilt) * 0.15;
            this.sideTilt += (this.targetSideTilt - this.sideTilt) * 0.15;
            this.targetForwardTilt *= 0.90;
            this.targetSideTilt *= 0.90;
            this.velocity[0] = Math.sin(this.orientation) * this.speed;
            this.velocity[2] = Math.cos(this.orientation) * this.speed;

            // Enable control when reaching cruise altitude
            if (!this.userControlEnabled && !this.isAutoLanding) {
                if (Math.abs(this.pos[1] - this.cruisingAltitude) < 1.0) {
                    this.userControlEnabled = true;
                }
            }
        } else {
            this.rotorSpeed *= 0.98; // Rotor spin-down when landed
        }

        // Auto-landing state machine
        if (this.isAutoLanding) {
            if (this.autoLandingStage === 0) {
                // Navigate to helipad
                const dx = this.helipadPosition[0] - this.pos[0];
                const dz = this.helipadPosition[2] - this.pos[2];
                const distance = Math.sqrt(dx*dx + dz*dz);
                
                if (distance > 1.0) {
                    this.pos[0] += dx * 0.02;
                    this.pos[2] += dz * 0.02;
                    this.orientation = Math.atan2(dx, dz);
                } else {
                    this.autoLandingStage = 1;
                    this.speed = 0;
                    this.targetAltitude = this.helipadPosition[1];
                }
                this.bucketVisible = true;
            } else if (this.autoLandingStage === 1) {
                // Descend to landing
                if (Math.abs(this.pos[1] - this.helipadPosition[1]) < 1.0) {
                    this.isFlying = false;
                    this.isAutoLanding = false;
                    this.rotorSpeed = 0.8;
                    this.speed = 0;
                    this.velocity = [0, 0, 0];
                    this.userControlEnabled = false;
                }
                this.bucketVisible = false;
            }
        }

        // Water collection state machine
        if (this.isCollectingWater) {
            if (this.waterCollectionStage === 0) {
                // Descend to water level
                this.userControlEnabled = false;
                this.speed = 0;
                this.velocity = [0, 0, 0];
                if (Math.abs(this.pos[1] - 6) < 0.5) {
                    this.waterCollectionStage = 1;
                    this.hasWater = true;
                    this.speed = 0;
                    this.velocity = [0, 0, 0];
                    this.userControlEnabled = false;
                }
            } else if (this.waterCollectionStage === 2) {
                // Ascend with water
                if (Math.abs(this.pos[1] - this.cruisingAltitude) < 1.0) {
                    this.isCollectingWater = false;
                    this.userControlEnabled = true;
                }
            }
        }

        // Water drop physics simulation
        if (this.isDropping) {
            this.waterDropY -= 0.3;
            
            // Check ground collision with buffer for reliable detection
            if (this.waterDropY <= 0.2) {
                this.isDropping = false;
                this.waterDropY = 0;
                
                // Trigger fire extinguishing when water hits ground
                if (this.shouldCheckForFires && this.forestReference) {
                    this.checkAndExtinguishFires();
                    this.shouldCheckForFires = false;
                }
            }
        }
    }
    
    // Fire extinguishing system with area-of-effect detection
    checkAndExtinguishFires() {
        if (!this.forestReference || !this.forestReference.trees) {
            return;
        }

        const extinguishRadius = 30;
        let extinguishedCount = 0;
        const extinguishedPositions = [];
        
        // Check all trees within extinguish radius (2D distance only)
        for (let treeData of this.forestReference.trees) {
            const tree = treeData.tree;
            const treeX = treeData.worldX;
            const treeZ = treeData.worldZ;
            
            if (!tree.fire) continue;
            
            // Calculate 2D distance ignoring height
            const dx = this.waterDropTargetX - treeX;
            const dz = this.waterDropTargetZ - treeZ;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance <= extinguishRadius) {
                tree.fire = false;
                extinguishedCount++;
                extinguishedPositions.push({ x: treeX, z: treeZ });
            }
        }
        
        return {
            success: extinguishedCount > 0,
            count: extinguishedCount,
            positions: extinguishedPositions
        };
    }

    attemptFireExtinguish() {
        if (!this.hasWater) {
            return { success: false, message: "No water available!" };
        }

        this.dropWater();
        
        return { 
            success: true, 
            message: "Water dropped! Fires will be extinguished when water hits the ground."
        };
    }
    
    display() {
        this.scene.pushMatrix();
        
        // Apply helicopter world transform
        this.scene.translate(this.pos[0], this.pos[1], this.pos[2]);
        this.scene.rotate(this.orientation, 0, 1, 0);
        
        // Apply realistic banking and pitching
        this.scene.rotate(this.forwardTilt, 1, 0, 0);
        this.scene.rotate(this.sideTilt, 0, 0, 1);
        
        this.scene.scale(3, 3, 3);
        
        const sphere = new MySphere(this.scene, 24, 12);
        const cylinder = new MyCylinder(this.scene, 16, 1, true);
        
        // Main fuselage (stretched sphere)
        this.scene.pushMatrix();
        this.bodyMaterial.apply();
        this.scene.scale(1.2, 0.8, 2.5);
        sphere.display();
        this.scene.popMatrix();
        
        // Transparent cockpit canopy
        this.scene.pushMatrix();
        this.glassMaterial.apply();
        this.scene.translate(0, 0.2, 1.6);
        this.scene.scale(1.0, 0.6, 0.6); 
        this.scene.rotate(Math.PI/8, 1, 0, 0);
        sphere.display();
        this.scene.popMatrix();
        
        // Tail boom (long cylinder)
        this.scene.pushMatrix();
        this.bodyMaterial.apply();
        this.scene.translate(0, 0.1, -1.5);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.3, 3.5, 0.3);
        cylinder.display();
        this.scene.popMatrix();
        
        // Vertical tail fin
        this.scene.pushMatrix();
        this.bodyMaterial.apply();
        this.scene.translate(0, 0, -4.5);
        this.scene.scale(0.06, 0.7, 0.4);
        sphere.display();
        this.scene.popMatrix();

        // Main rotor mast
        this.scene.pushMatrix();
        this.detailMaterial.apply();
        this.scene.translate(0.1, 1, 0.3);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.15, 0.15, 0.4);
        cylinder.display();
        this.scene.popMatrix();
        
        // Rotor hub assembly
        this.scene.pushMatrix();
        this.detailMaterial.apply();
        this.scene.translate(0.1, 1.0, 0.15);
        this.scene.scale(0.3, 0.15, 0.3);
        cylinder.display();
        this.scene.popMatrix();
        
        // Animated main rotor blades (two perpendicular blades)
        this.scene.pushMatrix();
        this.rotorMaterial.apply();
        this.scene.translate(0, 1.06, 0.2);
        this.scene.rotate(this.rotorAngle, 0, 1, 0);
        
        // First rotor blade
        this.scene.pushMatrix();
        this.scene.scale(4, 0.04, 0.25);
        cylinder.display();
        this.scene.popMatrix();
        
        // Second rotor blade (perpendicular)
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(4, 0.04, 0.25);
        cylinder.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
        
        // Animated tail rotor blades
        this.scene.pushMatrix();
        this.rotorMaterial.apply();
        this.scene.translate(0.2, 0.1, -4.5);
        this.scene.rotate(this.tailRotorAngle, 1, 0, 0);
        
        // First tail blade
        this.scene.pushMatrix();
        this.scene.scale(0.05, 0.8, 0.1);
        cylinder.display();
        this.scene.popMatrix();
        
        // Second tail blade (perpendicular)
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.05, 0.8, 0.1);
        cylinder.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
        
        this.displayLandingSkids(cylinder);
        
        // Water bucket system with physics simulation
        if (this.bucketVisible) {
            // Suspension rope
            this.scene.pushMatrix();
            this.skidMaterial.apply();
            this.scene.translate(0, this.bucketHeight + 1.5, 0);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.scene.rotate(this.bucketSwing * 0.1, 0, 1, 0);
            this.scene.scale(0.02, 0.02, this.ropeLength);
            cylinder.display();
            this.scene.popMatrix();
            
            // Swinging bucket with physics
            this.scene.pushMatrix();
            this.bucketMaterial.apply();
            this.scene.translate(
                Math.sin(this.bucketSwing * 0.1) * 0.1,
                this.bucketHeight, 
                0
            );
            this.scene.rotate(this.bucketSwing * 0.1, 0, 1, 0);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.scene.scale(0.3, 0.3, 0.4);
            cylinder.display();
            this.scene.popMatrix();
            
            // Bucket bottom
            this.scene.pushMatrix();
            this.bucketMaterial.apply();
            this.scene.translate(
                Math.sin(this.bucketSwing * 0.1) * 0.1,
                this.bucketHeight - 0.4,
                0
            );
            this.scene.rotate(this.bucketSwing * 0.1, 0, 1, 0);
            this.scene.scale(0.27, 0.35, 0.27);
            sphere.display();
            this.scene.popMatrix();

            // Water inside bucket when collected
            if (this.hasWater) {
                this.scene.pushMatrix();
                this.waterMaterial.apply();
                this.scene.translate(
                    Math.sin(this.bucketSwing * 0.1) * 0.1,
                    this.bucketHeight - 0.1, 
                    0
                );
                this.scene.scale(0.2, 0.2, 0.2);
                sphere.display();
                this.scene.popMatrix();
            }
        }
        
        // Engine compartment housing
        this.scene.pushMatrix();
        this.detailMaterial.apply();
        this.scene.translate(0, 0.52, 0);
        this.scene.scale(0.8, 0.3, 1.2);
        sphere.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();

        // Render falling water droplet with physics
        if (this.isDropping) {
            this.scene.pushMatrix();
            this.waterMaterial.apply();
            this.scene.translate(this.waterDropWorldX, this.waterDropY, this.waterDropWorldZ);
            this.scene.scale(0.5, 0.5, 0.5);
            
            const waterSphere = new MySphere(this.scene, 12, 8);
            waterSphere.display();
            
            this.scene.popMatrix();
        }
    }
    
    // Complex landing skid geometry (structural framework)
    displayLandingSkids(cylinder) {
        const skidDistance = 0.9;
        const skidHeight = -0.9;

        // Left skid assembly
        this.scene.pushMatrix();
        this.skidMaterial.apply();
        
        // Left vertical struts
        this.scene.pushMatrix();
        this.scene.translate(-skidDistance, skidHeight/2 + 0.7, 0.8);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.08, 0.08, Math.abs(skidHeight) + 0.3);
        cylinder.display();
        this.scene.popMatrix();
        
        this.scene.pushMatrix();
        this.scene.translate(-skidDistance, skidHeight/2 + 0.7, -0.5);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.08, 0.08, Math.abs(skidHeight) + 0.3);
        cylinder.display();
        this.scene.popMatrix();
        
        // Left horizontal skid tube
        this.scene.pushMatrix();
        this.scene.translate(-skidDistance, skidHeight, -1.4);
        this.scene.rotate(Math.PI/2, 0, 0, 1);
        this.scene.scale(0.12, 0.12, 3.2);
        cylinder.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
        
        // Right skid assembly (mirror of left)
        this.scene.pushMatrix();
        this.skidMaterial.apply();
        
        // Right vertical struts
        this.scene.pushMatrix();
        this.scene.translate(skidDistance, skidHeight/2 + 0.7, 0.8);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.08, 0.08, Math.abs(skidHeight) + 0.3);
        cylinder.display();
        this.scene.popMatrix();
        
        this.scene.pushMatrix();
        this.scene.translate(skidDistance, skidHeight/2 + 0.7, -0.5);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.08, 0.08, Math.abs(skidHeight) + 0.3);
        cylinder.display();
        this.scene.popMatrix();
        
        // Right horizontal skid tube
        this.scene.pushMatrix();
        this.scene.translate(skidDistance, skidHeight, -1.4);
        this.scene.rotate(Math.PI/2, 0, 0, 1);
        this.scene.scale(0.12, 0.12, 3.2);
        cylinder.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }

    // Reset helicopter to initial state
    reset() {
        this.pos = [...this.originalpos];
        this.velocity = [0, 0, 0];
        this.orientation = 0;
        this.speed = 0;
        
        // Reset all flight states
        this.isFlying = false;
        this.targetAltitude = 0;
        this.userControlEnabled = false;
        this.isAutoLanding = false;
        this.autoLandingStage = 0;
        this.isCollectingWater = false;
        this.waterCollectionStage = 0;
        
        // Reset animation states
        this.rotorAngle = 0;
        this.tailRotorAngle = 0;
        this.rotorSpeed = 0;
        
        // Reset physics
        this.forwardTilt = 0;
        this.sideTilt = 0;
        this.targetForwardTilt = 0;
        this.targetSideTilt = 0;
        
        // Reset water system
        this.hasWater = false;
        this.bucketVisible = false;
        this.bucketSwing = 0;
        this.isDropping = false;
        this.dropTimer = 0;
        this.waterDropY = 0;
        this.shouldCheckForFires = false;
    }
}