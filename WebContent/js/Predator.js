/*
 * The predator. 
 * @class Predator
 * @contructor
 */
function Predator(level){
	Ability.call(this, level);
	
	//Game state interface
	this.setGameStateInterface = function(gameStateInterface){
		this.gameStateInterface = gameStateInterface;
	}; 
	
	//Update
	this.update = function() {
		//Rotation
		this.group.rotation = this.rotation;
		//Visible only if we can plant, but not with visible value coz overlap not working
		this.nextPlant.alpha = this.canPlant() ? 1 : 0;
		};
	
	//The thing selected has changed
	this.setSelection = function(selection) {
		this.previousSelection = this.selection;
		this.selection = selection;
		if(!this.mouthClosing)
			this.closeMouth();
	};
	
	//*** Active abilities ***
	
	//Eat
	this.eat = function(){
		if(this.canUseAbility() && this.selection != null){
			if((this.selection instanceof Prey && this.level.inrange)//Proie à portée
				|| (this.selection instanceof Oasis && !this.drinking)//Oasis
				|| (this.selection instanceof Plant && this.selection.rank > 1)){//Plante comestible
				//Start the ability
				this.useAbility();
				
				//Stretch the tongue and drink
				this.tongueGrab();
			}
		}
	};
	
	//Grab something by stretching out the tongue to a position
	this.tongueGrab = function() {
		if(this.selection != null){
			if(this.selection instanceof Prey)
				this.selection.freeze = true;
			
			//Open mouth
			this.openMouth();
			
			//Stretch tongue
			var tongueWidth = Tools.getDistance(this.tongue.world, this.selection.sprite.world);
			this.tongueStretch = g.add.tween(this.tongue).to( { width:tongueWidth }, this.tongueGrabTime);
			this.tongueStretch.onComplete.add(this.tongueGrabReached, this);
			this.tongueStretch.start();
			
			//Sound
			sounds.tongueLaunch.play();
		}
	};
	
	//Tongue has reached the selection
	this.tongueGrabReached = function() {
		//Sound
		sounds.tongueLaunch.stop();
		
		//For Oasis, drink the water continuously
		if(this.selection != null){
			if(this.selection instanceof Oasis && this.drinkTimer == null){
				this.drinking = true;
				this.drinkTimer = g.time.events.loop(this.drinkTime, this.drink, this);
				
				//Sound
				sounds.dropInwater.play();
				sounds.swallowingWater.play();
				
			}else if(this.selection instanceof Plant || this.selection instanceof Prey){
				if(this.selection instanceof Prey)
					this.selection.stopMoving();
				
				this.tongueTip.addChild(this.selection.sprite);
				this.selection.sprite.position.x = 0;
				this.selection.sprite.position.y = 0;
				this.selectionGrabbed = true;
				this.grabbedThing = this.selection;
				if(this.grabbedThing instanceof Prey)
					this.grabbedThing.stopEating();
				
				this.level.select(null);//Trigger this.setSelection thus this.closeMouth
				
				//Sound
				sounds.tongueStick.play();
			}
		}
	};
	
	//Drink the oasis
	this.drink = function() {		
		//Stop dehydration while drinking
		if(this.dehydrateTimer != null){
			this.dehydrateTimer.timer.remove(this.dehydrateTimer);
			this.dehydrateTimer = null;
		}
		//Hydration increase
		this.changeHydration(1);
	};
	
	//Stop drinking
	this.stopDrink = function() {
		if(this.drinkTimer != null){
			this.drinkTimer.timer.remove(this.drinkTimer);
			this.drinkTimer = null;
			
			//Sound
			sounds.swallowingWater.stop();
		}
		this.drinking = false;
		this.closeMouth();
		
		//Reactivate dehydration
		if(this.dehydrateTimer == null)
			this.dehydrateTimer = g.time.events.loop(this.dehydrateTime, this.dehydrate, this);//Déshydratation
	};
	
	//Open the mouth
	this.openMouth = function() {
		if(!this.mouthOpened){
			this.animateMouth(true);
			this.mouthOpened = true;
		}
	};
	
	//Animation
	this.animateMouth = function(open) {
		var animations, currentAnim, animated;
		animations = this.sprite.animations;
		currentAnim = animations.currentAnim;
		var animated = currentAnim != null && currentAnim.isPlaying;
		if(animated)
			currentAnim.onComplete.addOnce(function() {animations.play(open ? 'open_mouth' : 'close_mouth')});
		else
			animations.play(open ? 'open_mouth' : 'close_mouth');
	};
	
	//Close the mouth while returning the tongue
	this.closeMouth = function() {
		if(!this.mouthClosing && this.mouthOpened){
			this.mouthClosing = true;
			
			if(this.drinking)
				this.stopDrink();
			
			//Stop tongue stretching
			if(this.tongueStretch != null){
				this.tongueStretch.stop();
				this.tongueStretch = null;
			}
			
			//Start tongue returning
			if(this.tongueReturn == null){			
				this.tongueReturn = g.add.tween(this.tongue).to( { width:1 }, this.tongueGrabTime);
				this.tongueReturn.onComplete.add(this.tongueReturned, this);
				this.tongueReturn.start();
				
				//Sound
				if(this.previousSelection != null && this.previousSelection instanceof Oasis)
					sounds.waterDrop.play();
			}
			this.mouthOpened = false;
		}
	};
	
	//Tongue returned
	this.tongueReturned = function() {
		this.tongueReturn = null;
		//Close the mouth animation
		this.animateMouth(false);
		
		//Digest the grabbed selection
		if(this.selectionGrabbed && this.grabbedThing != null && !(this.grabbedThing instanceof Oasis)){			
			//Digestion
			this.digest();
				
			//Sound
			sounds.monsterBite.play();
		}
		
		this.mouthClosing = false;
	};
	
	//Digest the swallowed thing
	this.digest = function() {
		if(this.grabbedThing != null){
			if(this.grabbedThing instanceof Prey){
				//Kill the prey
				this.tongueTip.removeChild(this.grabbedThing.sprite);
				this.grabbedThing.kill();
				//Convert to vitals
				this.changeHunger(config.predator.eat_prey_hunger);
			}else if(this.grabbedThing instanceof Plant){
				//Destroy the plant
				this.tongueTip.removeChild(this.grabbedThing.sprite);
				this.grabbedThing.destroy();
				//Convert to vitals
				if(this.grabbedThing.rank == 2){//Leafy
					this.changeHunger(config.predator.eat_plantleafy_hunger);
					this.changeSeeds(config.predator.eat_plantleafy_seeds);
				}else if(this.grabbedThing.rank == 3){//Fruity
					this.changeHunger(config.predator.eat_plantfruity_hunger);
					this.changeEnergy(config.predator.eat_plantfruity_energy);
					this.changeSeeds(config.predator.eat_plantfruity_seeds);
				}else if(this.grabbedThing.rank == 4){//Seedy
					this.changeHunger(config.predator.eat_plantseedy_hunger);
					this.changeEnergy(config.predator.eat_plantseedy_energy);
					this.changeSeeds(config.predator.eat_plantseedy_seeds);
				}
			}
			
			this.selectionGrabbed = false;
			this.grabbedThing = null;
		}
	};
	
	//Plant
	this.plant = function(){
		if(this.canUseAbility() && this.canPlant()){
			//Start the ability
			this.useAbility();
			
			//Open mouth
			this.openMouth();
			
			//Plante posée instantanément invisible
			var plantPos = this.getPlantPos();
			this.newPlant = new Plant(this.level, this.level.controller, plantPos);
			this.level.addPlant(this.newPlant);
			//Animation de graine lancée
			this.seed.position = this.sprite.world;
			this.seed.alpha = 1;
			this.seed.rotation = Tools.getRandomRadianAngle();
			var seedPos = this.newPlant.sprite.world;
			this.seedLaunch = g.add.tween(this.seed).to( { x: seedPos.x, y: seedPos.y }, this.seedLaunchTime);
			this.seedLaunch.onComplete.add(this.seedPlantArrived, this);
			this.seedLaunch.start();
			
			//Sound
			sounds.spit.play();
			
			//Seeds decrease
			this.changeSeeds(-1);
			
			//Close mouth
			this.closeMouth();
		}
	};
	
	//Seed plant arrived
	this.seedPlantArrived = function() {
		//Sound
		sounds.dirtHit.play();
		
		//Close the mouth
		this.closeMouth();
		
		this.seed.alpha = 0;
		this.newPlant.born();
	};
	
	//Can plant is enough seeds, empty place and alive
	this.canPlant = function() {
		return this.alive && this.seeds > 0 && !g.physics.arcade.overlap(this.nextPlant, this.level.plantColliders);
	};
	
	//Position de la plante
	this.getPlantPos = function() {		
		//Orientation en face de celle du prédateur		
		var plantPos = Tools.getTrigPosition(this.group.position, this.plantDistance, this.group.rotation);
		
		return plantPos;
	};

	//Arroser
	this.water = function(){
		if(this.canUseAbility() && this.selection != null){
			var plant = this.selection;
			if(plant instanceof Plant && this.level.inrange && this.hydration >= this.waterneeded && plant.rank == 0){		
				//Start the ability
				this.useAbility();
				
				//Open mouth
				this.openMouth();
			
				//Hydration
				this.changeHydration(-this.waterneeded);
				
				//Jet d'eau
				this.waterjet.position = this.sprite.world;
				this.waterjet.rotation = this.group.rotation;
				this.waterjet.visible = true;
				this.wateredPlant = plant;
				
				var waterjeting = g.add.tween(this.waterjet).to( { x:plant.sprite.position.x, y:plant.sprite.position.y }, this.waterjetTime);
				waterjeting.onComplete.add(this.waterjeted, this);
				waterjeting.start();
				
				//Sound
				sounds.waterThrow.play();
			}
		}
	};

	//Waterjeting finished
	this.waterjeted = function() {
		//Watering of the plant
		if(this.wateredPlant != null){
			//Close the mouth
			this.closeMouth();
			
			this.wateredPlant.water();
			this.wateredPlant = null;
			this.waterjet.visible = false;
		}
	};
	
	//Peut arroser ?
	this.canWater = function(){
		return this.hydration >= this.waterneeded;
	};

	//*** Passive abilities
	//Heal
	this.heal = function(amount){
		this.changeHealth(1);
	};

	//Dehydrate
	this.dehydrate = function(){
		this.changeHydration(-1);
	};

	//Hunger
	this.decreaseHunger = function(){
		this.changeHunger(-1);
	};

	//Energy
	this.decreaseEnergy = function(){
		this.changeEnergy(-1);
	};

	//Deterioration
	this.updateDeterioration = function(){
		// si l'hydratation ou la faim est à 0
		this.deteriorating = this.hydration <= 0 || this.hunger <= 0;
		//Arret ou démarrage des boucles de soins ou détérioration
		if(this.deteriorating){
			if(this.deteriorateLoop == null){
				this.deteriorateLoop = g.time.events.loop(this.deteriorateTime, this.deteriorate, this);			
			}if(this.selfhealLoop != null){
				this.selfhealLoop.timer.remove(this.selfhealLoop);
				this.selfhealLoop = null;
			}
		}else{
			if(this.deteriorateLoop != null){
				this.deteriorateLoop.timer.remove(this.deteriorateLoop);
				this.deteriorateLoop = null;
				
				//Sound
				sounds.predatorPain.stop();
				
			}if(this.selfhealLoop == null)
				this.selfhealLoop = g.time.events.loop(this.selfhealTime, this.heal, this);
		}
	};

	this.deteriorate = function(){
		//If alive and dehydrated or hungry
		if(this.alive && this.deteriorating){
			if(this.health > 0){
				this.changeHealth(-1);
				
				//Sound
				setTimeout(function(){
				sounds.predatorPain.play('', 0, Tools.getRandomArbitrary(0.5, 1.3, false), null, false);}, Tools.getRandomArbitrary(0, 300, true));
				
				if(this.health <= 0)
					this.kill();
			}
		}
	};

	//Production de graine
	this.produceSeed = function(){
		//Si en vie, hydraté, pas affamé et avec de l'énergie
		if(this.alive && this.hydration > 0 && this.hunger > 0 && this.energy > 0)
			this.changeSeeds(1);
	};

	//Mort
	this.kill = function(){
		//Status mort
		this.alive = false;
		//Sound
		sounds.death.play();
		//Interruption des vitales
		if(this.dehydrateTimer != null){
			this.dehydrateTimer.timer.remove(this.dehydrateTimer);
			this.dehydrateTimer = null;
		}
		this.hungerTimer.timer.remove(this.hungerTimer);
		this.energyTimer.timer.remove(this.energyTimer);
		//Visuel mort
		this.sprite.loadTexture('predator_dead');
		this.tongue.alpha = 0;
		//Champ de vision
		this.level.sightfog.close();
		//Sounds
		sounds.tongueLaunch.stop();
		sounds.swallowingWater.stop();
		sounds.spit.stop();
		sounds.waterThrow.stop();
		//End game
		this.level.checkEndgame();
	};
	
	/**
	 * Segments de collision
	 */
	this.getCollisionsSegments = function() {
		var collisionsSegments = [], amount = 3, angle, angle1, angle2, p1, p2, segment;
		
		angle = Math.PI / amount;
		for(var div=1; div<=amount; div++){
			angle1 = angle * div;
			angle2 = Tools.regularRadian(angle1 + Math.PI);
			p1 = Tools.getTrigPosition(this.group.position, this.radius, angle1);
			p2 = Tools.getTrigPosition(this.group.position, this.radius, angle2);
			segment = new Phaser.Line(p1.x, p1.y, p2.x, p2.y);
			collisionsSegments.push(segment);
		}
		
		return collisionsSegments;
	};
	
	this.debug = function() {
		if(this.mustDebug) 
			for(var segment in this.collisionsSegments)
				g.debug.geom(this.collisionsSegments[segment], this.debugColor);
	};
	
	//Setters
	this.changeHealth = function(variation) {
		var val = Math.max(0, Math.min(config.predator.health, this.health + variation));
		if(val != this.health){
			this.health = val;
			this.gameStateInterface.update(GraphicInterface.HEALTH, this.health, variation);
		}
	};
	this.changeHydration = function(variation) {
		var val = Math.max(0, Math.min(config.predator.hydration, this.hydration + variation));
		if(val != this.hydration){
			this.hydration = val;
			this.gameStateInterface.update(GraphicInterface.HYDRATION, this.hydration, variation);
			this.updateDeterioration();//Deterioation check
		}
	};
	this.changeHunger = function(variation) {
		var val = Math.max(0, Math.min(config.predator.hunger, this.hunger + variation));
		if(val != this.hunger){
			this.hunger = val;
			this.gameStateInterface.update(GraphicInterface.HUNGER, this.hunger, variation);
			this.updateDeterioration();//Deterioation check
		}
	};
	this.changeEnergy = function(variation) {
		var val = Math.max(0, Math.min(config.predator.energy, this.energy + variation));
		if(val != this.energy){
			this.energy = val;
			this.gameStateInterface.update(GraphicInterface.ENERGY, this.energy, variation);
		}
	};
	this.changeSeeds = function(variation) {
		var val = Math.max(0, this.seeds + variation);
		if(val != this.seeds){			
			//Gain
			if(val > this.seeds){
				//Sound
				sounds.seedGained.play();
			}
			
			this.seeds = val;
			this.gameStateInterface.update(GraphicInterface.SEEDS, this.seeds, variation);
		}
	};
	
	//Références
	this.level = level;
	
	//Debug
	this.mustDebug = true;
	this.debugColor = 'rgb(200,0,0)';
	
	//Characteristics
	this.alive = true;
	this.deteriorating = false;
	this.drinking = false;
	this.rotation = 0;
	this.selection = null;
	this.previousSelection = null;
	this.grabbedThing = null;
	this.mouthOpened = false;
	this.mouthClosing = false;
	this.selectionGrabbed = false;
	this.range = config.predator.range;
	this.waterneeded = config.predator.waterneeded;
	this.position = new Phaser.Point(g.world.centerX, g.world.centerY);
	
	//The group
	this.group = g.add.group();
	this.group.position = this.position;
	
	//Vitals
	this.health = config.predator.health;
	this.hydration = config.predator.hydration;
	this.hunger = config.predator.hunger;
	this.energy = config.predator.energy;
	this.seeds = config.predator.seeds;
	this.thorn = config.predator.thorn;
	
	//Graphics, corps
	this.sprite = g.add.sprite(0, 0, 'predator');
	g.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.sprite.anchor.setTo(0.5, 0.5);

	var nbrFrame = 6, fpsOpenMouth, fpsCloseMouth;
	fpsOpenMouth = Math.ceil(1000 / (config.predator.openmouthtime / nbrFrame));
	fpsCloseMouth = Math.ceil(1000 / (config.predator.closemouthtime / nbrFrame));
	this.sprite.animations.add('open_mouth', [0, 1, 2, 3, 4, 5], fpsOpenMouth, false);
	this.sprite.animations.add('close_mouth', [5, 4, 3, 2, 1, 0], fpsCloseMouth, false);
	
	this.radius = Math.max(this.sprite.width, this.sprite.height) / 2;
	this.plantDistance = this.radius + config.predator.plantdistance;
	this.collisionsSegments = this.getCollisionsSegments();
	
	//Water jet
	this.waterjet = g.add.sprite(0, 0, 'waterjet');
	g.physics.enable(this.waterjet, Phaser.Physics.ARCADE);
	this.waterjet.anchor.setTo(1, 0.5);
	this.waterjet.visible = false;
	this.waterjetTime = config.predator.waterjettime;
	this.wateredPlant = null;
	
	//Langue en 2 parties
	this.tongue = g.add.sprite(0, 0, 'tongue');//Extensible
	g.physics.enable(this.tongue, Phaser.Physics.ARCADE);
	this.tongue.anchor.setTo(0, 0.5);
	this.tongue.width = 0;
	
	this.tongueTip = g.add.sprite(0, 0, 'tongue_tip');//Bout fixe
	g.physics.enable(this.tongueTip, Phaser.Physics.ARCADE);
	this.tongueTip.anchor.setTo(0.5, 0.5);
	this.tongueTip.position.x += 85;
	this.tongue.addChild(this.tongueTip);
	
	this.tongueGrabTime = config.predator.tonguegrabtime;
	
	//Plante suivante
	var plantPos = this.getPlantPos();//Relatif au jeu
	plantPos.x -= this.position.x;
	plantPos.y -= this.position.y;
	this.nextPlant = g.add.sprite(plantPos.x, plantPos.y, 'plant_green_greyscale');
	g.physics.enable(this.nextPlant, Phaser.Physics.ARCADE);
	this.nextPlant.frame = 0;//Frame Seed
	this.nextPlant.alpha = 0;
	this.nextPlant.anchor.setTo(0.5, 0.5);
	
	//Graine lancée
	this.seed = g.add.sprite(0, 0, 'seed_green');
	this.seed.anchor.setTo(0.5, 0.5);
	this.seed.alpha = 0;
	this.seedLaunchTime = Tools.getDistance(this.group, this.nextPlant) / config.predator.seedlaunchspeed * 1000;
	
	//The group
	this.group.addChild(this.tongue);
	this.group.addChild(this.sprite);
	this.group.addChild(this.nextPlant);
	
	//Vitals loops
	var hungerTime, energyTime, seedsTime;
	this.dehydrateTime = Phaser.Timer.SECOND * config.predator.time_dehydrate;
	hungerTime = Phaser.Timer.SECOND * config.predator.time_hunger;
	energyTime = Phaser.Timer.SECOND * config.predator.time_energy;
	seedsTime = Phaser.Timer.SECOND * config.predator.time_seeds;
	this.selfhealTime = Phaser.Timer.SECOND * config.predator.time_selfheal;
	this.deteriorateTime = Phaser.Timer.SECOND * config.predator.time_deteriorate;
	this.drinkTime = Phaser.Timer.SECOND * config.predator.time_drinking;
	
	this.selfhealLoop = null;//Soin
	this.dehydrateTimer = g.time.events.loop(this.dehydrateTime, this.dehydrate, this);//Déshydratation
	this.hungerTimer = g.time.events.loop(hungerTime, this.decreaseHunger, this);//Faim
	this.energyTimer = g.time.events.loop(energyTime, this.decreaseEnergy, this);//Energie
	this.seedsTimer = g.time.events.loop(seedsTime, this.produceSeed, this);//Seeds
	this.deteriorateLoop = null;//Détérioration
	this.drinkTimer = null;//Boire
	
	this.updateDeterioration();
	
	//Sounds
	sounds.tongueLaunch = g.add.audio("tongue_launch", 1.8);
	sounds.dropInwater = g.add.audio("drop_inwater", 2);
	sounds.swallowingWater = g.add.audio("swallowing_water", 1, true);
	sounds.waterDrop = g.add.audio("water_drop", 0.3);
	sounds.spit = g.add.audio("spit", 5);
	sounds.dirtHit = g.add.audio("dirt_hit", 5);
	sounds.waterThrow = g.add.audio("water_throw", 0.7);
	sounds.tongueStick = g.add.audio("tongue_stick", 2);
	sounds.monsterBite = g.add.audio("monster_bite", 0.2);
	sounds.predatorPain = g.add.audio("predator_pain");//Manual, static because of bug with timers on Android
	sounds.seedGained = g.add.audio("seed_gained", 0.7);
	sounds.death = g.add.audio("death", 0.7);
}