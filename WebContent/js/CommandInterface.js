/*
 * The command interface.
 * @class CommandInterface
 * @contructor
 */
function CommandInterface(level){
	GraphicInterface.call(this);

	//Update
	this.update = function(){
		var sel = this.level.selection, predator = this.level.predator;
		var swallowable = false, waterable = false, plantable = false;
		
		//Si on peut utiliser une aptitude
		if(!this.oncooldown){
			if(this.level.gameState.playing && sel != null && this.level.inrange){
				if(sel instanceof Oasis && !predator.drinking)
					swallowable = true;
				else if(sel instanceof Prey && sel.alive)
					swallowable = true;
				else if(sel instanceof Plant){
					if(sel.rank > 1)
						swallowable = true;
					if(sel.rank == 0 && predator.canWater())
						waterable = true;
				}
			}
			plantable = predator.canPlant();
		}

		//Avale une cible à portée si c'est une proie vivante ou une plante de rang 1 et +
		GraphicInterface.setButtonClickable(this.swallowBut, swallowable);
		
		//Planter si suffisament de graines et vivant
		GraphicInterface.setButtonClickable(this.plantBut, plantable);
		
		//Arrose une plante rang 0
		GraphicInterface.setButtonClickable(this.wateringBut, waterable);
	};
	
	//Order swallow to controller
	this.swallow = function() {
		this.level.controller.swallow();
	};
	
	//Order plant to controller
	this.plant = function() {
		this.level.controller.plant();
	};
	
	//Order watering to controller
	this.watering = function() {
		this.level.controller.watering();
	};
	
	this.level = level;
	
	this.oncooldown = false;
	this.buttonWidth = 85;
	this.buttonHeight = 85;
	this.x = g.world.width - this.spacing - this.buttonWidth;
	this.y = this.spacing;
	
	this.swallowBut = this.addAlignedButton('button_swallow', this.swallow);
	this.plantBut = this.addAlignedButton('button_plant', this.plant);
	this.wateringBut = this.addAlignedButton('button_watering', this.watering);
	this.buttons = [this.swallowBut, this.plantBut, this.wateringBut];
	
	this.buttonWidth = this.swallowBut.width;
	this.buttonHeight = this.swallowBut.height;
}