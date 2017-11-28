/**
 * A button with text or image.
 */
var TYPE;
(function (TYPE) {
    TYPE[TYPE["TEXT"] = 0] = "TEXT";
    TYPE[TYPE["IMAGE"] = 1] = "IMAGE";
})(TYPE || (TYPE = {}));
var Button = (function () {
    function Button(type, value, x, y, heigthPerc, callback, context, imageFromAtlas, fillColor) {
        if (imageFromAtlas === void 0) { imageFromAtlas = true; }
        if (fillColor === void 0) { fillColor = 0x3689ff; }
        this.type = type;
        this.x = x;
        this.y = y;
        this.callback = callback;
        this.context = context;
        this.imageFromAtlas = imageFromAtlas;
        this.anchorX = 0;
        this.anchorY = 0;
        this.clickable = true;
        //Sizes
        var lineWidth, elementHeight;
        lineWidth = GraphicInterface.sizeOfHeight(1);
        this.padding = lineWidth + GraphicInterface.sizeOfHeight(1);
        elementHeight = heigthPerc - 4;
        //Text
        if (type == Button.TYPE["TEXT"]) {
            var fontSize = GraphicInterface.sizeOfHeight(elementHeight);
            var style = { font: "bold " + fontSize + "px Arial", fill: "#000000" };
            this.text = g.add.text(this.padding, this.padding, value, style);
        }
        //Image
        if (type == Button.TYPE["IMAGE"])
            this.image = Tools.addSprite(this.padding, this.padding, value, imageFromAtlas);
        //Anchor and size
        this.element = (type == Button.TYPE["TEXT"]) ? this.text : this.image;
        GraphicInterface.scaleByHeight(this.element, elementHeight);
        //Button Size
        this.width = this.element.width + this.padding * 2;
        this.height = this.element.height + this.padding * 2;
        //Decoration graphics	
        this.roundedRectRadius = GraphicInterface.sizeOfHeight(4);
        var lineColor = 0xffe600;
        this.graphic = this.getGraphic(fillColor, lineWidth, lineColor);
        this.graphicGrey = this.getGraphic(0x808080, lineWidth, 0x000000);
        this.graphicGrey.visible = false;
        //Scale
        this.scale = new Phaser.Point(1, 1);
        this.scaleOnDown = new Phaser.Point(0.8, 0.8);
        //Inputs
        this.graphic.inputEnabled = true;
        this.graphic.events.onInputDown.add(this.onInputDown, this);
        this.graphic.events.onInputUp.add(this.onInputUp, this);
        //Group
        this.group = g.add.group();
        this.group.add(this.graphicGrey);
        this.group.add(this.graphic);
        this.group.add((type == Button.TYPE["TEXT"]) ? this.element : this.image);
        //Move
        this.moveTo(x, y);
    }
    /**
     * Return a Graphic for this button, at 0/0 position and current width and height
     */
    Button.prototype.getGraphic = function (fillColor, lineWidth, lineColor) {
        var graphic = g.add.graphics(0, 0);
        graphic.beginFill(fillColor);
        graphic.lineStyle(lineWidth, lineColor, 1);
        graphic.drawRoundedRect(0, 0, this.width, this.height, this.roundedRectRadius);
        return graphic;
    };
    //*** Position ***
    /**
     * Move the Button to match the given anchor
     */
    Button.prototype.setAnchor = function (anchorX, anchorY) {
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        this.moveTo(this.x, this.y);
    };
    /**
     * Move to a new position
     */
    Button.prototype.moveTo = function (x, y) {
        //Position
        if (x !== null) {
            this.x = x;
            this.xGroup = this.x - this.width * this.anchorX;
            this.group.x = this.xGroup;
        }
        if (y !== null) {
            this.y = y;
            this.yGroup = this.y - this.height * this.anchorY;
            this.group.y = this.yGroup;
        }
        //Scaled down position
        this.xGroupScaled = this.xGroup + (this.width - (this.width * this.scaleOnDown.x)) / 2;
        this.yGroupScaled = this.yGroup + (this.height - (this.height * this.scaleOnDown.y)) / 2;
    };
    //*** Inputs ***
    /**
     * Pointer is down on button, reduce scale of this one
     */
    Button.prototype.onInputDown = function () {
        if (this.clickable) {
            //Sound
            sounds.play("menu_selection");
            //Shrink
            this.group.scale = this.scaleOnDown;
            this.group.x = this.xGroupScaled;
            this.group.y = this.yGroupScaled;
        }
    };
    /**
     * Pointer is upped of button, reset scale of this one and callback
     */
    Button.prototype.onInputUp = function () {
        if (this.clickable) {
            //Develop
            this.group.scale = this.scale;
            this.group.x = this.xGroup;
            this.group.y = this.yGroup;
            //Callback
            this.callback.apply(this.context);
        }
    };
    //*** Statut ***
    Button.prototype.isClickable = function () {
        return this.clickable;
    };
    /**
     * Set the clickable statut, and show this one graphically
     */
    Button.prototype.setClickable = function (clickable) {
        this.clickable = clickable;
        if (this.type == Button.TYPE["IMAGE"] && !this.imageFromAtlas)
            this.image.frame = clickable ? 0 : 1;
        this.graphic.visible = clickable;
        this.graphicGrey.visible = !clickable;
    };
    Button.TYPE = TYPE;
    return Button;
}());
