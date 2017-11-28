var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The menu interface.
 */
var MenuInterface = (function (_super) {
    __extends(MenuInterface, _super);
    function MenuInterface() {
        _super.call(this);
        //Position
        this.x = g.world.centerX;
        this.y = g.world.centerY;
        //Game name
        var gameNameFontSize = GraphicInterface.sizeOfHeight(17);
        var gameNameStyle = { font: "bold " + gameNameFontSize + "px Arial", fill: "#471c07" };
        this.gameName = g.add.text(GraphicInterface.spacing, 0, strings["menuinterface"]["gamename"], gameNameStyle);
        this.gameName.anchor.setTo(0, 0);
        GraphicInterface.scaleByHeight(this.gameName, 17);
        //Image
        this.image = Tools.addSprite(0, g.world.height, "menu_image");
        this.image.anchor.setTo(0, 1.0);
        GraphicInterface.scaleByHeight(this.image, 83);
        //Boutons
        this.butPlay = new Button(Button.TYPE["TEXT"], String(strings["menuinterface"]["play"]), this.x, this.y, 22, this.play, this);
        this.butScores = new Button(Button.TYPE["TEXT"], String(strings["menuinterface"]["scores"]), this.x, this.y, 15, this.scores, this);
        this.butAbout = new Button(Button.TYPE["TEXT"], String(strings["menuinterface"]["about"]), this.x, this.y, 15, this.about, this);
        this.butPlay.setAnchor(0.5, 1);
        this.butScores.setAnchor(0.5, 0.5);
        this.butAbout.setAnchor(0.5, 0);
        this.butPlay.moveTo(null, this.butScores.y - GraphicInterface.spacing - this.butScores.height / 2);
        this.butAbout.moveTo(null, this.butScores.y + GraphicInterface.spacing + this.butScores.height / 2);
    }
    MenuInterface.prototype.play = function () {
        //Start level state
        Tools.startState("Level", true);
    };
    MenuInterface.prototype.scores = function () {
        //Start scores state
        Tools.startState("Scores");
    };
    MenuInterface.prototype.about = function () {
        //Start about state
        Tools.startState("About");
    };
    return MenuInterface;
}(GraphicInterface));
