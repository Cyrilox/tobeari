/**
 * About state.
 */
class About extends Phaser.State {

	create() {
		let x = GraphicInterface.spacing, y = GraphicInterface.spacing;
		
		//Button
		let backButton = new Button(Button.TYPE["IMAGE"], "button_back", x, y, 14, this.back, this);

		//Title
		let titleFontSize = GraphicInterface.sizeOfHeight(12);
		let titleStyle = { font: "bold "+titleFontSize+"px Arial", fill: "#471c07" };
		let title = g.add.text(g.world.centerX, GraphicInterface.spacing, strings["about"]["title_text"], titleStyle);
		title.anchor.setTo(0.5, 0.0);
		GraphicInterface.scaleByHeight(title, 12);
		
		//Description
		let descriptionY = title.y + title.height + GraphicInterface.spacing;
		let descriptionFontSize = GraphicInterface.sizeOfHeight(6);
		let descriptionWrapSize = GraphicInterface.sizeOfWidth(90);
		let descriptionStyle = { font: "bold "+descriptionFontSize+"px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: descriptionWrapSize };
		let description = g.add.text(g.world.centerX, descriptionY, strings["about"]["description_text"], descriptionStyle);
		description.anchor.setTo(0.5, 0.0);
		
		//Version
		let versionTextFontSize = GraphicInterface.sizeOfHeight(5);
		let versionTextStyle = { font: "bold "+versionTextFontSize+"px Arial", fill: "#000000" };
		let versionTextValue = strings["about"]["version_text"] + " " + conf["about"]["version_number"];
		let versionText = g.add.text(g.world.width - GraphicInterface.spacing, g.world.height - GraphicInterface.spacing, versionTextValue, versionTextStyle);
		versionText.anchor.setTo(1.0, 1.0);
	}

	private back() {
		//Start menu state
		Tools.startState("Menu");
	}
}