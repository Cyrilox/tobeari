/**
 * The waterpoint.
 */
class Waterpoint extends Entity {

	constructor(map: Map, controller: Controller, cell: Cell) {
		super(map, controller, cell, conf["waterpoint"]["sizecells"], conf["waterpoint"]["sizesprite"], 'waterhole', true, true, false);
		
		//Random rotation
		this.group.rotation = Tools.getRandomRadianAngle();
	}
}