/*
 * The oasis.
 * @class Oasis
 * @contructor
 */
function Oasis(controller){

	//Move and orientate the oasis
	this.move = function(position, orientation){
		this.sprite.position.setTo(position.x, position.y);
		this.sprite.rotation = orientation;
		
		var palmtreeOrientation, palmtreePosition;
		palmtreeOrientation = Tools.getRandomRadianAngle();
		palmtreePosition = Tools.getTrigPosition(position, this.palmTreeRadius, orientation - this.palmTreeAngle);
		this.palmtree.position.setTo(palmtreePosition.x, palmtreePosition.y);
		this.palmtree.rotation = palmtreeOrientation;
	};
	
	this.sprite = g.add.sprite(g.world.centerX, g.world.centerY, 'waterhole');
	this.sprite.anchor.setTo(0.5, 0.5);
	g.physics.enable(this.sprite, Phaser.Physics.ARCADE);

	this.palmtree = g.add.sprite(g.world.centerX, g.world.centerY, 'palmtree');
	this.palmtree.anchor.setTo(0.5, 0.5);
	
	this.palmTreeRadius = 87;
	this.palmTreeAngle = 0.84;
	
	//Cursor
	this.cursorRadius = Math.sqrt(this.sprite.width * this.sprite.width + this.sprite.height * this.sprite.height);
	
	//Events
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputUp.add(function(){
		controller.select(this);
		}, this);
}