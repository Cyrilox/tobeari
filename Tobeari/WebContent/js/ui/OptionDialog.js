/**
 * A question dialog, pausing and resuming the game.
 */
var OptionDialog = (function () {
    function OptionDialog(level, gameManager, message, callbackYes, callbackNo, context) {
        this.level = level;
        this.gameManager = gameManager;
        this.callbackYes = callbackYes;
        this.callbackNo = callbackNo;
        this.context = context;
        //Transparent gray background    
        this.background = g.add.graphics(0, 0);
        this.background.beginFill(0x000000, 0.7);
        this.background.drawRect(0, 0, g.world.width, g.world.height);
        this.background.inputEnabled = true;
        //Message
        var messageFontSize = GraphicInterface.sizeOfHeight(15);
        var messageStyle = { font: "bold " + messageFontSize + "px Arial", fill: "#f2f2f2" };
        this.message = g.add.text(g.world.centerX, g.world.centerY - GraphicInterface.spacing, message, messageStyle);
        this.message.anchor.setTo(0.5, 1.0);
        GraphicInterface.scaleByHeight(this.message, 15);
        //Choices
        this.choiceYes = new Button(Button.TYPE["IMAGE"], "button_yes", g.world.centerX - GraphicInterface.spacing / 2, g.world.centerY, 18, this.yes, this);
        this.choiceYes.setAnchor(1, 0);
        this.choiceNo = new Button(Button.TYPE["IMAGE"], "button_no", g.world.centerX + GraphicInterface.spacing / 2, g.world.centerY, 18, this.no, this);
        this.choiceNo.setAnchor(0, 0);
        //Elements
        this.elements = [this.background, this.message, this.choiceYes.group, this.choiceNo.group];
        //Hidden
        this.hide();
    }
    //Hide the dialog
    OptionDialog.prototype.hide = function () {
        //Resume the game level
        this.gameManager.isPaused = false;
        //Visibility
        this.elements.forEach(function (element) {
            element.visible = false;
        }, this);
    };
    //Show the dialog
    OptionDialog.prototype.show = function () {
        //Pause the game level
        this.gameManager.isPaused = true;
        //Visibility
        this.elements.forEach(function (element) {
            element.visible = true;
        }, this);
        //Display order
        this.level.refreshDisplayOrder();
    };
    //Yes response
    OptionDialog.prototype.yes = function () {
        this.hide();
        if (this.callbackYes != null)
            this.callbackYes.apply(this.context);
    };
    //No response
    OptionDialog.prototype.no = function () {
        this.hide();
        if (this.callbackNo != null)
            this.callbackNo.apply(this.context);
    };
    return OptionDialog;
}());
