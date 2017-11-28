/**
 * GestureManager
 */
class GestureManager {
    //OnDown
	public interfaceDowned: boolean = false;
	public onDownPosition: Phaser.Point = null;
	public onDownDone: boolean = false;
	public onDownOnSelection: boolean = false;

	//OnDrag
	private isDraggable: boolean = false;//True after a time buffer is reach when moving;
	public isDragging: boolean = false;//True if isDraggable is true, and pointer moving;
	private hasFirstDragged: boolean = false;//To trigger onDrag only 1 time;
	private timerDragged: Phaser.TimerEvent = null;

    constructor(private level: Level, private controller: Controller, private map: Map, private gameManager: GameManager, private gameInterface: GameInterface, private commandInterface: CommandInterface) {		
		g.input.enabled = true;
		g.input.onDown.add(this.onDown, this);
		g.input.onUp.add(this.onUp, this);
		g.input.addMoveCallback(this.onMove, this);
    }
	
	//*** Chronological Order ***
	
	//First onDown when dragging, 1 time
	private onDown() {
		if(!this.gameManager.isPaused){
			this.isDraggable = false;
			this.isDragging = false;
			this.hasFirstDragged = false;
			this.onDownPosition = g.input.activePointer.position.clone();
			this.onDownOnSelection = this.level.selection != null && this.level.selection.getHitarea() != null && Tools.isPointInPolygon(this.onDownPosition, this.level.selection.getHitarea());
			//Pointer on top of any interface elements
			this.interfaceDowned = this.gameInterface.isPointerOver(this.onDownPosition) || this.commandInterface.isPointerOver(this.onDownPosition);
			this.onDownDone = true;
		}
	}
	
	//On move event, pointer is moving, many times
	private onMove() {
		//Si le pointeur est appuyé
		if(!this.gameManager.isPaused && g.input.activePointer.isDown) {
			// et depuis un temps minimum
			if(this.timerDragged == null && !this.hasFirstDragged)
				this.timerDragged = g.time.events.add(300, this.onPointerDraggable, this);
			if(this.isDraggable && !this.hasFirstDragged)
				this.onFirstDrag();// c'est un glissé
		}
	}
	
	//Triggered when the pointer has been moved a minimum of timer
	private onPointerDraggable() {
		if(!this.gameManager.isPaused){
			this.timerDragged = null;
			this.isDraggable = true;
		}
	}
	
	//On drag event, 1 time
	private onFirstDrag() {
		if(!this.gameManager.isPaused){
			this.hasFirstDragged = true;
			this.isDragging = true;
			
			//Cell unselect, if not on interface
			if(!this.interfaceDowned && this.level.selection instanceof Cell)
				(<Cell>(this.level.selection)).setSelected(false);
		}
	}
	
	//On up event, 1 time
	private onUp() {
		if(!this.gameManager.isPaused){
			//Clear dragging timer
			if(this.timerDragged != null) {
				this.timerDragged.timer.remove(this.timerDragged);
				this.timerDragged = null;
			}
			//Up after a drag ending
			if(this.isDragging) {
				this.isDraggable = false;
				this.isDragging = false;
				this.hasFirstDragged = false;
				this.controller.dragEnded = true;
			}else{//Up after a click
				this.controller.dragEnded = false;

				//Cell selection at the first ondown position, if not on interface
				if(!this.interfaceDowned && this.onDownPosition != null)
					this.controller.select(this.map.setSelectedCellOn(this.onDownPosition));
			}
			//On down reset
			this.onDownDone = false;
			//Interface
			this.interfaceDowned = false;
		}
	}
}