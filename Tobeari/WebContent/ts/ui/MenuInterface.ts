/**
 * The menu interface.
 */
class MenuInterface extends GraphicInterface {
	private gameName: Phaser.Text;
	private image: Phaser.Sprite;
	private butPlay: Button;
	private butScores: Button;
	private butAbout: Button;
	
	constructor() {
		super();

		//Position
		this.x = g.world.centerX;
		this.y = g.world.centerY;
		
		//Game name
		let gameNameFontSize = GraphicInterface.sizeOfHeight(17);
		let gameNameStyle = { font: "bold "+gameNameFontSize+"px Arial", fill: "#471c07" }
		this.gameName = g.add.text(GraphicInterface.spacing, 0, strings["menuinterface"]["gamename"], gameNameStyle);
		this.gameName.anchor.setTo(0, 0);
		GraphicInterface.scaleByHeight(this.gameName, 17);
		
		//Image
		this.image = Tools.addSprite(0, g.world.height, "menu_image");	
		this.image.anchor.setTo(0, 1.0);
		GraphicInterface.scaleByHeight(this.image, 83);
		
		//Boutons
		this.butPlay = new Button(Button.TYPE["TEXT"], String(strings["menuinterface"]["play"]), this.x, this.y, 22, this.play, this);
		this.butScores = new Button(Button.TYPE["TEXT"], String(strings["menuinterface"]["scores"]), this.x, this.y, 15, this.scores, this);
		this.butAbout = new Button(Button.TYPE["TEXT"], String(strings["menuinterface"]["about"]), this.x, this.y, 15, this.about, this);

		this.butPlay.setAnchor(0.5, 1);
		this.butScores.setAnchor(0.5, 0.5);
		this.butAbout.setAnchor(0.5, 0);

		this.butPlay.moveTo(null, this.butScores.y - GraphicInterface.spacing - this.butScores.height / 2);
		this.butAbout.moveTo(null, this.butScores.y + GraphicInterface.spacing + this.butScores.height / 2);
	}

	private play() {
		//Start level state
		Tools.startState("Level", true);
	}
	
	private scores() {
		//Start scores state
		Tools.startState("Scores");
	}
	
	private about() {
		//Start about state
		Tools.startState("About");
	}
}