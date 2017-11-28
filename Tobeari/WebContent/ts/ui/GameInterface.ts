/**
 * The game interface.
 */
class GameInterface extends GraphicInterface {
	private menuBut: Button;
	private restartBut: Button;

	private restartOptionDialog: OptionDialog;
	private quitOptionDialog: OptionDialog;

	public elementsDialogs: Phaser.Group;
	
	constructor(private level: Level, private gameManager: GameManager) {
		super();
		
		this.x = GraphicInterface.spacing;
		this.y = GraphicInterface.spacing;
		
		//Boutons
		this.menuBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_menu', 0, 0, 14, this.quitLevelDialog, this);
		this.restartBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_restart', 0, 0, 14, this.restartLevelDialog, this);
		
		//Verification dialogs
		this.quitOptionDialog = new OptionDialog(level, gameManager, strings["gameinterface"]["dialog_quit"], this.quitLevel, function(){}, this);
		this.restartOptionDialog = new OptionDialog(level, gameManager, strings["gameinterface"]["dialog_restart"], this.restartLevel, function(){}, this);
		
		this.elementsDialogs = g.add.group();
		let elementsDialogsTab = this.restartOptionDialog.elements.concat(this.quitOptionDialog.elements);
		for(let i in elementsDialogsTab)
			this.elementsDialogs.add(elementsDialogsTab[i]);
	}

	//Restart level dialog
	private quitLevelDialog() {
		if(this.gameManager.playing)
			this.quitOptionDialog.show();
		else
			this.level.quit();
	}
	
	//Restart level dialog
	private restartLevelDialog() {
		if(this.gameManager.playing)
			this.restartOptionDialog.show();
		else
			this.level.restart();
	}

	private quitLevel() {
		this.level.quit();
	}

	private restartLevel() {
		this.level.restart();
	}
}