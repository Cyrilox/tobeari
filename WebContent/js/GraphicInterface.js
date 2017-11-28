/*
 * An abstract class for interfaces.
 * @class GraphicInterface
 * @contructor
 */
function GraphicInterface(){
	
	GraphicInterface.spacing = 20;
	this.spacing = GraphicInterface.spacing;
	this.elements = g.add.group();
	this.elementsRectangle = [];
	this.firstButton = true;
	this.buttonWidth = 50;
	this.buttonHeight = 50;
	this.x = 0;
	this.y = 0;
	this.lastButtonWidth = 0;
	this.lastButtonHeight = 0;

	//Add button aligned
	this.addAlignedButton = function(sprite, callback){
		if(!this.firstButton)
			this.y += this.spacing + this.lastButtonHeight;
		else
			this.firstButton = false;
		
		return this.addButton(this.x, this.y, sprite, callback);
	};
	
	//Add a button with over detection
	this.addButton = function(x, y, sprite, callback) {
		var button = g.add.button(x, y, sprite, callback, this);
		button.inputEnabled = true;
		this.elements.add(button);
		
		var rectangle = new Phaser.Rectangle(x, y, button.width, button.height);
		this.elementsRectangle.push(rectangle);
		
		this.lastButtonWidth = button.width;
		this.lastButtonHeight = button.height;
		
		return button;
	};
	
	/**
	 * Pointeur actif au dessus de l'interface
	 */
	this.isPointerOver = function() {
		for(var i in this.elementsRectangle)
			if(Tools.pointInRectangle(g.input.activePointer, this.elementsRectangle[i]))
				return true;
		
		return false;
	};
}

//Switch a button usability
GraphicInterface.setButtonClickable = function(button, clickable){
	button.buttonMode = clickable;
	button.frame = clickable ? 0 : 1;
};