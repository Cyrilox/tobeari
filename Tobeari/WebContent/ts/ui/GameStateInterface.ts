/**
 * The game state interface showing the game state.
 */
enum INFOS { SEEDS, ENERGY, HUNGER, HYDRATION, HEALTH, SCORE }

class GameStateInterface extends GraphicInterface {
	static INFOS = INFOS;

	private style: {};
	private texts: Phaser.Text[];
	private informations: GameStateInformation[];

	constructor(private level: Level, gameManager: GameManager, predator: Predator) {
		super();
		
		//Position & style of text element
		this.y = g.world.height - GraphicInterface.spacing;
		let size = GraphicInterface.sizeOfHeight(5);
		this.style = { font: "bold "+size+"px Arial", fill: "#2b6dcc" };

		//Informations
		let infosLength = 6;//! Dure
		
		//Text elements
		this.texts = [];
		for(let state=0; state<infosLength; state++)
			this.texts[state] = this.addText();
		
		//Information elements
		this.informations = [];
		this.informations[INFOS["SCORE"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["score"], false, this.texts[INFOS["SCORE"]]);
		this.informations[INFOS["HEALTH"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["health"], true, this.texts[INFOS["HEALTH"]]);
		this.informations[INFOS["HYDRATION"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["hydration"], true, this.texts[INFOS["HYDRATION"]]);
		this.informations[INFOS["HUNGER"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["hunger"], true, this.texts[INFOS["HUNGER"]]);
		this.informations[INFOS["ENERGY"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["energy"], true, this.texts[INFOS["ENERGY"]]);
		this.informations[INFOS["SEEDS"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["seeds"], false, this.texts[INFOS["SEEDS"]]);
		
		//Init
		this.init(gameManager, predator);
	}

	//Update the interface
	private init(gameManager: GameManager, predator: Predator) {
		this.set(INFOS["SCORE"], gameManager.score);
		
		//Refresh sizes with maximum sizes
		for(let i=0; i<this.informations.length; i++) {
			this.set(i, 10);
			this.informations[i].refresh();
		}
		
		//The set real ones
		this.set(INFOS["SCORE"], gameManager.score);
		this.set(INFOS["HEALTH"], predator.health);
		this.set(INFOS["HYDRATION"], predator.hydration);
		this.set(INFOS["HUNGER"], predator.hunger);
		this.set(INFOS["ENERGY"], predator.energy);
		this.set(INFOS["SEEDS"], predator.seeds);
	}
	
	/**
	 * Update an information and show the variation
	 */
	public update(info: number, newValue: number, variation: number) {
		//Affichage
		this.set(info, newValue);
		//Variation flottante
		this.informations[info].changeVariation(variation);
	}

	/**
	 * Create, add and return a text positionned from bottom to top
	 */
	private addText(value: string = ""): Phaser.Text {
		if(this.texts.length > 0)
			this.y -= this.texts[this.texts.length-1].height;
		let text = g.add.text(GraphicInterface.spacing, this.y, value, this.style);
		text.anchor.setTo(0, 1);
		this.elements.add(text);
		
		return text;
	}
	
	/**
	 * Set the information value
	 */
	private set(info: number, newValue: number) {
		let newValueStr = String(newValue);
		let information = this.informations[info];
		this.texts[info].text = information.textValue + newValueStr + (information.percent ? strings["gamestateinterface"]["percent"] : "");
	}
}
