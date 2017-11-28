/**
 * GrowerManager
 */
var GrowerManager = (function () {
    function GrowerManager(level, map, controller, waterpoint) {
        this.level = level;
        this.map = map;
        this.controller = controller;
        this.plants = [];
        var radius = Math.ceil(waterpoint.sizeSprite / 2);
        var waterpointNeighbors = map.getRingCells(waterpoint.cell, radius, true, true);
        var palmtreeCell = waterpointNeighbors[Tools.getRandomArbitrary(0, waterpointNeighbors.length, true)];
        this.palmtree = new Palmtree(map, controller, palmtreeCell);
    }
    //*** Plant ***
    /**
     * Add a plant
     */
    GrowerManager.prototype.createPlant = function (cell) {
        var plant = new Plant(this.level, this.map, this.controller, cell);
        this.plants.push(plant);
        return plant;
    };
    /**
     * Return the closest plant find in a radius, or null
     */
    GrowerManager.prototype.getClosestEatablePlant = function (prey) {
        var plant, closestPlant = null, distance, closestDistance = 0;
        var cellHex = prey.cell.hex;
        var detectionRadius = prey.plantDetectionDistance;
        for (var i in this.plants) {
            plant = this.plants[i];
            if (plant.isAlive() && plant.isGrown()) {
                distance = cellHex.distance(plant.cell.hex);
                if (distance <= detectionRadius && (closestPlant == null || distance < closestDistance)) {
                    closestPlant = plant;
                    closestDistance = distance;
                }
            }
        }
        return closestPlant;
    };
    return GrowerManager;
}());
