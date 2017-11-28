/**
 * The palmtree.
 */
class Palmtree extends Entity {

	constructor(map: Map, controller: Controller, cell: Cell) {
		super(map, controller, cell, conf["palmtree"]["sizecells"], conf["palmtree"]["sizesprite"], 'palmtree', true, false, false);

		//Random rotation
		this.group.rotation = Tools.getRandomRadianAngle();
	}
}