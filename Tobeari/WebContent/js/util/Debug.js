/**
 * A debug frame.
 */
var Debug = (function () {
    function Debug() {
        this.xposition = GraphicInterface.sizeOfWidth(15);
        this.ymargin = GraphicInterface.sizeOfHeight(5);
        this.yspacing = GraphicInterface.spacing;
        this.texts = [];
        this.font = "bold " + GraphicInterface.sizeOfHeight(5) + "px Arial";
    }
    Debug.prototype.clear = function () {
        this.texts = [];
    };
    Debug.prototype.addText = function (title, content) {
        this.texts.push([title, content]);
    };
    Debug.prototype.show = function () {
        var text;
        for (var i in this.texts) {
            text = this.texts[i][0] + ": " + this.texts[i][1];
            g.debug.text(text, this.xposition, this.ymargin + (Number(i) * this.yspacing), "#FFFFFF", this.font);
        }
    };
    return Debug;
}());
