/*
 * The game state interface showing the game state.
 * @class GameStateInterface
 * @contructor
 */
function GameStateInterface(level){
	GraphicInterface.call(this);

	//Create, add and return a text
	this.addText = function(string){
		if(this.texts.length > 0)
			this.y += this.texts[this.texts.length-1].height;
		var text = g.add.text(this.spacing, this.y, string, this.style);
		this.elements.add(text);
		
		return text;
	};

	//Update the interface
	this.init = function(gameState, predator){
		this.set(GraphicInterface.SCORE, gameState.score);
		
		//Refresh sizes with maximum sizes
		for(var i in this.informations){
			this.set(i, "%a");
			this.informations[i].refresh();
		}
		
		//The set real ones
		this.set(GraphicInterface.SCORE, gameState.score);
		this.set(GraphicInterface.HEALTH, predator.health);
		this.set(GraphicInterface.HYDRATION, predator.hydration);
		this.set(GraphicInterface.HUNGER, predator.hunger);
		this.set(GraphicInterface.ENERGY, predator.energy);
		this.set(GraphicInterface.SEEDS, predator.seeds);
		
	};
	
	/**
	 * Update an information and show the variation
	 */
	this.update = function(state, newValue, variation) {
		//Affichage
		this.set(state, newValue);
		//Variation flottante
		this.informations[state].changeVariation(variation);
	};
	
	/**
	 * Set the information value
	 */
	this.set = function(state, newValue) {
		var info = this.informations[state];
		this.texts[state].text = info.textValue + newValue + (info.percent ? config.gamestateinterface.percent : "");
	};
	
	//Informations
	GraphicInterface.SCORE=0,GraphicInterface.HEALTH=1,GraphicInterface.HYDRATION=2,GraphicInterface.HUNGER=3,GraphicInterface.ENERGY=4,GraphicInterface.SEEDS=5;
	var infosLength = 6;
	
	//Position & style of text element
	this.y = g.world.centerY;
	this.style = { font: "bold 25px Arial", fill: "#2b6dcc" };
	
	//Text elements
	this.texts = [];
	for(var state=0; state<infosLength; state++)
		this.texts[state] = this.addText();
	
	//Information elements
	this.informations = [infosLength];
	this.informations[GraphicInterface.SCORE] = new GameStateInformation(level, this.elements, config.gamestateinterface.score, false, this.texts[GraphicInterface.SCORE]);
	this.informations[GraphicInterface.HEALTH] = new GameStateInformation(level, this.elements, config.gamestateinterface.health, true, this.texts[GraphicInterface.HEALTH]);
	this.informations[GraphicInterface.HYDRATION] = new GameStateInformation(level, this.elements, config.gamestateinterface.hydration, true, this.texts[GraphicInterface.HYDRATION]);
	this.informations[GraphicInterface.HUNGER] = new GameStateInformation(level, this.elements, config.gamestateinterface.hunger, true, this.texts[GraphicInterface.HUNGER]);
	this.informations[GraphicInterface.ENERGY] = new GameStateInformation(level, this.elements, config.gamestateinterface.energy, true, this.texts[GraphicInterface.ENERGY]);
	this.informations[GraphicInterface.SEEDS] = new GameStateInformation(level, this.elements, config.gamestateinterface.seeds, false, this.texts[GraphicInterface.SEEDS]);
	
}
