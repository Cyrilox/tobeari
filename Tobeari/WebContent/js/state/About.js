var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * About state.
 */
var About = (function (_super) {
    __extends(About, _super);
    function About() {
        _super.apply(this, arguments);
    }
    About.prototype.create = function () {
        var x = GraphicInterface.spacing, y = GraphicInterface.spacing;
        //Button
        var backButton = new Button(Button.TYPE["IMAGE"], "button_back", x, y, 14, this.back, this);
        //Title
        var titleFontSize = GraphicInterface.sizeOfHeight(12);
        var titleStyle = { font: "bold " + titleFontSize + "px Arial", fill: "#471c07" };
        var title = g.add.text(g.world.centerX, GraphicInterface.spacing, strings["about"]["title_text"], titleStyle);
        title.anchor.setTo(0.5, 0.0);
        GraphicInterface.scaleByHeight(title, 12);
        //Description
        var descriptionY = title.y + title.height + GraphicInterface.spacing;
        var descriptionFontSize = GraphicInterface.sizeOfHeight(6);
        var descriptionWrapSize = GraphicInterface.sizeOfWidth(90);
        var descriptionStyle = { font: "bold " + descriptionFontSize + "px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: descriptionWrapSize };
        var description = g.add.text(g.world.centerX, descriptionY, strings["about"]["description_text"], descriptionStyle);
        description.anchor.setTo(0.5, 0.0);
        //Version
        var versionTextFontSize = GraphicInterface.sizeOfHeight(5);
        var versionTextStyle = { font: "bold " + versionTextFontSize + "px Arial", fill: "#000000" };
        var versionTextValue = strings["about"]["version_text"] + " " + conf["about"]["version_number"];
        var versionText = g.add.text(g.world.width - GraphicInterface.spacing, g.world.height - GraphicInterface.spacing, versionTextValue, versionTextStyle);
        versionText.anchor.setTo(1.0, 1.0);
    };
    About.prototype.back = function () {
        //Start menu state
        Tools.startState("Menu");
    };
    return About;
}(Phaser.State));
