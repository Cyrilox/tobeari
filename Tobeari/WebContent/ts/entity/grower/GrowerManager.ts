/**
 * GrowerManager
 */
class GrowerManager {

	public palmtree: Palmtree;
	public plants: Plant[] = [];
    
    constructor(private level: Level, private map: Map, private controller: Controller, waterpoint: Waterpoint) {
        let radius = Math.ceil(waterpoint.sizeSprite / 2);
        let waterpointNeighbors = map.getRingCells(waterpoint.cell, radius, true, true);
        let palmtreeCell = waterpointNeighbors[Tools.getRandomArbitrary(0, waterpointNeighbors.length, true)];
        this.palmtree = new Palmtree(map, controller, palmtreeCell);
    }

    //*** Plant ***

	/**
     * Add a plant
     */
	public createPlant(cell: Cell): Plant {
		let plant = new Plant(this.level, this.map, this.controller, cell);
		this.plants.push(plant);
		return plant;
	}
	
	/**
     * Return the closest plant find in a radius, or null
     */
	public getClosestEatablePlant(prey: Prey): Plant {
		let plant: Plant, closestPlant: Plant = null, distance: number, closestDistance = 0;
		let cellHex = prey.cell.hex;
		let detectionRadius = prey.plantDetectionDistance;
		
		for(let i in this.plants) {
			plant = this.plants[i];
			if(plant.isAlive() && plant.isGrown()) {
				distance = cellHex.distance(plant.cell.hex);
				if(distance <= detectionRadius && (closestPlant == null || distance < closestDistance)) {
					closestPlant = plant;
					closestDistance = distance;
				}
			}
		}
		
		return closestPlant;
	}
}