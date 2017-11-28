/**
 * About state.
 */
function About() {
	Phaser.State.call(this);

	this.create = function() {
		this.x = GraphicInterface.spacing;
		this.y = GraphicInterface.spacing;
		
		//Button
		this.butBack = g.add.button(this.x, this.y, "button_back", this.back);

		//Title
		this.titleStyle = { font: "bold 40px Arial", fill: "#471c07" };
		this.title = g.add.text(g.world.centerX, GraphicInterface.spacing, config.about.title_text, this.titleStyle);
		this.title.anchor.setTo(0.5, 0.0);
		
		//Description
		var descriptionY = this.title.y + this.title.height + GraphicInterface.spacing;
		this.descriptionStyle = { font: "bold 18px Arial", fill: "#000000" };
		this.description = g.add.text(g.world.centerX, descriptionY, config.about.description_text, this.descriptionStyle);
		this.description.anchor.setTo(0.5, 0.0);
		
		//Version
		var versionTextStyle = { font: "bold 15px Arial", fill: "#000000" };
		this.versionText = g.add.text(g.world.width - GraphicInterface.spacing, g.world.height - GraphicInterface.spacing, config.about.version_text, versionTextStyle);
		this.versionText.anchor.setTo(1.0, 1.0);
	};

	this.back = function() {
		//Start menu state
		sounds.menuSelection.play();
		g.state.start("Menu");
	};
}