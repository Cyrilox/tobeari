/**
 * The predator. 
 */
class Predator extends Entity {
	private ability: Ability;

	public sightfog: Sightfog;

	private deteriorating: boolean = false;
	public drinking: boolean = false;
	public rotation: number = 0;

	private cellSelected: Cell = null;
	private entitySelected: Entity = null;
	private previousEntitySelected: Entity = null;
	private entityGrabbed: Entity = null;
	private isEntityGrabbed: boolean = false;

	private mouthOpened: boolean = false;
	private mouthClosing: boolean = false;
	
	public range: number;
	private waterneeded: number;
	//Caracteristics
	public health: number;
	public hydration: number;
	public hunger: number;
	public energy: number;
	public seeds: number;
	public thorn: number;

	public plantRange: number;
	//Waterjet
	public waterjet: Phaser.Sprite;
	private waterjetTime: number;
	private wateredPlant: Plant = null;
	//Tongue
	private tongue: Phaser.Sprite;
	private tongueWidthOriginal: number;
	private tongueGrabTime: number;
	private tongueStretch: Phaser.Tween;
	private tongueReturn: Phaser.Tween;

	private newPlant: Plant;
	//Seed launched
	public seed: Phaser.Sprite;
	private seedLaunchTime: number;
	private seedLaunch: Phaser.Tween;
	//Timers
	private dehydrateTime: number;
	private selfhealTime: number;
	private deteriorateTime: number;
	private drinkTime: number;

	private selfhealLoop: Phaser.TimerEvent = null;//Soin
	private dehydrateTimer: Phaser.TimerEvent;//Déshydratation
	private hungerTimer: Phaser.TimerEvent;//Faim
	private energyTimer: Phaser.TimerEvent;//Energie
	private seedsTimer: Phaser.TimerEvent;//Seeds
	private deteriorateLoop: Phaser.TimerEvent = null;//Détérioration
	private drinkTimer: Phaser.TimerEvent = null;//Boire

	//Sounds
	private sounds: SoundManager;
	
	constructor(private level: Level, map: Map, controller: Controller, cell: Cell) {
		super(map, controller, cell, conf["predator"]["sizecells"], conf["predator"]["sizesprite"], 'predator', false, false, false);

		this.spawn();
		
		//Characteristics
		this.range = conf["predator"]["range"];
		this.waterneeded = conf["predator"]["waterneeded"];

		//Ability
		this.ability = new Ability(level);
		this.plantRange = conf["predator"]["plantrange"];
		this.map.setSelectableCellsAround(cell.hex, 2, this.plantRange);
		
		//Brouillard de la vue du joueur
		this.sightfog = new Sightfog(this);
		
		//Vitals
		this.health = conf["predator"]["health"];
		this.hydration = conf["predator"]["hydration"];
		this.hunger = conf["predator"]["hunger"];
		this.energy = conf["predator"]["energy"];
		this.seeds = conf["predator"]["seeds"];
		this.thorn = conf["predator"]["thorn"];

		//Mouth
		let nbrFrame = 6, fpsOpenMouth: number, fpsCloseMouth: number;
		fpsOpenMouth = Math.ceil(1000 / (conf["predator"]["openmouthtime"] / nbrFrame));
		fpsCloseMouth = Math.ceil(1000 / (conf["predator"]["closemouthtime"] / nbrFrame));
		this.sprite.animations.add('open_mouth', [0, 1, 2, 3, 4, 5], fpsOpenMouth, false);
		this.sprite.animations.add('close_mouth', [5, 4, 3, 2, 1, 0], fpsCloseMouth, false);
		
		//Water jet
		this.waterjet = Tools.addSprite(0, 0, "waterjet");
		g.physics.enable(this.waterjet, Phaser.Physics.ARCADE);
		this.waterjet.anchor.setTo(1, 0.5);
		GraphicInterface.scaleByHeightWithSize(this.waterjet, Cell.EDGE_SIZE * conf["predator"]["sizewaterjet"]);
		this.waterjet.visible = false;
		this.waterjetTime = conf["predator"]["waterjettime"];
		
		//Langue
		this.tongue = Tools.addSprite(0, 0, "tongue");//Extensible
		g.physics.enable(this.tongue, Phaser.Physics.ARCADE);
		this.tongue.anchor.setTo(0, 0.5);
		this.tongueWidthOriginal = this.tongue.width;
		GraphicInterface.scaleByHeightWithSize(this.tongue, Cell.EDGE_SIZE * conf["predator"]["sizetongue"]);
		this.tongue.width = 0;4
		this.tongueGrabTime = conf["predator"]["tonguegrabtime"];
		
		//Graine lancée
		this.seed = Tools.addSprite(0, 0, "seed_green");
		this.seed.anchor.setTo(0.5, 0.5);
		GraphicInterface.scaleByHeightWithSize(this.seed, Cell.EDGE_SIZE * conf["predator"]["sizeseed"]);
		this.seed.alpha = 0;
		this.seedLaunchTime = conf["predator"]["seedlaunchtime"];
		
		//The group
		this.group.addAt(this.tongue, 0);
		
		//Vitals loops
		let hungerTime: number, energyTime: number, seedsTime: number;
		this.dehydrateTime = Phaser.Timer.SECOND * conf["predator"]["time_dehydrate"];
		hungerTime = Phaser.Timer.SECOND * conf["predator"]["time_hunger"];
		energyTime = Phaser.Timer.SECOND * conf["predator"]["time_energy"];
		seedsTime = Phaser.Timer.SECOND * conf["predator"]["time_seeds"];
		this.selfhealTime = Phaser.Timer.SECOND * conf["predator"]["time_selfheal"];
		this.deteriorateTime = Phaser.Timer.SECOND * conf["predator"]["time_deteriorate"];
		this.drinkTime = Phaser.Timer.SECOND * conf["predator"]["time_drinking"];
		
		this.dehydrateTimer = g.time.events.loop(this.dehydrateTime, this.dehydrate, this);
		this.hungerTimer = g.time.events.loop(hungerTime, this.decreaseHunger, this);
		this.energyTimer = g.time.events.loop(energyTime, this.decreaseEnergy, this);
		this.seedsTimer = g.time.events.loop(seedsTime, this.produceSeed, this);
		
		this.updateDeterioration();
		
		//Sounds
		this.sounds = new SoundManager("predator");
	}

	//*** Level States ***

	//Update
	public update() {
		//Rotation
		this.group.rotation = this.rotation;
	}

	//*** Life ***
	
	//Mort
	private kill() {
		//Sounds
		this.sounds.stopAll();
		this.sounds.play("death");
		//Interruption des vitales
		if(this.dehydrateTimer != null) {
			this.dehydrateTimer.timer.remove(this.dehydrateTimer);
			this.dehydrateTimer = null;
		}
		this.hungerTimer.timer.remove(this.hungerTimer);
		this.energyTimer.timer.remove(this.energyTimer);
		//Visuel mort
		this.sprite.loadTexture("images-atlas", "predator_dead");
		this.tongue.alpha = 0;
		//Champ de vision
		this.sightfog.closed = true;
		//Tremblement de caméra
		g.camera.shake(0.01, 200);
		//Status mort, fin de partie
		this.destroy();
	}
	
	//*** Selection ***

	/**
	 * Select a Cell or Entity, or unselect with null
	 */
	public setSelection(selection: Cell|Entity) {
		this.previousEntitySelected = this.entitySelected;

		if(selection instanceof Cell)
			this.cellSelected = <Cell>(selection);
		else if(selection instanceof Entity)
			this.entitySelected = <Entity>(selection);
		else{
			this.cellSelected = null;
			this.entitySelected = null;
		}
		
		if(!this.mouthClosing)
			this.closeMouth();
	}

	//*** Eat ***
	
	/**
	 * Return true if the selected entity can be grabbed
	 */
	public canGrab(): boolean {
		return this.entitySelected != null && this.cell.hex.distance(this.entitySelected.cell.hex) <= this.range;
	}

	//Eat
	public eat() {
		if(this.ability.canUseAbility() && this.entitySelected != null) {
			let eatable = false;
			
			//Plante comestible
			if(this.entitySelected instanceof Plant){
				let plant = <Plant>(this.entitySelected);
				if(plant.rank > Plant.RANK["WATERED"])
					eatable = true;
			}else if((this.entitySelected instanceof Prey && this.canGrab())//Proie à portée
				|| (this.entitySelected instanceof Waterpoint && this.canGrab() && !this.drinking))//Waterpoint
				eatable = true;
			
			//Eat
			if(eatable){
				//Start the ability
				this.ability.useAbility();
				
				//Stretch the tongue and drink
				this.tongueGrab();
			}
		}
	}
	
	//Grab something by stretching out the tongue to a position
	private tongueGrab() {
		if(this.entitySelected != null) {
			//Prey
			if(this.entitySelected instanceof Prey){
				let prey = <Prey>(this.entitySelected);
				prey.freeze = true;
			}
			
			//Open mouth
			this.openMouth();
			
			//Stretch tongue
			let tongueWidth = Tools.getDistance(this.tongue.world, this.entitySelected.group.position);
			this.tongueStretch = g.add.tween(this.tongue).to( { width:tongueWidth }, this.tongueGrabTime);
			this.tongueStretch.onComplete.add(this.tongueGrabReached, this);
			this.tongueStretch.start();
			
			//Sound
			this.sounds.play("tongue_launch");
		}
	}
	
	//Tongue has reached the selection
	private tongueGrabReached() {
		//Sound
		this.sounds.stop("tongue_launch");
		
		//For Waterpoint, drink the water continuously
		if(this.entitySelected != null) {
			if(this.entitySelected instanceof Waterpoint && this.drinkTimer == null) {
				this.drinking = true;
				this.drinkTimer = g.time.events.loop(this.drinkTime, this.drink, this);
				
				//Sound
				this.sounds.play("drop_inwater");
				this.sounds.play("swallowing_water");
				
			}else if(this.entitySelected instanceof Plant || this.entitySelected instanceof Prey) {

				if(this.entitySelected instanceof Prey){
					let prey = <Prey>(this.entitySelected);
					prey.stopMoving(true);
					prey.stopEating();
				}
				
				this.tongue.addChild(this.entitySelected.group);
				this.entitySelected.group.position.x = this.tongueWidthOriginal;
				this.entitySelected.group.position.y = 0;
				this.isEntityGrabbed = true;
				this.entityGrabbed = this.entitySelected;
				
				this.level.select(null);//Trigger this.setSelection thus this.closeMouth
				
				//Sound
				this.sounds.play("tongue_stick");
			}
		}
	}

	//*** Drink ***
	
	//Drink the waterpoint
	private drink() {		
		//Stop dehydration while drinking
		if(this.dehydrateTimer != null) {
			this.dehydrateTimer.timer.remove(this.dehydrateTimer);
			this.dehydrateTimer = null;
		}
		//Hydration increase
		this.changeHydration(1);
	}
	
	//Stop drinking
	private stopDrink() {
		if(this.drinkTimer != null) {
			this.drinkTimer.timer.remove(this.drinkTimer);
			this.drinkTimer = null;
			
			//Sound
			this.sounds.stop("swallowing_water");
		}
		this.drinking = false;
		this.closeMouth();
		
		//Reactivate dehydration
		if(this.dehydrateTimer == null)
			this.dehydrateTimer = g.time.events.loop(this.dehydrateTime, this.dehydrate, this);//Déshydratation
	}
	
	//*** Mouth ***

	//Open the mouth
	private openMouth() {
		if(!this.mouthOpened) {
			this.animateMouth(true);
			this.mouthOpened = true;
		}
	}
	
	//Animation
	private animateMouth(open: boolean) {
		let animations: Phaser.AnimationManager, currentAnim: Phaser.Animation, animated: boolean;
		animations = this.sprite.animations;
		currentAnim = animations.currentAnim;
		animated = currentAnim != null && currentAnim.isPlaying;
		if(animated)
			currentAnim.onComplete.addOnce(function() {animations.play(open ? 'open_mouth' : 'close_mouth')});
		else
			animations.play(open ? 'open_mouth' : 'close_mouth');
	}
	
	//Close the mouth while returning the tongue
	private closeMouth() {
		if(!this.mouthClosing && this.mouthOpened) {
			this.mouthClosing = true;
			
			if(this.drinking)
				this.stopDrink();
			
			//Stop tongue stretching
			if(this.tongueStretch != null) {
				this.tongueStretch.stop();
				this.tongueStretch = null;
			}
			
			//Start tongue returning
			if(this.tongueReturn == null) {			
				this.tongueReturn = g.add.tween(this.tongue).to( { width:1 }, this.tongueGrabTime);
				this.tongueReturn.onComplete.add(this.tongueReturned, this);
				this.tongueReturn.start();
				
				//Sound
				if(this.previousEntitySelected != null && this.previousEntitySelected instanceof Waterpoint)
					this.sounds.play("water_drop");
			}
			this.mouthOpened = false;
		}
	}
	
	//Tongue returned
	private tongueReturned() {
		this.tongueReturn = null;
		//Close the mouth animation
		this.animateMouth(false);
		
		//Digest the grabbed selection
		if(this.isEntityGrabbed && this.entityGrabbed != null && !(this.entityGrabbed instanceof Waterpoint)) {			
			//Digestion
			this.digest();
				
			//Sound
			this.sounds.play("monster_bite");
		}
		
		this.mouthClosing = false;
	}

	//*** Digest ***
	
	//Digest the swallowed thing
	private digest() {
		if(this.entityGrabbed != null) {
			if(this.entityGrabbed instanceof Prey) {
				//Convert to vitals
				this.changeHunger(conf["predator"]["eat_prey_hunger"]);
				//Kill the prey
				let prey = <Prey>(this.entityGrabbed);
				this.tongue.removeChild(prey.group);
				g.world.addChild(prey.group);
				prey.kill();

			}else if(this.entityGrabbed instanceof Plant) {
				let plant = <Plant>(this.entityGrabbed);
				//Convert to vitals
				if(plant.rank == Plant.RANK["LEAFY"]) {//Leafy
					this.changeHunger(conf["predator"]["eat_plantleafy_hunger"]);
					this.changeSeeds(conf["predator"]["eat_plantleafy_seeds"]);
				}else if(plant.rank == Plant.RANK["FRUITY"]) {//Fruity
					this.changeHunger(conf["predator"]["eat_plantfruity_hunger"]);
					this.changeEnergy(conf["predator"]["eat_plantfruity_energy"]);
					this.changeSeeds(conf["predator"]["eat_plantfruity_seeds"]);
				}else if(plant.rank == Plant.RANK["SEEDY"]) {//Seedy
					this.changeHunger(conf["predator"]["eat_plantseedy_hunger"]);
					this.changeEnergy(conf["predator"]["eat_plantseedy_energy"]);
					this.changeSeeds(conf["predator"]["eat_plantseedy_seeds"]);
				}
				//Destroy the plant
				this.tongue.removeChild(plant.group);
				g.world.addChild(plant.group);
				plant.kill();
			}
			
			this.isEntityGrabbed = false;
			this.entityGrabbed = null;
		}
	}

	//*** Plant ***

	//Can plant is enough seeds, empty cell and alive
	public canPlant(): boolean {
		return this.isAlive() && this.seeds > 0 && this.cellSelected != null && this.cellSelected.isEmpty();
	}
	
	//Plant
	public plant() {
		if(this.ability.canUseAbility() && this.canPlant()) {
			//Start the ability
			this.ability.useAbility();
			
			//Open mouth
			this.openMouth();
			
			//Plante posée instantanément invisible
			this.newPlant = this.controller.createPlant(this.cellSelected);
			
			//Lancement de graine
			this.seed.position = this.group.position.clone();
			this.seed.alpha = 1;
			this.seed.rotation = Tools.getRandomRadianAngle();
			let seedPos = this.newPlant.group.position.clone();
			this.seedLaunch = g.add.tween(this.seed).to( { x: seedPos.x, y: seedPos.y }, this.seedLaunchTime);
			this.seedLaunch.onComplete.add(this.seedPlantArrived, this);
			this.seedLaunch.start();
			
			//Sound
			this.sounds.play("spit");
			
			//Seeds decrease
			this.changeSeeds(-1);
			
			//Close mouth
			this.closeMouth();
		}
	}
	
	//Seed plant arrived
	private seedPlantArrived() {
		//Sound
		this.sounds.play("dirt_hit");
		
		//Close the mouth
		this.closeMouth();
		
		this.seed.alpha = 0;
		this.newPlant.born();
	}

	//*** Watering ***

	//Arroser
	public water() {
		if(this.ability.canUseAbility() && this.entitySelected != null && this.entitySelected instanceof Plant) {
			let plant = <Plant>(this.entitySelected);
			if(this.hydration >= this.waterneeded && plant.rank == Plant.RANK["SEED"]) {		
				//Start the ability
				this.ability.useAbility();
				
				//Open mouth
				this.openMouth();
			
				//Hydration
				this.changeHydration(-this.waterneeded);
				
				//Jet d'eau
				this.waterjet.position = this.group.position.clone();
				this.waterjet.rotation = this.group.rotation;
				this.waterjet.visible = true;
				this.wateredPlant = plant;
				let waterjetPos = plant.group.position.clone();
				let waterjeting = g.add.tween(this.waterjet).to( { x:waterjetPos.x, y:waterjetPos.y }, this.waterjetTime);
				waterjeting.onComplete.add(this.waterjeted, this);
				waterjeting.start();
				
				//Sound
				this.sounds.play("water_throw");
			}
		}
	}

	//Waterjeting finished
	private waterjeted() {
		//Watering of the plant
		if(this.wateredPlant != null) {
			//Close the mouth
			this.closeMouth();
			
			this.wateredPlant.water();
			this.wateredPlant = null;
			this.waterjet.visible = false;
		}
	}
	
	//Peut arroser ?
	public canWater(): boolean {
		return this.hydration >= this.waterneeded;
	}

	//*** Passive abilities

	//Heal
	private heal(amount: number) {
		this.changeHealth(1);
	}
	
	private changeHealth(variation: number) {
		let val = Math.max(0, Math.min(conf["predator"]["health"], this.health + variation));
		if(val != this.health) {
			this.health = val;
			this.controller.gameStateHasChanged(GameStateInterface.INFOS["HEALTH"], this.health, variation);
		}
	}

	//Dehydrate
	private dehydrate() {
		this.changeHydration(-1);
	}

	private changeHydration(variation: number) {
		let val = Math.max(0, Math.min(conf["predator"]["hydration"], this.hydration + variation));
		if(val != this.hydration) {
			this.hydration = val;
			this.controller.gameStateHasChanged(GameStateInterface.INFOS["HYDRATION"], this.hydration, variation);
			this.updateDeterioration();//Deterioation check
		}
	}

	//Hunger
	private decreaseHunger() {
		this.changeHunger(-1);
	}

	private changeHunger(variation: number) {
		let val = Math.max(0, Math.min(conf["predator"]["hunger"], this.hunger + variation));
		if(val != this.hunger) {
			this.hunger = val;
			this.controller.gameStateHasChanged(GameStateInterface.INFOS["HUNGER"], this.hunger, variation);
			this.updateDeterioration();//Deterioation check
		}
	}

	//Energy
	private decreaseEnergy() {
		this.changeEnergy(-1);
	}

	private changeEnergy(variation: number) {
		let val = Math.max(0, Math.min(conf["predator"]["energy"], this.energy + variation));
		if(val != this.energy) {
			this.energy = val;
			this.controller.gameStateHasChanged(GameStateInterface.INFOS["ENERGY"], this.energy, variation);
		}
	}

	//Production de graine
	private produceSeed() {
		//Si en vie, hydraté, pas affamé et avec de l'énergie
		if(this.isAlive() && this.hydration > 0 && this.hunger > 0 && this.energy > 0)
			this.changeSeeds(1);
	}
	
	private changeSeeds(variation: number) {
		let val = Math.max(0, this.seeds + variation);
		if(val != this.seeds) {			
			//Gain
			if(val > this.seeds)
				this.sounds.play("seed_gained");//Sound
			
			this.seeds = val;
			this.controller.gameStateHasChanged(GameStateInterface.INFOS["SEEDS"], this.seeds, variation);
		}
	}

	//Deterioration
	private updateDeterioration() {
		// si l'hydratation ou la faim est à 0
		this.deteriorating = this.hydration <= 0 || this.hunger <= 0;
		//Arret ou démarrage des boucles de soins ou détérioration
		if(this.deteriorating) {
			if(this.deteriorateLoop == null) {
				this.deteriorateLoop = g.time.events.loop(this.deteriorateTime, this.deteriorate, this);			
			}if(this.selfhealLoop != null) {
				this.selfhealLoop.timer.remove(this.selfhealLoop);
				this.selfhealLoop = null;
			}
		}else{
			if(this.deteriorateLoop != null) {
				this.deteriorateLoop.timer.remove(this.deteriorateLoop);
				this.deteriorateLoop = null;
				
				//Sound
				this.sounds.stop("predator_pain");
				
			}if(this.selfhealLoop == null)
				this.selfhealLoop = g.time.events.loop(this.selfhealTime, this.heal, this);
		}
	}

	private deteriorate() {
		//If alive and dehydrated or hungry
		if(this.isAlive() && this.deteriorating) {
			if(this.health > 0) {
				this.changeHealth(-1);
				
				//Sound of pain with various volume and frequency
				g.time.events.add(Tools.getRandomArbitrary(0, 300, true), function(state: string) {
					this.sounds.stop("predator_pain");
					this.sounds.volume("predator_pain", Tools.getRandomArbitrary(0.5, 1.5, false));
					this.sounds.play("predator_pain");
				}, this);
				
				if(this.health <= 0)
					this.kill();
			}
		}
	}
}