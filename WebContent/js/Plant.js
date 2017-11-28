/*
 * The plant.
 * @class Plant
 * @contructor
 */
function Plant(level, controller, position){

	//Plant is born
	this.born = function() {
		this.sprite.alpha = 1;
		this.rank = this.RANK_SEED;
	};
	
	//Water the plant
	this.water = function(){
		if(this.rank == this.RANK_SEED){
			this.rank = this.RANK_WATERED;
			this.sprite.frame = 1;
		
			//Start the leaf growth
			this.timerLeafing = g.time.events.add(this.growToLeafTime, this.leaf, this);
		}
	};

	//Leaf the plant
	this.leaf = function(){
		if(this.rank == this.RANK_WATERED){
			this.rank = this.RANK_LEAFY;
			this.sprite.frame = 2;
			
			//Sound
			sounds.plantGrowing.play();
			
			//Start the fruit growth
			this.timerFruiting = g.time.events.add(this.growToFruitTime, this.fruit, this);
		}
	};

	//Fruit the plant
	this.fruit = function(){
		if(this.rank == this.RANK_LEAFY){
			this.rank = this.RANK_FRUITY;
			this.sprite.frame = 3;
			
			//Sound
			sounds.plantGrowing.play();
			
			//Start the seed growth
			this.timerSeedy = g.time.events.add(this.growToSeedTime, this.seed, this);
		}
	};

	//Seed the plant
	this.seed = function(){
		if(this.rank == this.RANK_FRUITY){
			this.rank = this.RANK_SEEDY;
			this.sprite.frame = 4;
			
			//Sound
			sounds.plantGrowing.play();
		}
	};
	
	//Plante poussée si feuillue ou fruitée
	this.isGrown = function() {
		return this.rank > this.RANK_WATERED;
	};

	//Destroy a part, a downgrade
	this.downgrade = function() {
		//Stop timers
		this.stopTimers();
		//Downgrade
		if(this.rank == this.RANK_LEAFY)
			this.rank = -1;
		else
			this.rank--;
		
		if(this.rank <= -1)
			this.destroy();
		else
			this.sprite.frame = this.rank;
		//Repousse
		switch(this.rank){
			case this.RANK_WATERED:this.timerLeafing = g.time.events.add(this.growToLeafTime, this.leaf, this);
			break;
			case this.RANK_LEAFY:this.timerFruiting = g.time.events.add(this.growToFruitTime, this.fruit, this);
			break;
			case this.RANK_FRUITY:this.timerSeedy = g.time.events.add(this.growToSeedTime, this.seed, this);
			break;
		}
		
		//Display order
		
	};
	
	//Destroy the plant
	this.destroy = function(){
		//Destruction
		this.sprite.kill();
		this.alive = false;
		//Stop timers
		this.stopTimers();
		//Déselection
		this.controller.unselect();
	};
	
	//Stop timers
	this.stopTimers = function() {
		if(this.timerLeafing != null){
			this.timerLeafing.timer.remove(this.timerLeafing);
			this.timerLeafing = null;
		}
		if(this.timerFruiting != null){
			this.timerFruiting.timer.remove(this.timerFruiting);
			this.timerFruiting = null;
		}
		if(this.timerSeedy != null){
			this.timerSeedy.timer.remove(this.timerSeedy);
			this.timerSeedy = null;
		}
	};

	this.level = level;
	this.controller = controller;
	
	//Stade de développement
	this.alive = true;
	this.RANK_SEED = 0, this.RANK_WATERED = 1, this.RANK_LEAFY = 2, this.RANK_FRUITY = 3, this.RANK_SEEDY = 4;
	this.rank = -1;//Not born
	//Graphismes
	this.sprite = g.add.sprite(position.x, position.y, 'plant_green');
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.rotation = Tools.getRandomRadianAngle();
	g.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.sprite.alpha = 0;
	//Cursor
	this.cursorRadius = Math.sqrt(this.sprite.width * this.sprite.width + this.sprite.height * this.sprite.height);
	
	//Events
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputUp.add(function(){
		controller.select(this);
		}, this);
	//Timers
	this.timerLeafing = null;
	this.timerFruiting = null;
	this.timerSeedy = null;
	//Temps
	this.growToLeafTime = Phaser.Timer.SECOND * config.plant.growtime_leaf;
	this.growToFruitTime = Phaser.Timer.SECOND * config.plant.growtime_fruit;
	this.growToSeedTime = Phaser.Timer.SECOND * config.plant.growtime_seed;
	
	//Sounds
	sounds.plantGrowing = g.add.audio("plant_growing", 1);
	
}