/**
 * ConsumerManager
 */
class ConsumerManager {
	private growerManager: GrowerManager;

    //Predator
	public predator: Predator;

    //Prey
	public preys: Prey[] = [];
	private preyAddingGapMin: number;
	private preyAddingGapInit: number;
	private preyAddingGap: number;
	private preyAddingGapDec: number;
	private preyAddingGapDecEach: number;
	private addPreyTimer: Phaser.TimerEvent = null;
	private decPreyTimer: Phaser.TimerEvent = null;

	//Pathfinding
	private pathfinder: Pathfinder;

    constructor(private level: Level, private map: Map, private controller: Controller) {
		//Predator
		this.predator = new Predator(level, map, controller, map.center);

		//Preys
		this.preyAddingGapMin = conf["consumermanager"]["preys_adding_min"];
		this.preyAddingGapInit = conf["consumermanager"]["preys_adding_init"];
		this.preyAddingGap = this.preyAddingGapInit;
		this.preyAddingGapDec = conf["consumermanager"]["preys_adding_dec"];
		this.preyAddingGapDecEach = conf["consumermanager"]["preys_adding_deceach"];

		//Pathfinding
		this.pathfinder = new Pathfinder(this.map);
    }

	public init(growerManager: GrowerManager) {
		this.growerManager = growerManager;
		for(let i=0; i<conf["consumermanager"]["preys_max"]; i++)
			this.createPrey();
	}

	//*** Level States ***

	/**
	 * Start the level
	 */
	public start() {
		//Réinitialisation des timers
		this.preyAddingGap = this.preyAddingGapInit;
		this.addPreyTimer = g.time.events.loop(this.preyAddingGap, this.addPrey, this);
		this.addPrey();//Instant add, timer will tick after
		
		//Decrease add prey gap
		this.decPreyTimer = g.time.events.loop(this.preyAddingGapDecEach, this.decreaseAddingPreyTimer, this);
	}
	
	/**
	 * Stop the level
	 */
	public end() {
		//Kill preys
		for(let i in this.preys)
			this.preys[i].kill();
	}

	/**
	 * Update loop
	 */
	public update() {
		this.predator.update();
		
		for(let i in this.preys)
			this.preys[i].update();
		
		this.predator.sightfog.update();
	}

	//*** Prey ***
	
	//Create a reusable prey
	private createPrey() {
		this.preys.push(new Prey(this.level, this.map, this.controller, this, this.growerManager, null, this.pathfinder));
	}

	//Add a prey and move it
	private addPrey() {
		let alivePrey: Prey = null;
		//Search one into the stockpile
		for(let i=0; i<this.preys.length; i++) {
			let prey = this.preys[i];
			if(!prey.isAlive()) {
				alivePrey = prey;
				break;
			}
		}
		if(alivePrey != null) {
			//Respawn in the perimeter
			let cell: Cell = this.map.getRandomPerimeterCell();
			alivePrey.displace(cell);
			alivePrey.reborn();
		}
	}

	/**
	 * Return the amount of Prey alived, on the map
	 */
	public preysAlive(): number {
		let amount = 0;
		for(let i in this.preys)
			if(this.preys[i].isAlive())
				amount++;
		
		return amount;
	}

	//Decrease the timer for prey adding
	private decreaseAddingPreyTimer() {
		//Decrease the timer
		this.preyAddingGap = Math.max(this.preyAddingGapMin, this.preyAddingGap - this.preyAddingGapDec);
		this.addPreyTimer.delay = this.preyAddingGap;
		//Remove the timer
		if(this.preyAddingGap <= this.preyAddingGapMin)
			this.decPreyTimer.timer.remove(this.decPreyTimer);
	}
}