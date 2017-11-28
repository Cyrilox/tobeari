/**
 * InertManager
 */
class InertManager {
    
	public waterpoint: Waterpoint;

	constructor(map: Map, controller: Controller, predator: Predator) {
		let ringCells = map.getRingCells(predator.cell, conf["inertmanager"]["oasisdistance"], false);
		let ringPos = Tools.getRandomArbitrary(0, ringCells.length, true);
		let oasisCell = ringCells[ringPos];
		this.waterpoint = new Waterpoint(map, controller, oasisCell);
    }
}