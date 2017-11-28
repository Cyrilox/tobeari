/*
 * The controller between Level and the views.
 * @class Controller
 * @contructor
 */
function Controller(level){
	
	/*
	 * Anti Drag - onInputUp triggering
	 * Should only be used in onInputUp handling
	 * Set level.isDragging to false
	 * Return true if there is no dragging before onInputUp
	 */
	this.isOnInputUpNoDrag = function() {
		if(this.dragEnded){
			this.dragEnded = false;
			return false;
		}else
			return true;
	};
	
	//Click on a thing
	this.select = function(selection) {
		if(this.isOnInputUpNoDrag()){//No if we dragged
			//Select
			this.level.select(selection);
			//Range
			this.level.updateOnrange();
			//Update the UI
			this.level.commandInterface.update();
		}
	};

	//Unselect a thing
	this.unselect = function(){
		if(this.isOnInputUpNoDrag()){//No if we dragged
			this.level.select(null);
			//Portée
			this.level.updateOnrange();
			//Interface
			this.level.commandInterface.update();
		}
	};

	//Swallow the selected thing
	this.swallow = function() {
		if(this.isOnInputUpNoDrag()){//No if we dragged
			if(this.level.selection != null && this.level.inrange)
				this.level.predator.eat(this.level.selection);//Predator eat the thing
		}
	};

	//Plant
	this.plant = function() {
		if(this.isOnInputUpNoDrag()){//No if we dragged
			if(this.level.predator.canPlant())
				this.level.predator.plant();//Predator planting
		}
	};

	//Watering
	this.watering = function() {
		if(this.isOnInputUpNoDrag()){//No if we dragged
			if(this.level.selection != null && this.level.inrange && this.level.selection instanceof Plant)
				this.level.predator.water();//Predator watering
		}
	};
	
	this.level = level;
	
	//game.onUp is triggered before other onInputUp, it's use to know if we onInputUp of a drag
	this.dragEnded = false;//this is turn to true when onUp thus drag is ended
}