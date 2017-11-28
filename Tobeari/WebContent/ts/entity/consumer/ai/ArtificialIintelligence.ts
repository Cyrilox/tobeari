/**
 * An artificial intelligence.
 */
enum STATE { SEARCHFOOD, COMETOFOOD, EATFOOD, FLEE }
enum MOVETYPE { SEARCH, COME, FLEE }

class ArtificialIntelligence {
	static STATE = STATE;
	static MOVETYPE = MOVETYPE;
	private state: any = STATE["SEARCHFOOD"];
	private moveType: any = -1;

	private plantToEat: Plant = null;
	private thinking: boolean = false;

	private threatenedDist: number;
	private fleeDistance: number;
	private fleeDistanceMin: number;
	private fleeDistanceMax: number;

	constructor(private level: Level, private map: Map, private consumerManager: ConsumerManager, private growerManager: GrowerManager, private prey: Prey, private pathfinder: Pathfinder) {
		//Init
		this.init();
		
		//Carateristics
		this.threatenedDist = conf["artificialintelligence"]["threateneddist"];
		this.fleeDistanceMin = conf["artificialintelligence"]["fleedistance_min"];
		this.fleeDistanceMax = conf["artificialintelligence"]["fleedistance_max"];
	}
	
	//Reset all variables
	public init() {
		this.state = STATE["SEARCHFOOD"];
		this.plantToEat = null;
		this.thinking = false;
		this.moveType = -1;
	}

	//Think different ;-)
	public think() {
		if(!this.thinking && this.prey != null && this.prey.isAlive()) {
			this.thinking = true;
			this.assess();
			this.act();
			this.thinking = false;
		}
	}

	//Assess the situation and refresh the states
	private assess() {
		//Plante à manger plus vivante
		if(this.plantToEat != null && !this.plantToEat.isAlive())
			this.plantToEat = null;
		
		//If threatened, flee to safe distance
		if(this.state != STATE["FLEE"] && this.isThreatened()) {
			this.state = STATE["FLEE"]; //S'enfuir loin du prédateur
			this.prey.flee();//Sound
		}

		//States
		switch(this.state) {
			case STATE["SEARCHFOOD"]: //Chercher la nourriture
				this.plantToEat = this.growerManager.getClosestEatablePlant(this.prey);
				if(this.plantToEat != null)//Nourriture vue
					this.state = STATE["COMETOFOOD"];
			break;
			
			case STATE["COMETOFOOD"]: //Se diriger vers la nourriture
				if(this.plantToEat == null)//Plus de plante
					this.state = STATE["SEARCHFOOD"];//donc recherche
				else//Plante
					if(this.prey.isOnPlant(this.plantToEat))//Nourriture atteinte
						this.state = STATE["EATFOOD"];
			break;
			
			case STATE["EATFOOD"]: //Manger la nourriture
				if(this.plantToEat == null) {//Plus de plante
					this.state = STATE["SEARCHFOOD"];//donc recherche
					//Stop eating
					this.prey.stopEating();
				}
			break;
			
			case STATE["FLEE"]: //S'enfuir loin du prédateur
				let predatorDist = this.prey.cell.hex.distance(this.consumerManager.predator.cell.hex);
				if(predatorDist >= this.fleeDistance)//fuite terminée
					this.state = STATE["SEARCHFOOD"];//donc recherche
			break;
		}
	}
	
	//Define if a threat is here
	private isThreatened(): boolean {
		let predator = this.consumerManager.predator.group;
		let angleFromPredToPrey = Tools.getAngle(predator, this.prey.group);
		let sightAngleToPrey = Tools.getClosestAngle(predator.rotation, angleFromPredToPrey);//Positive radian
		let predatorLooking = sightAngleToPrey < this.consumerManager.predator.sightfog.halfWidth; //regarde si angle de vue faible

		let cellOrNextCell = this.prey.isMoving ? this.prey.nextCell : this.prey.cell;
		let predatorDist = cellOrNextCell.hex.distance(this.consumerManager.predator.cell.hex);
		
		//si vivant, regardé et trop proche
		return this.consumerManager.predator.isAlive() && predatorLooking && predatorDist <= this.threatenedDist;
	}
	
	//Act
	private act() {
		let target: Cell;
		switch(this.state) {
			case STATE["SEARCHFOOD"]: //Chercher la nourriture
				if(!this.prey.isMoving || this.moveType != MOVETYPE["SEARCH"]) {
					//Move to a random Cell on the map
					target = this.level.map.getRandomWalkableCell();
					this.move(target, false);
					this.moveType = MOVETYPE["SEARCH"];
				}
			break;
			
			case STATE["COMETOFOOD"]: //Se diriger vers la nourriture
				if(!this.prey.isMoving || this.moveType != MOVETYPE["COME"]) {
					if(this.plantToEat != null) {
						//Move to the plant to eat
						target = this.plantToEat.cell;
						this.move(target, false);
						this.moveType = MOVETYPE["COME"];
					}
				}
			break;
			
			case STATE["EATFOOD"]: //Manger la nourriture
				if(this.plantToEat != null && this.plantToEat.isAlive() && !this.prey.eating && this.prey.isOnPlant(this.plantToEat)) {
					//Eat the plant
					this.prey.eat(this.plantToEat);
				}
			break;
			
			case STATE["FLEE"]: //S'enfuir loin du prédateur
				if(!this.prey.isMoving || this.moveType != MOVETYPE["FLEE"]) {
					//Flee to approximately the opposite way of the predator
					this.fleeDistance = Tools.getRandomArbitrary(this.fleeDistanceMin, this.fleeDistanceMax+1, true);
					let cells = this.level.map.getRingCells(this.prey.cell, this.fleeDistance, true);
					let cellsOK: Cell[] = [];
					let distancePredatorCell: number, distanceMax = -1;
					for(let i in cells){
						distancePredatorCell = cells[i].hex.distance(this.consumerManager.predator.cell.hex);
						if(distancePredatorCell > distanceMax){
							cellsOK = [];
							distanceMax = distancePredatorCell;
						}
						if(distancePredatorCell >= distanceMax)
							cellsOK.push(cells[i]);
					}

					if(cellsOK.length > 0){
						target = cellsOK[Tools.getRandomArbitrary(0, cellsOK.length, true)];
						this.move(target, true);
						this.moveType = MOVETYPE["FLEE"];
					}
				}
			break;
		}
	}

	//*** Pathfinding ***
	
	/**
	 * Search a path and then start to follow this one, or do nothing if not reachable
	 */
	private move(target: Cell, sprint: boolean) {
		//Start Cell depending if it is moving
		let startCell = this.prey.isMoving ? this.prey.nextCell : this.prey.cell;

		//Search a path, allowing this prey to be walked
		let path = this.pathfinder.find(startCell, target, this.prey);

		//Follow the path found
		if (path !== null)
			this.prey.followPath(path, sprint);
	}
}