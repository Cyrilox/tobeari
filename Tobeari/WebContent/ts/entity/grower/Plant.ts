/**
 * The plant.
 */
enum RANK { UNBORN, SEED, WATERED, LEAFY, FRUITY, SEEDY }

class Plant extends Entity {
	static RANK = RANK;

	public rank: number = RANK["UNBORN"];

	private timerLeafing: Phaser.TimerEvent = null;
	private timerFruiting: Phaser.TimerEvent = null;
	private timerSeedy: Phaser.TimerEvent = null;

	private growToLeafTime: number;
	private growToFruitTime: number;
	private growToSeedTime: number;

	//Sounds
	private sounds: SoundManager;

	constructor(private level: Level, map: Map, controller: Controller, cell: Cell) {
		super(map ,controller, cell, conf["plant"]["sizecells"], conf["plant"]["sizesprite"], 'plant_green', false, true, true, true);

		//Graphismes
		this.group.rotation = Tools.getRandomRadianAngle();
		this.group.alpha = 0;

		//Temps
		this.growToLeafTime = Phaser.Timer.SECOND * conf["plant"]["growtime_leaf"];
		this.growToFruitTime = Phaser.Timer.SECOND * conf["plant"]["growtime_fruit"];
		this.growToSeedTime = Phaser.Timer.SECOND * conf["plant"]["growtime_seed"];
		
		//Sounds
		this.sounds = new SoundManager("plant");
	}

	//*** Life ***

	//Plant is born
	public born() {
		if(!this.isAlive()){
			this.spawn();
			this.rank = RANK["SEED"];
			this.group.alpha = 1;

			//Dispatch the events
			this.controller.plantIsBorn(this);
		}
	}
	
	//Destroy the plant
	public kill() {
		if(this.isAlive()){
			this.rank = RANK["UNBORN"];
			this.group.alpha = 0;
			this.stopTimers();
			this.destroy();
		}
	}
	
	//*** Growth ***

	//Water the plant
	public water() {
		if(this.rank == RANK["SEED"]) {
			this.rank = RANK["WATERED"];
			this.sprite.frame = 1;
		
			//Start the leaf growth
			this.timerLeafing = g.time.events.add(this.growToLeafTime, this.leaf, this);
		}
	}

	//Leaf the plant
	private leaf() {
		if(this.rank == RANK["WATERED"]) {
			this.rank = RANK["LEAFY"];
			this.sprite.frame = 2;
			
			//Sound
			this.sounds.play("plant_growing");
			
			//Start the fruit growth
			this.timerFruiting = g.time.events.add(this.growToFruitTime, this.fruit, this);
		}
	}

	//Fruit the plant
	private fruit() {
		if(this.rank == RANK["LEAFY"]) {
			this.rank = RANK["FRUITY"];
			this.sprite.frame = 3;
			
			//Sound
			this.sounds.play("plant_growing");
			
			//Start the seed growth
			this.timerSeedy = g.time.events.add(this.growToSeedTime, this.seed, this);
		}
	}

	//Seed the plant
	private seed() {
		if(this.rank == RANK["FRUITY"]) {
			this.rank = RANK["SEEDY"];
			this.sprite.frame = 4;
			
			//Sound
			this.sounds.play("plant_growing");
		}
	}
	
	//Plante poussée si feuillue ou fruitée
	public isGrown(): boolean {
		return this.rank > RANK["WATERED"];
	}

	//Destroy a part, a downgrade
	public downgrade() {
		//Stop timers
		this.stopTimers();

		//Downgrade
		if(this.rank == RANK["LEAFY"])
			this.rank = RANK["UNBORN"];
		else
			this.rank--;
		
		if(this.rank <= RANK["UNBORN"])
			this.kill();
		else
			this.sprite.frame = this.rank-1;
		
		//Repousse
		switch(this.rank) {
			case RANK["WATERED"]:this.timerLeafing = g.time.events.add(this.growToLeafTime, this.leaf, this);
			break;
			case RANK["LEAFY"]:this.timerFruiting = g.time.events.add(this.growToFruitTime, this.fruit, this);
			break;
			case RANK["FRUITY"]:this.timerSeedy = g.time.events.add(this.growToSeedTime, this.seed, this);
			break;
		}
	}
	
	//Stop timers
	private stopTimers() {
		if(this.timerLeafing != null) {
			this.timerLeafing.timer.remove(this.timerLeafing);
			this.timerLeafing = null;
		}
		if(this.timerFruiting != null) {
			this.timerFruiting.timer.remove(this.timerFruiting);
			this.timerFruiting = null;
		}
		if(this.timerSeedy != null) {
			this.timerSeedy.timer.remove(this.timerSeedy);
			this.timerSeedy = null;
		}
	}
}