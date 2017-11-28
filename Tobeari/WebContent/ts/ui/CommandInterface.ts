/**
 * The command interface.
 */
class CommandInterface extends GraphicInterface {
	public oncooldown: boolean;

	private swallowBut: Button;
	private plantBut: Button;
	private wateringBut: Button;
	private buttons: Button[];
	
	constructor(private level: Level, private controller: Controller, private gameManager: GameManager, private predator: Predator) {
		super();
		//Paramètres
		this.oncooldown = false;
		let height = 21;
		this.x = g.world.width - GraphicInterface.spacing;
		this.y = GraphicInterface.spacing;

		//Créations
		this.swallowBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_swallow', 1, 0, height, this.swallow, this, false);
		this.plantBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_plant', 1, 0, height, this.plant, this, false);
		this.wateringBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_watering', 1, 0, height, this.watering, this, false);
		this.buttons = [this.swallowBut, this.plantBut, this.wateringBut];
	}

	//Update
	public update() {
		let sel = this.level.selection, predator = this.predator;
		let swallowable = false, waterable = false, plantable = false;
		
		//Si on peut utiliser une aptitude
		if(!this.oncooldown) {
			if(this.gameManager.playing && sel != null) {
				if(sel instanceof Waterpoint && !predator.drinking && predator.canGrab())
					swallowable = true;
				else if(sel instanceof Prey && sel.isAlive() && predator.canGrab())
					swallowable = true;
				else if(sel instanceof Plant) {
					if(sel.rank > Plant.RANK["WATERED"] && predator.canGrab())
						swallowable = true;
					if(sel.rank == Plant.RANK["SEED"] && predator.canWater())
						waterable = true;
				}
			}
			plantable = predator.canPlant();
		}

		//Avale une cible à portée si c'est une proie vivante ou une plante de rang 1 et +
		this.swallowBut.setClickable(swallowable);
		
		//Planter si suffisament de graines et vivant
		this.plantBut.setClickable(plantable);
		
		//Arrose une plante rang 0
		this.wateringBut.setClickable(waterable);
	}
	
	//Order swallow to controller
	private swallow() {
		this.controller.swallow();
	}
	
	//Order plant to controller
	private plant() {
		this.controller.plant();
	}
	
	//Order watering to controller
	private watering() {
		this.controller.watering();
	}
}