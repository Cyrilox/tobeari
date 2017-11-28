/**
 * GestureManager
 */
var GestureManager = (function () {
    function GestureManager(level, controller, map, gameManager, gameInterface, commandInterface) {
        this.level = level;
        this.controller = controller;
        this.map = map;
        this.gameManager = gameManager;
        this.gameInterface = gameInterface;
        this.commandInterface = commandInterface;
        //OnDown
        this.interfaceDowned = false;
        this.onDownPosition = null;
        this.onDownDone = false;
        this.onDownOnSelection = false;
        //OnDrag
        this.isDraggable = false; //True after a time buffer is reach when moving;
        this.isDragging = false; //True if isDraggable is true, and pointer moving;
        this.hasFirstDragged = false; //To trigger onDrag only 1 time;
        this.timerDragged = null;
        g.input.enabled = true;
        g.input.onDown.add(this.onDown, this);
        g.input.onUp.add(this.onUp, this);
        g.input.addMoveCallback(this.onMove, this);
    }
    //*** Chronological Order ***
    //First onDown when dragging, 1 time
    GestureManager.prototype.onDown = function () {
        if (!this.gameManager.isPaused) {
            this.isDraggable = false;
            this.isDragging = false;
            this.hasFirstDragged = false;
            this.onDownPosition = g.input.activePointer.position.clone();
            this.onDownOnSelection = this.level.selection != null && this.level.selection.getHitarea() != null && Tools.isPointInPolygon(this.onDownPosition, this.level.selection.getHitarea());
            //Pointer on top of any interface elements
            this.interfaceDowned = this.gameInterface.isPointerOver(this.onDownPosition) || this.commandInterface.isPointerOver(this.onDownPosition);
            this.onDownDone = true;
        }
    };
    //On move event, pointer is moving, many times
    GestureManager.prototype.onMove = function () {
        //Si le pointeur est appuyé
        if (!this.gameManager.isPaused && g.input.activePointer.isDown) {
            // et depuis un temps minimum
            if (this.timerDragged == null && !this.hasFirstDragged)
                this.timerDragged = g.time.events.add(300, this.onPointerDraggable, this);
            if (this.isDraggable && !this.hasFirstDragged)
                this.onFirstDrag(); // c'est un glissé
        }
    };
    //Triggered when the pointer has been moved a minimum of timer
    GestureManager.prototype.onPointerDraggable = function () {
        if (!this.gameManager.isPaused) {
            this.timerDragged = null;
            this.isDraggable = true;
        }
    };
    //On drag event, 1 time
    GestureManager.prototype.onFirstDrag = function () {
        if (!this.gameManager.isPaused) {
            this.hasFirstDragged = true;
            this.isDragging = true;
            //Cell unselect, if not on interface
            if (!this.interfaceDowned && this.level.selection instanceof Cell)
                (this.level.selection).setSelected(false);
        }
    };
    //On up event, 1 time
    GestureManager.prototype.onUp = function () {
        if (!this.gameManager.isPaused) {
            //Clear dragging timer
            if (this.timerDragged != null) {
                this.timerDragged.timer.remove(this.timerDragged);
                this.timerDragged = null;
            }
            //Up after a drag ending
            if (this.isDragging) {
                this.isDraggable = false;
                this.isDragging = false;
                this.hasFirstDragged = false;
                this.controller.dragEnded = true;
            }
            else {
                this.controller.dragEnded = false;
                //Cell selection at the first ondown position, if not on interface
                if (!this.interfaceDowned && this.onDownPosition != null)
                    this.controller.select(this.map.setSelectedCellOn(this.onDownPosition));
            }
            //On down reset
            this.onDownDone = false;
            //Interface
            this.interfaceDowned = false;
        }
    };
    return GestureManager;
}());
