/**
 * The prey.
 */
class Prey extends Entity {
	//Caracteristics
	private speed: number;
	private speedSprint: number;
	public plantDetectionDistance: number;
	private thinkTime: number;
	private eatTime: number;
	private chewTime: number;

	private eatTimer: Phaser.TimerEvent = null;

	//Move
	public isMoving: boolean = false;
	private movePath: Cell[] = [];
	private moveSprint: boolean = false;
	private moveTween: Phaser.Tween = null;
	public nextCell: Cell = null;
	private isMoveCompleted = true;
	private pathChangedWhileMoving = false;

	//Eating
	public eating: boolean = false;
	private plantToEat: Plant = null;

	//AI
	public freeze: boolean = false;
	private ailoop: Phaser.TimerEvent = null;
	public ai: ArtificialIntelligence;

	//Sounds
	private sounds: SoundManager;
	private volume: number = 1;
	private soundDistanceMax: number;

	constructor(private level: Level, map: Map, controller: Controller, private consumerManager: ConsumerManager, growerManager: GrowerManager, cell: Cell, pathfinder: Pathfinder) {
		super(map, controller, cell, conf["prey"]["sizecells"], conf["prey"]["sizesprite"], 'prey', false, true, true);
		
		//Caractéritiques
		this.speed = conf["prey"]["speed_normal"];
		this.speedSprint = conf["prey"]["speed_sprint"];
		this.plantDetectionDistance = conf["prey"]["plant_detectiondistance"];
		this.thinkTime = Phaser.Timer.SECOND / conf["prey"]["think_persecond"];
		this.eatTime = conf["prey"]["eat_time"];
		this.chewTime = conf["prey"]["chewtime"];
		
		//Sounds
		this.sounds = new SoundManager("prey");
		this.soundDistanceMax = conf["prey"]["sound_distancemax"];

		//Kill
		this.kill();
		
		//Chew
		let nbrFrame = 6, fpsChew: number;
		fpsChew = Math.ceil(1000 / (this.chewTime / nbrFrame));
		this.sprite.animations.add('chew', null, fpsChew, true);
			
		//Artificial Intelligence
		this.ai = new ArtificialIntelligence(level, map, consumerManager, growerManager, this, pathfinder);
	}

	//Update
	public update() {
		if(this.isAlive()){
			//Sound volume proportionnal to distance of the predator
			let lastVolume = this.volume;
			let newVolume = 1 - Math.min(1, this.cell.hex.distance(this.consumerManager.predator.cell.hex) * 1 / this.soundDistanceMax);
			if(Math.abs(this.volume - newVolume) >= 0.01) {
				this.volume = newVolume;
				this.sounds.volume("creature_walk", this.volume);
				this.sounds.volume("creature_sprint", this.volume);
				this.sounds.volume("eat_plant", this.volume);
				this.sounds.volume("prey_scared", this.volume);
			}
		}
	}
	//*** Life ***
	
	//Kill the prey
	public kill() {
		//Stop AI
		if(this.ailoop != null) {
			this.ailoop.timer.remove(this.ailoop);
			this.ailoop = null;
		}
		//Stop mouvement
		this.stopMoving(true);
		//Stop eating
		this.stopEating();
		//Entity cells
		if(this.cell != null){
			this.cell.removeEntity(this);
			this.cell = null;
		}
		if(this.nextCell != null){
			this.nextCell.removeEntity(this);
			this.nextCell = null;
		}
		//Destruction
		this.group.alpha = 0;
		this.destroy();
		
		//Sounds
		this.sounds.stopAll();
	}

	//Reborn the prey
	public reborn() {
		//Renaissance
		this.group.alpha = 1;
		this.freeze = false;
		this.isMoving = false;
		this.spawn();
		this.isMoveCompleted = true;
		this.pathChangedWhileMoving = false;
		//AI is thinking often
		this.ai.init();
		this.ailoop = g.time.events.loop(this.thinkTime, this.think, this);
		this.think();
		//Display order
		this.level.refreshDisplayOrder();
	}
	
	//*** Move ***

	/*
	 * Follow a path from Cell to Cell
	 * @param {boolean} sprint True to move with a sprint
	 */
	public followPath(path: Cell[], sprint: boolean) {
		if(path != null && path.length > 0){
			//Stop moving
			this.stopMoving();
			this.stopEating();

			//Various
			this.isMoving = true;
			this.movePath = path;
			this.moveSprint = sprint;
			this.pathChangedWhileMoving = !this.isMoveCompleted;

			//Start to move
			this.movePath.shift();//Delete start Cell
			this.moveToNextCell();
			
			//Sounds
			if(this.moveSprint)
				this.sounds.play("creature_sprint");
			else
				this.sounds.play("creature_walk");
		}
	}

	/**
	 * Move to the next cell on the path
	 */
	private moveToNextCell() {
		if(this.isMoveCompleted){
			if(this.movePath.length > 0)
				this.moveToCell(this.movePath[0], this.moveSprint);
			else
				this.onFollowPathComplete();
		}
	}

	/*
	 * Move to a Cell by a Tween
	 * @param {boolean} sprint True to move with a sprint
	 */
	private moveToCell(cell: Cell, sprint: boolean) {
		//Coordinate
		let coordinate = cell.coordinates.center;

		//Look at it
		this.group.rotation = Tools.getAngle(this.group, coordinate);

		//If cell is walkable
		if(cell.isWalkable()){
			//Next cell, 2 cells occupied
			this.nextCell = cell;
			this.nextCell.addEntity(this);

			//Time
			let time = 1000 / (sprint ? this.speedSprint : this.speed);
			
			//Tween
			this.moveTween = g.add.tween(this.group).to( { x: coordinate.x, y: coordinate.y }, time);
			this.moveTween.onComplete.add(this.onMoveComplete, this);
			this.moveTween.start();
			
			this.isMoveCompleted = false;
		}else//Or rather stop moving
			this.stopMoving();
	}
	
	/**
	 * End of move to a Cell
	 */
	private onMoveComplete() {
		if(!this.isMoveCompleted) {
			//Previous Cell is free, 1 cell occupied
			this.cell.removeEntity(this);

			//Cell switching
			this.cell = this.nextCell;
			this.cell.addEntity(this);
			this.nextCell = null;
			this.moveTween = null;
			
			//Flag to relaunch a move after completion
			this.isMoveCompleted = true;

			//Next move
			if(this.movePath.length > 0 && !this.pathChangedWhileMoving)
				this.movePath.shift();

			this.pathChangedWhileMoving = false;

			this.moveToNextCell();
		}
	}

	/**
	 * Called when a path following is complete
	 */
	private onFollowPathComplete() {
		//Stop moving
		this.stopMoving();
		this.stopEating();

		//Other
		this.pathChangedWhileMoving = false;
		
		//Sounds
		this.sounds.stop("creature_sprint");
		this.sounds.stop("creature_walk");

		//Rethink
		this.ai.think();
	}
	
	
	//Stop moving
	public stopMoving(stopTween = false) {
		if(this.isMoving) {
			//Reset
			if(this.moveTween != null && stopTween){
				this.moveTween.stop(false);
				g.tweens.remove(this.moveTween);
				this.moveTween = null;
			}

			this.isMoving = false;
			this.movePath = [];
			
			//AI think
			this.think();
		}
	}

	//*** Artificial intelligence ***
	
	//Think of the ai
	private think() {
		if(!this.freeze)
			this.ai.think();
	}
	
	//*** Eat ***
	
	//In range to eat
	public isOnPlant(plant: Plant): boolean {
		return this.cell == plant.cell && this.isMoveCompleted;
	}
	
	//Eat a plant
	public eat(plant: Plant) {
		if(plant instanceof Plant && plant.isGrown()) {
			this.stopMoving();
			this.stopEating();

			this.eating = true;
			
			this.sprite.animations.play('chew');
			this.plantToEat = plant;
			this.eatTimer = g.time.events.loop(this.eatTime, this.eatPlantPart, this);
			
			//Sounds
			this.sounds.play("eat_plant");
		}
	}
	
	//Eat a part of the plant
	private eatPlantPart() {
		if(this.plantToEat != null && this.plantToEat.isAlive())
			this.plantToEat.downgrade();
		else
			this.stopEating();
	}
	
	//Stop eating
	public stopEating() {
		if(this.eating){
			this.eating = false;
			
			if(this.eatTimer != null) {
				this.sprite.animations.stop(null, true);
				this.eatTimer.timer.remove(this.eatTimer);
				this.eatTimer = null;
			}
			
			//Sounds
			this.sounds.stop("eat_plant");
		}
	}
	
	//*** Flee ***

	//Scared prey
	public flee() {
		//Sounds
		this.sounds.play("prey_scared");
	}
}