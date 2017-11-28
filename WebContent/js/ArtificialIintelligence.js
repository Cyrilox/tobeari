/*
 * An artificial intelligence.
 * @class ArtificialIntelligence
 * @contructor
 */
function ArtificialIntelligence(level, prey){

	//Think different ;-)
	this.think = function(){
		if(!this.thinking && this.prey != null && this.prey.alive){
			this.thinking = true;
			this.assess();
			this.act();
			this.thinking = false;
		}
	};

	//Assess the situation and refresh the states
	this.assess = function() {
		var preyPos = this.prey.sprite.position;
		//Plante à manger
		if(this.plantToEat != null && !this.plantToEat.alive)
			this.plantToEat = null;
		//If threatened, flee to safe distance
		if(this.state != this.STATE_FLEE && this.isThreatened()){
			this.state = this.STATE_FLEE; //S'enfuir loin du prédateur
			
			this.prey.flee();
		}
		//States
		switch(this.state){
			case this.STATE_SEARCHFOOD: //Chercher la nourriture
				this.plantToEat = this.level.getClosestEatablePlant(this.prey);
				if(this.plantToEat != null){//Nourriture vue
					this.state = this.STATE_COMETOFOOD;
					this.target = null;
					//TODO: Animation/Son indiquant qu'une plante est vue
				}
			break;
			
			case this.STATE_COMETOFOOD: //Se diriger vers la nourriture
				if(this.plantToEat == null){//Plus de plante
					this.state = this.STATE_SEARCHFOOD;//donc recherche
					//TODO: Animation/Son indiquant que la plante a été mangée
				}else{//Plante
					if(this.prey.inRangeToEat(this.plantToEat)){//Nourriture proche
						this.state = this.STATE_EATFOOD;
						this.target = null;
						//TODO: Animation/Son indiquant que la plante va être manger
					}
				}
			break;
			
			case this.STATE_EATFOOD: //Manger la nourriture
				if(this.plantToEat == null){//Plus de plante
					this.state = this.STATE_SEARCHFOOD;//donc recherche
					this.target = null;
					//Stop eating
					this.prey.stopEating();
					this.eating = false;
					//TODO: Animation/Son indiquant que la plante a été mangée
				}
			break;
			
			case this.STATE_FLEE: //S'enfuir loin du prédateur
				var predatorDist = Tools.getDistance(this.prey.sprite, this.level.predator.group);
				if(predatorDist > this.safeDistance){//plus menacé
					this.state = this.STATE_SEARCHFOOD;//donc recherche
					this.target = null;
					this.plantToEat = null;
					//TODO: Animation/Son indiquant qu'il nest plus menacé
				}
			break;
		}
	
	};
	
	//Define if a threat is here
	this.isThreatened = function() {
		var predSprite = this.level.predator.group;
		var angleFromPredToPrey = Tools.getAngle(predSprite, this.prey.sprite);
		var sightAngleToPrey = Tools.getClosestAngle(predSprite.rotation, angleFromPredToPrey);//Positive radian
		var predatorLooking = sightAngleToPrey < this.level.sightfog.halfWidth; //regarde si angle de vue faible

		var predatorDist = Tools.getDistance(this.prey.sprite, predSprite);
		//si vivant, regardé et trop proche
		return this.level.predator.alive && predatorLooking && predatorDist < this.threatenedDist;
	};
	
	//Act
	this.act = function() {
		switch(this.state){
			case this.STATE_SEARCHFOOD: //Chercher la nourriture
				if(!this.prey.isMoving() || this.moveType != this.MOVETYPE_SEARCH){
					if(this.target == null){
						//Aléatoirement
						var x = Tools.getRandomArbitrary(-this.outboundDistance, g.world.width + this.outboundDistance, true);
						var y = Tools.getRandomArbitrary(-this.outboundDistance, g.world.height + this.outboundDistance, true);

						this.target = new Phaser.Point(x, y);
						this.createMoves(this.target, true);//Set the path and not overlaping target
					}
					this.prey.move(this.path, false);
					//Type de mouvement
					this.moveType = this.MOVETYPE_SEARCH;
				}
			break;
			
			case this.STATE_COMETOFOOD: //Se diriger vers la nourriture
				if(!this.prey.isMoving() || this.moveType != this.MOVETYPE_COME){
					if(this.plantToEat != null){
						if(this.target == null){
							this.target = this.plantToEat.sprite.position;
							this.createMoves(this.target, false);//Set the path and not overlaping target
						}
						this.prey.move(this.path, false);
						//Type de mouvement
						this.moveType = this.MOVETYPE_COME;
					}
				}
			break;
			
			case this.STATE_EATFOOD: //Manger la nourriture
				if(this.plantToEat != null && this.prey.inRangeToEat(this.plantToEat) && !this.eating){
					this.prey.eat(this.plantToEat);
					this.eating = true;
				}
				
			break;
			
			case this.STATE_FLEE: //S'enfuir loin du prédateur
				if(!this.prey.isMoving() || this.moveType != this.STATE_FLEE){
					if(this.target == null){
						//A l'opposé, environ
						var anglePredToPrey = Tools.getAngle(this.level.predator.group, this.prey.sprite);
						var predDist = Tools.getDistance(this.prey.sprite, this.level.predator.group);
						var distanceRadius = Math.max(0, Tools.getRandomArbitrary(this.fleeDistanceMin, this.fleeDistanceMax) - predDist);
						this.target = Tools.getTrigPosition(this.prey.sprite.position, distanceRadius, anglePredToPrey);
						this.createMoves(this.target, true);//Set the path and not overlaping target
					}
					this.prey.move(this.path, true);
					//Type de mouvement
					this.moveType = this.MOVETYPE_FLEE;
				}
				
			break;
		}
	};
	
	/**
	 * Move the target to a not overlaping position
	 * Create the path to a target point
	 * @param {Phaser.Point} target Point d'arrivée
	 */
	this.createMoves = function(target, safe) {
		//Variables
		var start, radius, predatorPos, predatorRadius, minimumDistance;
		start = this.prey.sprite.position;//Point de départ
		radius = this.prey.radius * 150 / 100;//Rayon proie
		predatorPos = this.level.predator.group.position;
		predatorRadius = this.level.predator.radius * 150 / 100;
		minimumDistance = radius + predatorRadius;
		
		//If overlaping target position
		if(safe && Tools.getDistance(target, predatorPos) <= minimumDistance){
			//Déplacement au plus proche du point initial
			target = Tools.getTrigPosition(predatorPos, minimumDistance, Tools.getAngle(predatorPos, target));
		}
		//Path
		
		//Segments intérieurs des cercles (diamètre), perpendiculaires par rapport à droite start>target
		var startSeg1, startSeg2, startSeg, targetSeg1, targetSeg2, targetSeg;
		//TODO gauche et droite, actuelle aléatoire
		startSeg1 = GeometryTools.getTrianglePointC(target, start, GeometryTools.radian90, radius);
		startSeg2 = GeometryTools.getTrianglePointC(target, start, -GeometryTools.radian90, radius);
		startSeg = new Phaser.Line(startSeg1.x, startSeg1.y, startSeg2.x, startSeg2.y);
		
		targetSeg1 = GeometryTools.getTrianglePointC(start, target, GeometryTools.radian90, radius);
		targetSeg2 = GeometryTools.getTrianglePointC(start, target, -GeometryTools.radian90, radius);
		targetSeg = new Phaser.Line(targetSeg1.x, targetSeg1.y, targetSeg2.x, targetSeg2.y);
		
		//Segments empruntés dans le voyage start>target
		var segMiddle, seg1, seg2;
		segMiddle = new Phaser.Line(start.x, start.y, target.x, target.y);
		seg1 = new Phaser.Line(startSeg1.x, startSeg1.y, targetSeg1.x, targetSeg1.y);
		//Si intersection avec milieu, inversion des cotés de segments
		if(segMiddle.intersects(seg1, true) != null){
			seg1 = new Phaser.Line(startSeg1.x, startSeg1.y, targetSeg2.x, targetSeg2.y);
			seg2 = new Phaser.Line(startSeg2.x, startSeg2.y, targetSeg1.x, targetSeg1.y);
		}else
			seg2 = new Phaser.Line(startSeg2.x, startSeg2.y, targetSeg2.x, targetSeg2.y);
		
		//Collision si au moins 1 segment croise le segment du prédateur
		var collision = false, segment;
		for(var i=0; i<this.level.predator.collisionsSegments.length; i++){
			segment = this.level.predator.collisionsSegments[i];
			if(seg1.intersects(segment, true) != null || seg2.intersects(segment, true) != null){
				collision = true;
				break;
			}
		}
		
		//Le chemin
		this.path = [target];
		if(collision){//Waypoint
			//Perpendiculaire par rapport à droite;
			var anglePredStartTarget, predSegAngle1, predSegAngle2;
			anglePredStartTarget = Tools.getAngle(start, predatorPos) - Tools.getAngle(start, target);
			predSegAngle1 = Math.abs(GeometryTools.radian90 - anglePredStartTarget);
			predSegAngle2 = -Math.abs(GeometryTools.radian180 - predSegAngle1);
			
			//2 cotés possible
			var waypoint1, waypoint2, waypoint;
			waypoint1 = GeometryTools.getTrianglePointC(start, predatorPos, predSegAngle1, minimumDistance);
			waypoint2 = GeometryTools.getTrianglePointC(start, predatorPos, predSegAngle2, minimumDistance);
			//Le plus proche pour le chemin le plus court
			waypoint = (Tools.getDistance(start, waypoint1) < Tools.getDistance(start, waypoint2)) ? waypoint1 : waypoint2;
			this.path.unshift(waypoint);
		}
		
		//Debug
		if(this.mustDebug){
			this.start = start;
			this.startCircle = new Phaser.Circle(start.x, start.y, radius*2);
			this.startSeg = startSeg;
			
			this.waypointCircle = collision ? new Phaser.Circle(waypoint.x, waypoint.y, radius*2) : null;
			
			this.target = target;
			this.targetCircle = new Phaser.Circle(target.x, target.y, radius*2);
			this.targetSeg = targetSeg;
			
			this.predatorPos = predatorPos;
			this.predatorCircle = new Phaser.Circle(predatorPos.x, predatorPos.y, predatorRadius*2);
			
			this.segMiddle = segMiddle;
			this.seg1 = seg1;
			this.seg2 = seg2;
		}
	};
	
	/**
	 * Move cancelled, cancel moving
	 */
	this.moveStopped = function() {
		this.path = null;
		this.target = null;
	};
	
	/**
	 * Eache time a move is complete
	 */
	this.moveComplete = function() {
		if(this.path != null){
			this.path.shift();
			if(this.path.length == 0)
				this.target = null;
		}else
			this.target = null;
	};
	
	this.debug = function() {
		if(this.mustDebug && this.target != null){
			g.debug.geom(this.start, this.debugColor);
			//g.debug.geom(this.startCircle, this.debugColor);
			g.debug.geom(this.startSeg, this.debugColor);
			
			if(this.waypointCircle != null)
				g.debug.geom(this.waypointCircle, this.debugColor);
			
			g.debug.geom(this.target, this.debugColor);
			//g.debug.geom(this.targetCircle, this.debugColor);
			g.debug.geom(this.targetSeg, this.debugColor);
			
			g.debug.geom(this.predatorPos, this.debugColor);
			//g.debug.geom(this.predatorCircle, this.debugColor);
			g.debug.geom(this.predatorSeg, this.debugColor);
			g.debug.geom(this.predatorSegFace, this.debugColor);
			
			g.debug.geom(this.segMiddle, this.debugColor);
			g.debug.geom(this.seg1, this.debugColor);
			g.debug.geom(this.seg2, this.debugColor);
		}
	};
	
	//Reset all variables
	this.init = function() {
		this.state = this.STATE_SEARCHFOOD;
		this.plantToEat = null;
		this.thinking = false;
		this.eating = false;
		this.target = null;
		this.path = [];
		this.moveType = -1;
	};
	
	this.level = level;
	this.prey = prey;
	
	//Debug
	this.mustDebug = false;
	this.debugColor = 'rgb(200,0,0)';
	
	this.STATE_SEARCHFOOD = 0, this.STATE_COMETOFOOD = 1, this.STATE_EATFOOD = 2, this.STATE_FLEE = 3;
	this.state = this.STATE_SEARCHFOOD;
	
	this.plantToEat = null;
	this.thinking = false;
	this.eating = false;
	
	this.threatenedDist = config.artificialintelligence.threateneddist;
	this.fleeDistanceMin = config.artificialintelligence.fleedistance_min;
	this.fleeDistanceMax = config.artificialintelligence.fleedistance_max;
	this.safeDistance = config.artificialintelligence.safedistance;
	this.outboundDistance = config.artificialintelligence.outbounddistance;//Distance max de recherche hors de l'écran
	
	//Déplacement
	this.target = null;//Point d'arrivée
	this.path = [];//Liste de points à parcourir, le dernier est la cible
	this.MOVETYPE_SEARCH = 0, this.MOVETYPE_COME = 1, this.MOVETYPE_FLEE = 2;
	this.moveType = -1;
}