/**
 * The controller between Level and the views.
 */
class Controller {
	public gameManager: GameManager;
	public growerManager: GrowerManager;
	public consumerManager: ConsumerManager;
	public gameStateInterface: GameStateInterface;

	public dragEnded: boolean;

	constructor(private level: Level) {		
		//game.onUp is triggered before other onInputUp, it's use to know if we onInputUp of a drag
		this.dragEnded = false;//this is turn to true when onUp thus drag is ended
	}
	
	public init(gameManager: GameManager, growerManager: GrowerManager, consumerManager: ConsumerManager, gameStateInterface: GameStateInterface) {
		this.gameManager = gameManager;
		this.growerManager = growerManager;
		this.consumerManager = consumerManager;
		this.gameStateInterface = gameStateInterface;
	}
	
	//*** Selection ***

	/**
	 * Select a Cell or Entity
	 */
	public select(selection: Cell|Entity) {
		if(this.isOnInputUpNoDrag())//If we don't drag
			this.level.select(selection);
	}

	/**
	 * Unselect current selection
	 */
	public unselect() {
		if(this.isOnInputUpNoDrag())//If we don't drag
			this.level.select(null);
	}

	//*** Gesture ***

	/*
	 * Anti Drag - onInputUp triggering
	 * Should only be used in onInputUp handling
	 * Set level.isDragging to false
	 * Return true if there is no dragging before onInputUp
	 */
	private isOnInputUpNoDrag(): boolean {
		if(this.dragEnded) {
			this.dragEnded = false;
			return false;
		}else
			return true;
	}

	//*** Ability ***

	//Swallow the selected thing
	public swallow() {
		if(this.isOnInputUpNoDrag())//No if we dragged
			if(this.level.selection != null)
				this.consumerManager.predator.eat();//Predator eat the thing
	}

	//Plant
	public plant() {
		if(this.isOnInputUpNoDrag())//No if we dragged
			if(this.consumerManager.predator.canPlant())
				this.consumerManager.predator.plant();//Predator planting
	}

	/**
     * Create a plant
     */
	public createPlant(cell: Cell): Plant {
		return this.growerManager.createPlant(cell);
	}

	//Watering
	public watering() {
		if(this.isOnInputUpNoDrag())//No if we dragged
			if(this.level.selection != null && this.level.selection instanceof Plant)
				this.consumerManager.predator.water();//Predator watering
	}

	//*** Dispatch ***

	/**
	 * Called when a Plant is born
	 * Select this Plant if the selected Cell is on the Plant
	 */
	public plantIsBorn(plant: Plant) {
		let sel = this.level.selection;
		if(sel != null && sel instanceof Cell && (<Cell>(sel)).containEntity(plant))
			this.level.select(plant);
	}

	/**
	 * Called when a game state information has changed
	 * Update the view
	 */
	public gameStateHasChanged(info: number, newValue: number, variation: number) {
		this.gameStateInterface.update(info, newValue, variation);
	}

	/**
	 * Called when an Entity is dead
	 * Unselect this one if it was selected
	 * End game if it was the Predator
	 */
	public entityHasDied(entity: Entity) {
		if(this.level.selection == entity)
			this.select(null);
		if(entity instanceof Predator)
			this.gameManager.end();
	}
}