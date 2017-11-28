/*
 * A question dialog, pausing and resuming the game.
 * @class OptionDialog
 * @contructor
 */
function OptionDialog(level, message, callbackYes, callbackNo){

	//Hide the dialog
	this.hide = function() {
		//Resume the game level
		this.level.paused = false;
		
		this.background.visible = false;
		this.message.visible = false;
		this.choiceYes.visible = false;		
		this.choiceNo.visible = false;
	};
	
	//Show the dialog
	this.show = function() {
		//Pause the game level
		this.level.paused = true;
		
		this.background.visible = true;
		this.message.visible = true;
		this.choiceYes.visible = true;		
		this.choiceNo.visible = true;
	};
	
	//Yes response
	this.yes = function() {
		sounds.menuSelection.play();
		this.hide();
		if(callbackYes !=  null)
			callbackYes.call();
	};
	
	//No response
	this.no = function() {
		sounds.menuSelection.play();
		this.hide();
		if(callbackNo !=  null)
			callbackNo.call();
	};
	
	//Callbacks
	this.level = level;
	this.callbackYes = callbackYes;
	this.callbackNo = callbackNo;
	
	//Transparent gray background    
    this.background = g.add.graphics(0, 0);
	this.background.beginFill(0x000000, 0.7);
	this.background.drawRect(0, 0, g.world.width, g.world.height);
	this.background.inputEnabled = true;
	
	//Message
	this.messageStyle = { font: "bold 45px Arial", fill: "#f2f2f2" };
	this.message = g.add.text(g.world.centerX, g.world.centerY - GraphicInterface.spacing, message, this.messageStyle);
	this.message.anchor.setTo(0.5, 1.0);
	
	//Choices
	this.choiceYes = g.add.button(g.world.centerX - GraphicInterface.spacing/2, g.world.centerY, "button_yes", this.yes, this);
	this.choiceYes.anchor.setTo(1.0, 0.0);
	this.choiceNo = g.add.button(g.world.centerX + GraphicInterface.spacing/2, g.world.centerY, "button_no", this.no, this);
	this.choiceNo.anchor.setTo(0.0, 0.0);
	
	//Elements
	this.elements = [this.background, this.message, this.choiceYes, this.choiceNo];
	
	//Hidden
	this.hide();
}