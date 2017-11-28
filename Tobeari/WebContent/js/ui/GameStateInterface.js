var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The game state interface showing the game state.
 */
var INFOS;
(function (INFOS) {
    INFOS[INFOS["SEEDS"] = 0] = "SEEDS";
    INFOS[INFOS["ENERGY"] = 1] = "ENERGY";
    INFOS[INFOS["HUNGER"] = 2] = "HUNGER";
    INFOS[INFOS["HYDRATION"] = 3] = "HYDRATION";
    INFOS[INFOS["HEALTH"] = 4] = "HEALTH";
    INFOS[INFOS["SCORE"] = 5] = "SCORE";
})(INFOS || (INFOS = {}));
var GameStateInterface = (function (_super) {
    __extends(GameStateInterface, _super);
    function GameStateInterface(level, gameManager, predator) {
        _super.call(this);
        this.level = level;
        //Position & style of text element
        this.y = g.world.height - GraphicInterface.spacing;
        var size = GraphicInterface.sizeOfHeight(5);
        this.style = { font: "bold " + size + "px Arial", fill: "#2b6dcc" };
        //Informations
        var infosLength = 6; //! Dure
        //Text elements
        this.texts = [];
        for (var state = 0; state < infosLength; state++)
            this.texts[state] = this.addText();
        //Information elements
        this.informations = [];
        this.informations[INFOS["SCORE"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["score"], false, this.texts[INFOS["SCORE"]]);
        this.informations[INFOS["HEALTH"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["health"], true, this.texts[INFOS["HEALTH"]]);
        this.informations[INFOS["HYDRATION"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["hydration"], true, this.texts[INFOS["HYDRATION"]]);
        this.informations[INFOS["HUNGER"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["hunger"], true, this.texts[INFOS["HUNGER"]]);
        this.informations[INFOS["ENERGY"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["energy"], true, this.texts[INFOS["ENERGY"]]);
        this.informations[INFOS["SEEDS"]] = new GameStateInformation(level, this.elements, strings["gamestateinterface"]["seeds"], false, this.texts[INFOS["SEEDS"]]);
        //Init
        this.init(gameManager, predator);
    }
    //Update the interface
    GameStateInterface.prototype.init = function (gameManager, predator) {
        this.set(INFOS["SCORE"], gameManager.score);
        //Refresh sizes with maximum sizes
        for (var i = 0; i < this.informations.length; i++) {
            this.set(i, 10);
            this.informations[i].refresh();
        }
        //The set real ones
        this.set(INFOS["SCORE"], gameManager.score);
        this.set(INFOS["HEALTH"], predator.health);
        this.set(INFOS["HYDRATION"], predator.hydration);
        this.set(INFOS["HUNGER"], predator.hunger);
        this.set(INFOS["ENERGY"], predator.energy);
        this.set(INFOS["SEEDS"], predator.seeds);
    };
    /**
     * Update an information and show the variation
     */
    GameStateInterface.prototype.update = function (info, newValue, variation) {
        //Affichage
        this.set(info, newValue);
        //Variation flottante
        this.informations[info].changeVariation(variation);
    };
    /**
     * Create, add and return a text positionned from bottom to top
     */
    GameStateInterface.prototype.addText = function (value) {
        if (value === void 0) { value = ""; }
        if (this.texts.length > 0)
            this.y -= this.texts[this.texts.length - 1].height;
        var text = g.add.text(GraphicInterface.spacing, this.y, value, this.style);
        text.anchor.setTo(0, 1);
        this.elements.add(text);
        return text;
    };
    /**
     * Set the information value
     */
    GameStateInterface.prototype.set = function (info, newValue) {
        var newValueStr = String(newValue);
        var information = this.informations[info];
        this.texts[info].text = information.textValue + newValueStr + (information.percent ? strings["gamestateinterface"]["percent"] : "");
    };
    GameStateInterface.INFOS = INFOS;
    return GameStateInterface;
}(GraphicInterface));
