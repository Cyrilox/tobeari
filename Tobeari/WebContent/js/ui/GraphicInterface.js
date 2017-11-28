/**
 * An abstract class for interfaces.
 */
var GraphicInterface = (function () {
    function GraphicInterface() {
        this.x = 0;
        this.y = 0;
        this.elementsRectangle = [];
        this.firstButton = true;
        this.lastButtonHeight = 0;
        this.elements = g.add.group();
    }
    /**
     * Point au dessus de l'interface
     */
    GraphicInterface.prototype.isPointerOver = function (point) {
        for (var i in this.elementsRectangle)
            if (Tools.isPointInPolygon(point, this.elementsRectangle[i]))
                return true;
        return false;
    };
    //Add button aligned vertically, top to bottom
    GraphicInterface.prototype.addAlignedButton = function (type, sprite, anchorX, anchorY, heigth, callback, context, imageFromAtlas) {
        if (imageFromAtlas === void 0) { imageFromAtlas = true; }
        if (!this.firstButton)
            this.y += GraphicInterface.spacing + this.lastButtonHeight;
        else
            this.firstButton = false;
        var button = this.addButton(type, this.x, this.y, anchorX, anchorY, heigth, sprite, callback, context, imageFromAtlas);
        this.lastButtonHeight = button.height;
        return button;
    };
    //Add a button with over detection
    GraphicInterface.prototype.addButton = function (type, x, y, anchorX, anchorY, height, sprite, callback, context, imageFromAtlas) {
        if (imageFromAtlas === void 0) { imageFromAtlas = true; }
        var button = new Button(type, sprite, x, y, height, callback, context, imageFromAtlas);
        button.setAnchor(anchorX, anchorY);
        this.elements.add(button.group);
        var rectX, rectY;
        rectX = button.x - button.width * anchorX;
        rectY = button.y - button.height * anchorY;
        this.elementsRectangle.push(new Phaser.Rectangle(rectX, rectY, button.width, button.height));
        return button;
    };
    //*** Statics ***
    GraphicInterface.init = function () {
        GraphicInterface.spacing = GraphicInterface.sizeOfHeight(GraphicInterface.spacingPercentage);
    };
    /**
     * Return the pixel amount for width of a given percentage
     */
    GraphicInterface.sizeOfWidth = function (percent) {
        return Math.round(g.world.width * percent / 100);
    };
    /**
     * Return the pixel amount for height of a given percentage
     */
    GraphicInterface.sizeOfHeight = function (percent) {
        return Math.round(g.world.height * percent / 100);
    };
    /**
     * Scale the Sprite|Text|Button to a height of the screen percentage, keeping proprotion
     */
    GraphicInterface.scaleByHeight = function (graphic, percent) {
        var newHeight = GraphicInterface.sizeOfHeight(percent);
        var newWidth = Math.round(graphic.width * newHeight / graphic.height);
        graphic.width = newWidth;
        graphic.height = newHeight;
    };
    /**
     * Scale the Sprite|Text to a width of the screen percentage, keeping proprotion
     */
    GraphicInterface.scaleByWidth = function (graphic, percent) {
        var newWidth = GraphicInterface.sizeOfWidth(percent);
        var newHeight = Math.round(graphic.height * newWidth / graphic.width);
        graphic.width = newWidth;
        graphic.height = newHeight;
    };
    /**
     * Scale the Sprite|Text|Button to a height of the given number in pixel, keeping proprotion
     */
    GraphicInterface.scaleByHeightWithSize = function (graphic, height) {
        var newWidth = Math.round(graphic.width * height / graphic.height);
        graphic.width = newWidth;
        graphic.height = height;
    };
    GraphicInterface.spacing = 30; //Pixels
    GraphicInterface.spacingPercentage = 5; //Percentage
    return GraphicInterface;
}());
