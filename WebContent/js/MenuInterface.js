/*
 * The menu interface.
 * @class MenuInterface
 * @contructor
 */
function MenuInterface(){
	GraphicInterface.call(this);
	
	this.play = function() {
		//Start level state
		sounds.menuSelection.play();
		g.state.start("Level");
	};
	
	this.scores = function() {
		//Start scores state
		sounds.menuSelection.play();
		g.state.start("Scores");
	};
	
	this.about = function() {
		//Start about state
		sounds.menuSelection.play();
		g.state.start("About");
	};
	
	this.buttonHeight = 70;
	this.x = g.world.centerX;
	this.y = (g.world.height - (GraphicInterface.spacing * 2 + this.buttonHeight * 3)) / 2;
	
	//Game name
	var gameNameStyle = { font: "bold 70px Arial", fill: "#471c07" };
	this.gameName = g.add.text(this.spacing, this.spacing, config.menu.gamename, gameNameStyle);
	this.gameName.anchor.setTo(0, 0.0);
	
	//Image
	this.image = g.add.sprite(0, g.world.height, "menu_image");
	this.image.anchor.setTo(0, 1.0);
	
	//Boutons
	this.butPlay = this.addAlignedButton('button_play', this.play);
	this.butScores = this.addAlignedButton('button_scores', this.scores);
	this.butAbout = this.addAlignedButton('button_about', this.about);
}