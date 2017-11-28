/*
 * The game interface.
 * @class GameInterface
 * @contructor
 */
function GameInterface(level, gameState){
	GraphicInterface.call(this);
	
	//Restart level dialog
	this.quitLevelDialog = function() {
		sounds.menuSelection.play();
		if(gameState.playing)
			this.quitOptionDialog.show();
		else
			this.level.quit();
	};
	
	//Restart level dialog
	this.restartLevelDialog = function() {
		sounds.menuSelection.play();
		if(gameState.playing)
			this.restartOptionDialog.show();
		else
			this.level.restart();
	};
	
	this.level = level;
	
	this.buttonWidth = 50;
	this.buttonHeight = 50;
	this.x = this.spacing;
	this.y = this.spacing;
	
	//Boutons
	this.menuBut = this.addAlignedButton('button_menu', this.quitLevelDialog);
	this.restartBut = this.addAlignedButton('button_restart', this.restartLevelDialog);
	
	//Verification dialogs
	this.restartOptionDialog = new OptionDialog(level, config.gameinterface.dialog_restart, function(){level.restart();}, null);
	this.quitOptionDialog = new OptionDialog(level, config.gameinterface.dialog_quit, function(){level.quit();}, null);
	
	this.elementsDialogs = g.add.group();
	var elementsDialogsTab = this.restartOptionDialog.elements.concat(this.quitOptionDialog.elements);
	for(var i in elementsDialogsTab)
		this.elementsDialogs.add(elementsDialogsTab[i]);
	
}