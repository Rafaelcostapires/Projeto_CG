import { CGFobject, CGFappearance } from "./lib/CGF.js";
import { MyPlane } from "./MyPlane.js";

export class MyWindow extends CGFobject {
  constructor(scene, appearance) {
    super(scene);
   
    this.appearance = appearance;
    
    // Use unit plane as base geometry for window
    this.plane = new MyPlane(scene, 1);
  }
  
  display() {
    this.scene.pushMatrix();
    this.scene.scale(1.5, 1.5, 1); // Scale to window dimensions
    this.appearance.apply();
    this.plane.display();
    this.scene.popMatrix();
  }
}

