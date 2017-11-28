/**
 * The controller between Level and the views.
 */
var Controller = (function () {
    function Controller(level) {
        this.level = level;
        //game.onUp is triggered before other onInputUp, it's use to know if we onInputUp of a drag
        this.dragEnded = false; //this is turn to true when onUp thus drag is ended
    }
    Controller.prototype.init = function (gameManager, growerManager, consumerManager, gameStateInterface) {
        this.gameManager = gameManager;
        this.growerManager = growerManager;
        this.consumerManager = consumerManager;
        this.gameStateInterface = gameStateInterface;
    };
    //*** Selection ***
    /**
     * Select a Cell or Entity
     */
    Controller.prototype.select = function (selection) {
        if (this.isOnInputUpNoDrag())
            this.level.select(selection);
    };
    /**
     * Unselect current selection
     */
    Controller.prototype.unselect = function () {
        if (this.isOnInputUpNoDrag())
            this.level.select(null);
    };
    //*** Gesture ***
    /*
     * Anti Drag - onInputUp triggering
     * Should only be used in onInputUp handling
     * Set level.isDragging to false
     * Return true if there is no dragging before onInputUp
     */
    Controller.prototype.isOnInputUpNoDrag = function () {
        if (this.dragEnded) {
            this.dragEnded = false;
            return false;
        }
        else
            return true;
    };
    //*** Ability ***
    //Swallow the selected thing
    Controller.prototype.swallow = function () {
        if (this.isOnInputUpNoDrag())
            if (this.level.selection != null)
                this.consumerManager.predator.eat(); //Predator eat the thing
    };
    //Plant
    Controller.prototype.plant = function () {
        if (this.isOnInputUpNoDrag())
            if (this.consumerManager.predator.canPlant())
                this.consumerManager.predator.plant(); //Predator planting
    };
    /**
     * Create a plant
     */
    Controller.prototype.createPlant = function (cell) {
        return this.growerManager.createPlant(cell);
    };
    //Watering
    Controller.prototype.watering = function () {
        if (this.isOnInputUpNoDrag())
            if (this.level.selection != null && this.level.selection instanceof Plant)
                this.consumerManager.predator.water(); //Predator watering
    };
    //*** Dispatch ***
    /**
     * Called when a Plant is born
     * Select this Plant if the selected Cell is on the Plant
     */
    Controller.prototype.plantIsBorn = function (plant) {
        var sel = this.level.selection;
        if (sel != null && sel instanceof Cell && (sel).containEntity(plant))
            this.level.select(plant);
    };
    /**
     * Called when a game state information has changed
     * Update the view
     */
    Controller.prototype.gameStateHasChanged = function (info, newValue, variation) {
        this.gameStateInterface.update(info, newValue, variation);
    };
    /**
     * Called when an Entity is dead
     * Unselect this one if it was selected
     * End game if it was the Predator
     */
    Controller.prototype.entityHasDied = function (entity) {
        if (this.level.selection == entity)
            this.select(null);
        if (entity instanceof Predator)
            this.gameManager.end();
    };
    return Controller;
}());
