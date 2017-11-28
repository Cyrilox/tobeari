/**
 * Scores state.
 */
function Scores() {
	Phaser.State.call(this);

	this.create = function() {
		this.x = GraphicInterface.spacing;
		this.y = GraphicInterface.spacing;
		
		//Button
		this.butBack = g.add.button(this.x, this.y, "button_back", this.back);

		//Title
		this.titleStyle = { font: "bold 40px Arial", fill: "#471c07", align: "center" };
		this.title = g.add.text(g.world.centerX, GraphicInterface.spacing, config.scores.title_text, this.titleStyle);
		this.title.anchor.setTo(0.5, 0.0);
		
		//Scores array
		var tabHeadStyle = { font: "bold 18px Arial", fill: "#000000", align: "left", tabs: [ 90, 80, 100 ] };
		var tabHeadings = config.scores.tab_headings;
		var tabHeadingY = this.title.y + this.title.height + GraphicInterface.spacing;
		var tabHeading = g.add.text(g.world.centerX - 25, tabHeadingY, '', tabHeadStyle);
		tabHeading.anchor.setTo(0.5, 0.0);
		tabHeading.parseList(tabHeadings);

		var tabLinesStyle = { font: "16px Arial", fill: "#000000", align: "center", tabs: [ 80, 80, 70 ] };
		var tabLinesY = tabHeadingY + tabHeading.height + 10;
		var tabLines = g.add.text(g.world.centerX, tabLinesY, config.scores.tab_list_empty, tabLinesStyle);
		tabLines.anchor.setTo(0.5, 0.0);
		if(scoresDatas.all.length > 0)
			tabLines.parseList(scoresDatas.getTop(10));
		
		//Reset
		this.butBack = g.add.button(g.world.width - GraphicInterface.spacing, GraphicInterface.spacing, "button_reset", this.resetAll);
		this.butBack.anchor.setTo(1, 0);
	};

	this.back = function() {
		//Start menu state
		sounds.menuSelection.play();
		g.state.start("Menu");
	};

	this.resetAll = function() {
		//Reset scores
		sounds.menuSelection.play();
		scoresDatas.reset();
		g.state.start("Scores");
	};
}