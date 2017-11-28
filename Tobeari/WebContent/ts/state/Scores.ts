/**
 * Scores state.
 */
class Scores extends Phaser.State {

	create() {
		let x = GraphicInterface.spacing;
		let y = GraphicInterface.spacing;
		
		//Button
		let backButton = new Button(Button.TYPE["IMAGE"], "button_back", x, y, 14, this.back, this);

		//Title
		let titleFontSize = GraphicInterface.sizeOfHeight(12);
		let titleStyle = { font: "bold "+titleFontSize+"px Arial", fill: "#471c07", align: "center" }
		let title = g.add.text(g.world.centerX, GraphicInterface.spacing, strings["scores"]["title_text"], titleStyle);
		title.anchor.setTo(0.5, 0.0);
		GraphicInterface.scaleByHeight(title, 12);
		
		//Scores array
		let tabsWidth = GraphicInterface.sizeOfWidth(17);

		let tabHeadFontSize = GraphicInterface.sizeOfHeight(6);
		let tabHeadTabs = [tabsWidth*110/100, tabsWidth*115/100, tabsWidth*125/100];
		let tabHeadStyle = { font: "bold "+tabHeadFontSize+"px Arial", fill: "#000000", align: "left", tabs: tabHeadTabs }
		let tabHeadings = strings["scores"]["tab_headings"];
		let tabHeadingY = title.y + title.height + GraphicInterface.spacing;
		let tabHeading = g.add.text(g.world.centerX, tabHeadingY, '', tabHeadStyle);
		tabHeading.anchor.setTo(0.5, 0.0);
		tabHeading.parseList(tabHeadings);

		let tabLinesFontSize = GraphicInterface.sizeOfHeight(5);
		let tabLinesTabs = [tabsWidth*90/100, tabsWidth*105/100, tabsWidth*90/100];
		let tabLinesStyle = { font: tabLinesFontSize+"px Arial", fill: "#000000", align: "center", tabs: tabLinesTabs }
		let tabLinesY = tabHeadingY + tabHeading.height;
		let tabLines = g.add.text(g.world.centerX, tabLinesY, strings["scores"]["tab_list_empty"], tabLinesStyle);
		tabLines.anchor.setTo(0.5, 0.0);
		if(scoresDatas.all.length > 0)
			tabLines.parseList(scoresDatas.getTop(10));
		
		//Reset
		let butReset = new Button(Button.TYPE["TEXT"], String(strings["scores"]["reset"]), g.world.width - GraphicInterface.spacing, GraphicInterface.spacing, 14, this.resetAll, this);
		butReset.setAnchor(1, 0);
	}

	private back() {
		//Start menu state
		Tools.startState("Menu");
	}

	private resetAll() {
		//Reset scores
		scoresDatas.reset();
		Tools.startState("Scores");
	}
}