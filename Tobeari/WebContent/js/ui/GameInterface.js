var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The game interface.
 */
var GameInterface = (function (_super) {
    __extends(GameInterface, _super);
    function GameInterface(level, gameManager) {
        _super.call(this);
        this.level = level;
        this.gameManager = gameManager;
        this.x = GraphicInterface.spacing;
        this.y = GraphicInterface.spacing;
        //Boutons
        this.menuBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_menu', 0, 0, 14, this.quitLevelDialog, this);
        this.restartBut = this.addAlignedButton(Button.TYPE["IMAGE"], 'button_restart', 0, 0, 14, this.restartLevelDialog, this);
        //Verification dialogs
        this.quitOptionDialog = new OptionDialog(level, gameManager, strings["gameinterface"]["dialog_quit"], this.quitLevel, function () { }, this);
        this.restartOptionDialog = new OptionDialog(level, gameManager, strings["gameinterface"]["dialog_restart"], this.restartLevel, function () { }, this);
        this.elementsDialogs = g.add.group();
        var elementsDialogsTab = this.restartOptionDialog.elements.concat(this.quitOptionDialog.elements);
        for (var i in elementsDialogsTab)
            this.elementsDialogs.add(elementsDialogsTab[i]);
    }
    //Restart level dialog
    GameInterface.prototype.quitLevelDialog = function () {
        if (this.gameManager.playing)
            this.quitOptionDialog.show();
        else
            this.level.quit();
    };
    //Restart level dialog
    GameInterface.prototype.restartLevelDialog = function () {
        if (this.gameManager.playing)
            this.restartOptionDialog.show();
        else
            this.level.restart();
    };
    GameInterface.prototype.quitLevel = function () {
        this.level.quit();
    };
    GameInterface.prototype.restartLevel = function () {
        this.level.restart();
    };
    return GameInterface;
}(GraphicInterface));
