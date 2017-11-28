var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The command interface.
 */
var CommandInterface = (function (_super) {
    __extends(CommandInterface, _super);
    function CommandInterface(level, controller, gameManager, predator) {
        _super.call(this);
        this.level = level;
        this.controller = controller;
        this.gameManager = gameManager;
        this.predator = predator;
        //Paramètres
        this.oncooldown = false;
        var height = 21;
        this.x = g.world.width - GraphicInterface.spacing;
        this.y = GraphicInterface.spacing;
        //Créations
        this.swallowBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_swallow', 1, 0, height, this.swallow, this, false);
        this.plantBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_plant', 1, 0, height, this.plant, this, false);
        this.wateringBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_watering', 1, 0, height, this.watering, this, false);
        this.buttons = [this.swallowBut, this.plantBut, this.wateringBut];
    }
    //Update
    CommandInterface.prototype.update = function () {
        var sel = this.level.selection, predator = this.predator;
        var swallowable = false, waterable = false, plantable = false;
        //Si on peut utiliser une aptitude
        if (!this.oncooldown) {
            if (this.gameManager.playing && sel != null) {
                if (sel instanceof Waterpoint && !predator.drinking && predator.canGrab())
                    swallowable = true;
                else if (sel instanceof Prey && sel.isAlive() && predator.canGrab())
                    swallowable = true;
                else if (sel instanceof Plant) {
                    if (sel.rank > Plant.RANK["WATERED"] && predator.canGrab())
                        swallowable = true;
                    if (sel.rank == Plant.RANK["SEED"] && predator.canWater())
                        waterable = true;
                }
            }
            plantable = predator.canPlant();
        }
        //Avale une cible à portée si c'est une proie vivante ou une plante de rang 1 et +
        this.swallowBut.setClickable(swallowable);
        //Planter si suffisament de graines et vivant
        this.plantBut.setClickable(plantable);
        //Arrose une plante rang 0
        this.wateringBut.setClickable(waterable);
    };
    //Order swallow to controller
    CommandInterface.prototype.swallow = function () {
        this.controller.swallow();
    };
    //Order plant to controller
    CommandInterface.prototype.plant = function () {
        this.controller.plant();
    };
    //Order watering to controller
    CommandInterface.prototype.watering = function () {
        this.controller.watering();
    };
    return CommandInterface;
}(GraphicInterface));
