import { CGFobject } from './lib/CGF.js';
import { MyTree } from './MyTree.js';

/**
 * Class MyForest
 * Generates a forest of MyTree objects arranged in a grid (rows x cols)
 * within a fixed area (width x depth).
 */
export class MyForest extends CGFobject {
    /**
     * @param {CGFscene} scene - the scene
     * @param {number} rows - number of tree rows
     * @param {number} cols - number of tree columns
     * @param {number} areaWidth - width of the forest area (X direction)
     * @param {number} areaDepth - depth of the forest area (Z direction)
     * @param {number} forestX - X coordinate to translate the entire forest
     * @param {number} forestZ - Z coordinate to translate the entire forest
     * @param {Array} firePositions - optional array of [row, col] pairs for trees with fire
     */
    constructor(scene, rows, cols, areaWidth, areaDepth, forestX = 0, forestZ = 0, firePositions = []) {
        super(scene);
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.forestX = forestX;
        this.forestZ = forestZ;

        // Track current transformation for world position calculations
        this.currentTransform = { x: forestX, y: 0, z: forestZ };

        // Calculate spacing between tree centers based on area dimensions
        this.spacingX = this.areaWidth / this.cols;
        this.spacingZ = this.areaDepth / this.rows;

        this.trees = [];

        // Convert firePositions to Set for O(1) lookup performance
        const fireTreePositions = new Set(
            firePositions.map(([row, col]) => `${row},${col}`)
        );

        // Randomization bounds for tree variety
        const MIN_TILT = 0;
        const MAX_TILT = 15;
        const MIN_TRUNK_RADIUS = 3;
        const MAX_TRUNK_RADIUS = 4;
        const MIN_TREE_HEIGHT = 10;
        const MAX_TREE_HEIGHT = 20;
        const MIN_GREEN = 0.65;
        const MAX_GREEN = 0.75;
        const MAX_POSITION_OFFSET = 0.25; // Maximum offset as fraction of spacing

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const positionKey = `${i},${j}`;
                const shouldHaveFire = fireTreePositions.has(positionKey);

                // Generate random tree characteristics within defined bounds
                const tiltAngle = Math.random() * (MAX_TILT - MIN_TILT) + MIN_TILT;
                const tiltAxis = Math.random() < 0.5 ? 'x' : 'z';
                const trunkRadius = Math.random() * (MAX_TRUNK_RADIUS - MIN_TRUNK_RADIUS) + MIN_TRUNK_RADIUS;
                const treeHeight = Math.random() * (MAX_TREE_HEIGHT - MIN_TREE_HEIGHT) + MIN_TREE_HEIGHT;
                const crownColor = [
                    0,
                    Math.random() * (MAX_GREEN - MIN_GREEN) + MIN_GREEN,
                    0,
                    1
                ];

                // Calculate grid position with random offset for natural appearance
                const centerX = -this.areaWidth / 2 + this.spacingX * (j + 0.5);
                const centerZ = -this.areaDepth / 2 + this.spacingZ * (i + 0.5);
                const offsetX = (Math.random() * 2 - 1) * this.spacingX * MAX_POSITION_OFFSET;
                const offsetZ = (Math.random() * 2 - 1) * this.spacingZ * MAX_POSITION_OFFSET;
                const localX = centerX + offsetX;
                const localZ = centerZ + offsetZ;

                const tree = new MyTree(
                    this.scene,
                    tiltAngle,
                    tiltAxis,
                    trunkRadius,
                    treeHeight,
                    crownColor,
                    'textures/trunk.jpg',
                    'textures/leaves1.jpg',
                    'textures/leaves.jpg',
                    'textures/grass.jpg',
                    shouldHaveFire
                );
                
                // Store both local positions (relative to forest center) and world positions
                this.trees.push({ 
                    tree, 
                    posX: localX,
                    posZ: localZ,
                    worldX: localX + this.forestX,
                    worldY: 0,
                    worldZ: localZ + this.forestZ,
                    row: i, 
                    col: j 
                });
            }
        }

        this.updateTreeWorldPositions();
    }

    // Updates forest position and recalculates all tree world coordinates
    setForestPosition(x, z) {
        this.forestX = x;
        this.forestZ = z;
        this.currentTransform = { x, y: 0, z };
        this.updateTreeWorldPositions();
    }

    // Updates current transformation matrix and recalculates world positions
    setCurrentTransformation(x, y, z) {
        this.forestX = x;
        this.forestZ = z;
        this.currentTransform = { x, y, z };
        this.updateTreeWorldPositions();
    }

    // Recalculates world positions for all trees based on current forest position
    updateTreeWorldPositions() {
        this.trees.forEach(treeData => {
            treeData.worldX = treeData.posX + this.forestX;
            treeData.worldY = this.currentTransform.y;
            treeData.worldZ = treeData.posZ + this.forestZ;
        });
    }

    // Returns all trees with their current world positions and indices
    getTreesWorldPositions() {
        this.updateTreeWorldPositions();
        return this.trees.map((treeData, index) => ({
            ...treeData,
            index: index
        }));
    }

    // Alternative method for matrix-based position calculation (currently uses stored transform)
    getTreesWorldPositionsFromMatrix() {
        return this.getTreesWorldPositions();
    }

    // Returns world position of specific tree by grid coordinates
    getTreeWorldPosition(row, col) {
        this.updateTreeWorldPositions();
        const tree = this.trees.find(t => t.row === row && t.col === col);
        return tree ? { x: tree.worldX, y: tree.worldY, z: tree.worldZ } : null;
    }

    // Returns all trees within specified radius of given world coordinates
    getTreesInRadius(worldX, worldZ, radius) {
        this.updateTreeWorldPositions();
        return this.trees.filter(treeData => {
            const dx = treeData.worldX - worldX;
            const dz = treeData.worldZ - worldZ;
            const distance = Math.sqrt(dx * dx + dz * dz);
            return distance <= radius;
        });
    }

    getForestX() {
        return this.forestX;
    }

    getForestZ() {
        return this.forestZ;
    }

    getForestPosition() {
        return { x: this.forestX, z: this.forestZ };
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.forestX, 0, this.forestZ);
        
        for (const { tree, posX, posZ } of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(posX, 0, posZ);
            tree.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
}