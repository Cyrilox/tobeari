/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
	
	this.create = function() {
		this.createFinished = false;
		
		//Physics engine
		g.physics.startSystem(Phaser.Physics.ARCADE);
		
		//Controlleur
		this.controller = new Controller(this);
		
		//Events
		this.interfaceDowned = false;
		this.isDraggable = false;//True after a time buffer is reach when moving
		this.isDragging = false;//True if isDraggable is true, and pointer moving
		this.hasFirstDragged = false;//To trigger onDrag only 1 time
		this.onDownDone = false;
		this.onDownOnSelection = false;
		
		g.inputEnabled = true;
		g.input.onDown.add(this.onDown, this);
		g.input.onUp.add(this.onUp, this);
		g.input.addMoveCallback(this.onMove, this);
		
		//Selection
		this.selection = null;
		this.selectionHitarea = new Phaser.Rectangle(0, 0, 1, 1);
		this.cursor = g.add.graphics(0, 0);
		
		//Etat du jeu
		this.paused = false;
		this.gameState = new GameState();
		this.raiseScoreTime = Phaser.Timer.SECOND * config.level.raisescoretime;
		
		//Predator
		this.predator = new Predator(this);
		this.inrange = false;
		
		//Brouillard de la vue du joueur
		this.sightfog = new Sightfog(this.predator);
		
		//Oasis
		this.oasis = new Oasis(this.controller);
		var oasisOrientation, oasisPosition;
		oasisOrientation = Tools.getRandomRadianAngle();
		oasisPosition = Tools.getTrigPosition(this.predator.group.position, this.predator.radius + this.oasis.sprite.width / 2, oasisOrientation);
		this.oasis.move(oasisPosition, oasisOrientation);
		
		//Plantes
		this.plants = [];
		
		//Collisions
		this.plantColliders = g.add.group();
		this.plantColliders.add(this.oasis.sprite);
		
		//Interfaces
		this.gameInterface = new GameInterface(this, this.gameState);
		this.gameStateInterface = new GameStateInterface(this);
		this.commandInterface = new CommandInterface(this);
		
		//Partage
		this.predator.setGameStateInterface(this.gameStateInterface);
		
		//Preys
		this.preys = [];
		var maxPreys = config.level.preys_max;
		for(var i=0; i<maxPreys; i++)//Création de proie à l'avance
			this.createPrey();
		this.timers = g.time.create(false);
		this.addPreyTimer = null;
		
		this.preyAddingGapMin = config.level.preys_adding_min;
		this.preyAddingGapInit = config.level.preys_adding_init;
		this.preyAddingGap = this.preyAddingGapInit;
		
		this.preyAddingGapDec = config.level.preys_adding_dec;
		this.preyAddingGapDecEach = config.level.preys_adding_deceach;
		this.decPreyTimer = null;
		
		//Other
		this.outWorldSpace = config.level.outworldspace;
		
		//Début de partie
		var objectiveTextStyle = { font: "bold 62px Arial", fill: "#B30065" };
		this.objective = g.add.text(g.world.centerX, 100, config.level.objective_text, objectiveTextStyle);
		this.objective.anchor.setTo(0.5, 1.0);
		
		//Fin de partie
		var endgameTextStyle = { font: "bold 62px Arial", fill: "#85005e" };
		this.endgameText = g.add.text(g.world.centerX, g.world.centerY, config.level.endgame_text, endgameTextStyle);
		this.endgameText.anchor.setTo(0.5, 0.0);
		this.endgameText.visible = false;
		
		//Record battu
		var bestScoreTextStyle = { font: "bold 62px Arial", fill: "#258200" };
		this.bestScoreText = g.add.text(g.world.centerX, g.world.centerY, config.level.bestscore_text, bestScoreTextStyle);
		this.bestScoreText.anchor.setTo(0.5, 1.0);
		this.bestScoreText.visible = false;
		this.bestScoreBeaten = false;
			
		//Ordre d'affichage
		this.refreshDisplayOrder();
		
		//Sounds
		sounds.selectEntity = g.add.audio("select_entity", 0.7);
		sounds.startgame = g.add.audio("startgame", 3);
		sounds.endgame = g.add.audio("endgame", 0.3);
		sounds.endgameBestscore = g.add.audio("endgame_bestscore", 0.3);
		
		//Creation terminée
		this.createFinished = true;
		
		//Reset
		this.start();
	};

	//Start the game
	this.start = function(){
		//Réinitialisation des timers
		this.preyAddingGap = this.preyAddingGapInit;
		this.addPreyTimer = this.timers.loop(this.preyAddingGap, this.addPrey, this);
		this.addPrey();//Instant add, timer will tick after
		
		//Decrease add prey gap
		this.decPreyTimer = this.timers.loop(this.preyAddingGapDecEach, this.decreaseAddingPreyTimer, this);
		
		//Score
		this.raiseScoreLoop = g.time.events.loop(this.raiseScoreTime, this.raiseScore, this);
		
		//Démarrage des timers
		this.timers.start();
		
		//Mise à jour interface
		this.gameStateInterface.init(this.gameState, this.predator);
		this.commandInterface.update(this.selection);
		
		//Affichage
		g.time.events.add(Phaser.Timer.SECOND * 3, this.fadeObjective, this);
		this.bestScoreText.visible = false;
		this.bestScoreBeaten = false;
		
		//Démarrage
		this.gameState.playing = true;
		
		//Sound
		sounds.startgame.play();
		
		//Ordre d'affichage
		this.refreshDisplayOrder();
	};
	
	//Restart level
	this.restart = function() {
		this.endTheGame();
		this.stop();
		g.state.restart();
	};
	
	//Quit level to Menu
	this.quit = function() {
		this.endTheGame();
		this.stop();
		g.state.start("Menu");
	};
	
	//Stop the game
	this.stop = function() {
		//Kill preys
		for(i in this.preys)
			this.preys[i].kill();
	};
	
	//Fade and hide the objective
	this.fadeObjective = function() {
		g.add.tween(this.objective).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
	};
	
	//Decrease the timer for prey adding
	this.decreaseAddingPreyTimer = function() {
		//Decrease the timer
		this.preyAddingGap = Math.max(this.preyAddingGapMin, this.preyAddingGap - this.preyAddingGapDec);
		this.addPreyTimer.delay = this.preyAddingGap;
		//Remove the timer
		if(this.preyAddingGap <= this.preyAddingGapMin)
			this.decPreyTimer.timer.remove(this.decPreyTimer);
	};

	//Create a reusable prey
	this.createPrey = function(){
		//Create
		var prey = new Prey(this, this.controller, 0, 0);
		this.preys.push(prey);
		
		//Collisions
		this.plantColliders.add(prey.sprite);
	};

	//Add a prey and move it
	this.addPrey = function(){
		var alivePrey = null;
		//Search one into the stockpile
		for(var i=0; i<this.preys.length; i++){
			var prey = this.preys[i];
			if(!prey.alive){
				alivePrey = prey;
				break;
			}
		}
		if(alivePrey != null){
			//Incoming side position
			incomingSide = Math.floor((Math.random() * 4) + 1);
			var x = g.world.randomX;
			var y = g.world.randomY;
			switch(incomingSide){
				case 1: y = -this.outWorldSpace;
					break;
				case 2: x = g.world.width + this.outWorldSpace;
					break;
				case 3: y = g.world.height + this.outWorldSpace;
					break;
				case 4: x = -this.outWorldSpace;
					break;
			}
			alivePrey.reborn();
			alivePrey.sprite.x = x;
			alivePrey.sprite.y = y;
		}
	};

	//Add a plant
	this.addPlant = function(plant) {
		if(plant != null && plant instanceof Plant){
			this.plants.push(plant);
			//Collisions
			this.plantColliders.add(plant.sprite);
		}
	};
	
	/**
	 * Refresh the Z order of all elements
	 */
	this.refreshDisplayOrder = function() {
		if(this.createFinished){
			var displayElements = [];
		
			displayElements.push(this.oasis.sprite);//Point d'eau
			for(var i in this.plants)//Plantes
				displayElements.push(this.plants[i].sprite);
			for(var i in this.preys)//Proies
				displayElements.push(this.preys[i].sprite);
			
			displayElements.push(this.oasis.palmtree);//Arbre
			if(this.sightfog.activated)
				displayElements.push(this.sightfog.fog);//Brouillard
			displayElements.push(this.predator.waterjet);//Brouillard
			displayElements.push(this.predator.seed);//Graines prédateur
			displayElements.push(this.predator.group);//Prédateur
			displayElements.push(this.cursor);//Curseur
			
			displayElements.push(this.gameInterface.elements);//Menu
			displayElements.push(this.gameStateInterface.elements);//Informations
			displayElements.push(this.commandInterface.elements);//Aptitudes
			
			displayElements.push(this.objective);//Objectif
			displayElements.push(this.endgameText);//Fin de jeu
			displayElements.push(this.bestScoreText);//Record battu
			
			displayElements.push(this.gameInterface.elementsDialogs);//Menu Dialogs
			
			//Display refresh
			for(var i in displayElements)
				g.world.bringToTop(displayElements[i]);
		}
	};
	
	//Updating in loop
	this.update = function() {
		if(!this.paused){
			//Touch outside the interfaces
			if (g.input.activePointer.isDown && !this.interfaceDowned && this.onDownDone){
				//Look the pointer
				if(this.predator.alive)
					this.predator.rotation = g.physics.arcade.angleToPointer(this.predator.group);
				//Unselect if dragging or first onDown position out of selection
				if(this.selection != null && (this.isDragging || !this.onDownOnSelection))
					this.controller.unselect();
			}else{
				//Look the selected target
				if(this.selection != null && this.predator.alive)		
					this.predator.rotation = Tools.getAngle(this.predator.group, this.selection.sprite);
			}
			//Mise à jours
			this.predator.update();
			for(i in this.preys)
				this.preys[i].update();
			//Portée
			this.updateOnrange();
			//Interface
			this.commandInterface.update();
			//Brouillard de vue
			this.sightfog.update();
		}
	};

	//Rendering in loop
	this.render = function() {
		if(testMode){
			//Messages
			d.clear();
			//d.addText("", );
			//d.addText("", );
			//d.addText("", );
			d.show();
			
			//Debug bodies
			if(false){
				this.showDebugBody(this.predator.nextPlant);
				this.showDebugBody(this.predator.sprite);
				if(this.oasis !== undefined)
					this.showDebugBody(this.oasis.sprite);
				this.preys.forEach(this.showDebugBody);
				this.plants.forEach(this.showDebugBody);
				
			}
			
			//Debug prey AI
			if(false){
				//Search one into the stockpile
				for(var i=0; i<this.preys.length; i++){
					var prey = this.preys[i];
					if(prey.alive)
						prey.ai.debug();
				}
			}
			
			//Debug predator AI
			if(false)
				this.predator.debug();
		}
	};
	
	//Show the debug body
	this.showDebugBody = function(element) {
		g.debug.body(element instanceof Phaser.Sprite ? element : element.sprite);
	};

	//*** POINTER EVENTS ***
	
	//First onDown when dragging, 1 time
	this.onDown = function(){
		this.isDraggable = false;
		this.isDragging = false;
		this.hasFirstDragged = false;
		this.onDownOnSelection = this.selection != null && Tools.pointInRectangle(g.input.activePointer, this.selectionHitarea);
		//Pointer on top of any interface elements
		this.interfaceDowned = this.gameInterface.isPointerOver() || this.commandInterface.isPointerOver();
		this.onDownDone = true;
	};
	
	//On move event, pointer is moving, many times
	this.onMove = function() {
		//Si le pointeur est appuyé
		if(g.input.activePointer.isDown){
			// et depuis un temps minimum
			if(this.timerDragged == null && !this.hasFirstDragged)
				this.timerDragged = g.time.events.add(300, this.onPointerDraggable, this);
			if(this.isDraggable && !this.hasFirstDragged)
				this.onFirstDrag();// c'est un glissé
		}
	};
	
	//Triggered when the pointer has been moved a minimum of timer
	this.onPointerDraggable = function() {
		this.timerDragged = null;
		this.isDraggable = true;
	};
	
	//On drag event, many times
	this.onFirstDrag = function() {
		this.hasFirstDragged = true;
		this.isDragging = true;
	};
	
	//On up event, 1 time
	this.onUp = function() {
		//On down reset
		this.onDownDone = false;
		//Interface
		this.interfaceDowned = false;
		//Clear dragging timer
		if(this.timerDragged != null){
			this.timerDragged.timer.remove(this.timerDragged);
			this.timerDragged = null;
		}
		//Drag ending
		if(this.isDragging){
			this.isDraggable = false;
			this.isDragging = false;
			this.hasFirstDragged = false;
			this.controller.dragEnded = true;
		}else{
			this.controller.dragEnded = false;
		}
	};

	//*** OTHER ***
	
	//Select or unselect with null
	this.select = function(selection) {
		if(this.selection != selection){
			if(this.selection != null)
				this.selection.sprite.removeChild(this.cursor);//Dettach it
			if(selection != null){
				//Draw the new circle
				this.cursor.clear();
				this.cursor.lineStyle(3, 0xffffff, 105, 1);
				this.cursor.drawCircle(0, 0, selection.cursorRadius);
				this.cursor.endFill();
				
				selection.sprite.addChild(this.cursor);//Attach it
				
				//Sound
				sounds.selectEntity.play();
			}
			
			this.predator.setSelection(selection);
			this.selection = selection;
			if(this.selection != null)
				this.selectionHitarea = this.selection.sprite.getLocalBounds();
		}
	}
	
	//Update in range
	this.updateOnrange = function(){
		this.inrange = this.selection != null ? Tools.getDistance(this.predator.group, this.selection.sprite) <= this.predator.range : false;
	};

	//Raise the score
	this.raiseScore = function(){
		this.gameState.score += 1;
		this.gameStateInterface.update(GraphicInterface.SCORE, this.gameState.score, 1, false);
	};
	
	//Return the closest plant find in a radius, or null
	this.getClosestEatablePlant = function(prey) {
		var plant, closestPlant = null, distance, closestDistance = 0;
		
		for(var id in this.plants){
			plant = this.plants[id];
			if(plant.alive && plant.isGrown()){
				var position = prey.sprite.position, radius = prey.plantDetectionDistance;
				distance = Tools.getDistance(position, plant.sprite);
				if(distance <= radius && (closestPlant == null || distance < closestDistance)){
					closestPlant = plant;
					closestDistance = distance;
				}
			}
		}
		
		return closestPlant;
	};
	
	//Fin de partie
	this.checkEndgame = function() {
		if(!this.predator.alive)
			this.endTheGame();
	};
	
	/**
	 * Fin de partie
	 */
	this.endTheGame = function() {
		if(this.gameState.playing){
			// alors interruption de partie.
			this.raiseScoreLoop.timer.remove(this.raiseScoreLoop);
			this.controller.unselect();
			this.gameState.playing = false;
			this.endgameText.visible = true;//Message de fin
			
			this.addScore();
			
			//Sound & bestscore
			if(this.bestScoreBeaten){
				this.bestScoreText.visible = true;
				sounds.endgameBestscore.play();
			}else
				sounds.endgame.play();
		}
	};
	
	//Scores datas
	this.addScore = function() {
		// si partie terminée
		if(!this.gameState.playing){
			//record battu
			if(scoresDatas.bestScore > 0 && this.gameState.score > scoresDatas.bestScore)
				this.bestScoreBeaten = true;
			
			scoresDatas.add(this.gameState.score);
		}
	};
}