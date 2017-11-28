/*
 * The prey.
 * @class Prey
 * @contructor
 */
function Prey(level, controller, x, y){

	//Update
	this.update = function() {
		//Sound volume proportionnal to distance
		var lastVolume = this.volume;
		var newVolume = 1 - Math.min(1, Tools.getDistance(this.sprite, this.level.predator.group) * 1 / sounds.distanceMax);
		if(Math.abs(this.volume - newVolume) >= 0.01){
			this.volume = newVolume;
			sounds.creatureWalk.volume = sounds.creatureWalkVolume * this.volume;
			sounds.creatureSprint.volume = sounds.creatureSprintVolume * this.volume;
			sounds.eatPlant.volume = sounds.eatPlantVolume * this.volume;
			sounds.preyScared.volume = sounds.preyScaredVolume * this.volume;
		}
	};
	
	/*
	 * Move the prey
	 * @param {Phaser.Sprite} target Target Sprite or Point
	 * @param {boolean} sprint True to move with a sprint
	 */
	this.move = function(path, sprint){
		this.stopMoving();
		this.stopEating();
		if(path.length > 0){
			var waypoint = path[0], distance, time;
			distance = Tools.getDistance(this.sprite, waypoint);
			time = distance / (sprint ? this.speedSprint : this.speed) * 1000;
			
			this.moving = g.add.tween(this.sprite).to( { x: waypoint.x, y: waypoint.y }, time);
			this.moving.onComplete.add(this.onMoveComplete, this);
			this.moving.start();
			
			this.sprite.rotation = Tools.getAngle(this.sprite, waypoint);
			
			//Sounds
			if(sprint)
				sounds.creatureSprint.play();
			else
				sounds.creatureWalk.play();
		}
	};
	
	//Stop moving
	this.stopMoving = function() {
		if(this.moving != null){
			this.moving.stop(false);
			g.tweens.remove(this.moving);
			
			this.ai.moveStopped();
			this.moving = null;			
			this.think();
		}
		
		//Sounds
		sounds.creatureSprint.stop();
		sounds.creatureWalk.stop();
	};
	
	//End of move
	this.onMoveComplete = function() {
		this.ai.moveComplete();
		this.moving = null;
		this.think();
	};
	
	//Is moving
	this.isMoving = function() {
		return this.moving != null;
	};
	
	//Kill the prey
	this.kill = function(){
		//Stop AI
		if(this.ailoop != null){
			this.ailoop.timer.remove(this.ailoop);
			this.ailoop = null;
		}
		//Destruction
		this.sprite.kill();
		this.alive = false;
		//Stop mouvement
		this.stopMoving();
		//Stop eating
		this.stopEating();
		//Déselection
		if(this.level.selection == this)
			this.controller.unselect();
		//Sounds
		sounds.creatureWalk.stop();
		sounds.creatureSprint.stop();
		sounds.eatPlant.stop();
		sounds.preyScared.stop();
	};

	//Reborn the prey
	this.reborn = function(){
		//Renaissance
		this.sprite.revive();
		g.world.add(this.sprite);
		this.level.refreshDisplayOrder();
		this.freeze = false;
		this.alive = true;
		//AI is thinking often
		this.ai.init();
		this.ailoop = g.time.events.loop(this.thinkTime, this.think, this);
		this.think();
	};
	
	//Think of the ai
	this.think = function() {
		if(!this.freeze)
			this.ai.think();
	};
	
	//In range to eat
	this.inRangeToEat = function(plant) {
		return Tools.getDistance(this.sprite, plant.sprite) < this.eatRange;
	};
	
	//Eat a plant
	this.eat = function(plant) {
		if(plant instanceof Plant && plant.isGrown()){
			this.stopMoving();
			this.stopEating();
			
			this.sprite.animations.play('chew');
			this.plantToEat = plant;
			this.eatTimer = g.time.events.loop(this.eatTime, this.eatPlantPart, this);
			
			//Sounds
			sounds.eatPlant.play();
		}
	};
	
	//Eat a part of the plant
	this.eatPlantPart = function() {
		if(this.plantToEat != null && this.plantToEat.alive)
			this.plantToEat.downgrade();
		else
			this.stopEating();
	};
	
	//Stop eating
	this.stopEating = function() {
		if(this.eatTimer != null){
			this.sprite.animations.stop(null, true);
			this.eatTimer.timer.remove(this.eatTimer);
			this.eatTimer = null;
		}
		
		//Sounds
		sounds.eatPlant.stop();
	};
	
	//Scared prey
	this.flee = function() {
		//Sounds
		sounds.preyScared.play();
	};
	
	this.level = level;
	this.controller = controller;
	
	//Caractéritiques
	this.speed = config.prey.speed_normal;
	this.speedSprint = config.prey.speed_sprint;
	this.plantDetectionDistance = config.prey.plant_detectiondistance;
	this.thinkTime = Phaser.Timer.SECOND / config.prey.think_persecond;
	this.eatRange = config.prey.eat_range;
	
	this.moving = null;
	this.freeze = false;
	this.alive = false;
	this.eatTime = config.prey.eat_time;
	this.plantToEat = null;

	//Sounds
	this.volume = 1;
	sounds.distanceMax = 250;
	sounds.creatureWalkVolume = 1;
	sounds.creatureSprintVolume = 1;
	sounds.eatPlantVolume = 1;
	sounds.preyScaredVolume = 0.7;
	sounds.creatureWalk = g.add.audio("creature_walk", sounds.creatureWalkVolume, true);
	sounds.creatureSprint = g.add.audio("creature_sprint", sounds.creatureSprintVolume, true);
	sounds.eatPlant = g.add.audio("eat_plant", sounds.eatPlantVolume, true);
	sounds.preyScared = g.add.audio("prey_scared", sounds.preyScaredVolume);
	
	//Create
	this.sprite = g.add.sprite(0, 0, 'prey');
	this.sprite.anchor.setTo(0.5, 0.5);
	g.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.radius = Math.max(this.sprite.width, this.sprite.height) / 2;
	
	var nbrFrame = 6, fpsChew;
	fpsChew = Math.ceil(1000 / (config.prey.chewtime / nbrFrame));
	this.sprite.animations.add('chew', null, fpsChew, true);
	
	//Cursor
	this.cursorRadius = Math.sqrt(this.sprite.width * this.sprite.width + this.sprite.height * this.sprite.height);
	
	//Events
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputUp.add(function(){
		controller.select(this);
		}, this);
		
	//Artificial Intelligence
	this.ailoop = null;
	this.ai = new ArtificialIntelligence(level, this);
	
	//Mort par défaut
	this.kill();
}