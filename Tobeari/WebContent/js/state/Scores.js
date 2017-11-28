var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Scores state.
 */
var Scores = (function (_super) {
    __extends(Scores, _super);
    function Scores() {
        _super.apply(this, arguments);
    }
    Scores.prototype.create = function () {
        var x = GraphicInterface.spacing;
        var y = GraphicInterface.spacing;
        //Button
        var backButton = new Button(Button.TYPE["IMAGE"], "button_back", x, y, 14, this.back, this);
        //Title
        var titleFontSize = GraphicInterface.sizeOfHeight(12);
        var titleStyle = { font: "bold " + titleFontSize + "px Arial", fill: "#471c07", align: "center" };
        var title = g.add.text(g.world.centerX, GraphicInterface.spacing, strings["scores"]["title_text"], titleStyle);
        title.anchor.setTo(0.5, 0.0);
        GraphicInterface.scaleByHeight(title, 12);
        //Scores array
        var tabsWidth = GraphicInterface.sizeOfWidth(17);
        var tabHeadFontSize = GraphicInterface.sizeOfHeight(6);
        var tabHeadTabs = [tabsWidth * 110 / 100, tabsWidth * 115 / 100, tabsWidth * 125 / 100];
        var tabHeadStyle = { font: "bold " + tabHeadFontSize + "px Arial", fill: "#000000", align: "left", tabs: tabHeadTabs };
        var tabHeadings = strings["scores"]["tab_headings"];
        var tabHeadingY = title.y + title.height + GraphicInterface.spacing;
        var tabHeading = g.add.text(g.world.centerX, tabHeadingY, '', tabHeadStyle);
        tabHeading.anchor.setTo(0.5, 0.0);
        tabHeading.parseList(tabHeadings);
        var tabLinesFontSize = GraphicInterface.sizeOfHeight(5);
        var tabLinesTabs = [tabsWidth * 90 / 100, tabsWidth * 105 / 100, tabsWidth * 90 / 100];
        var tabLinesStyle = { font: tabLinesFontSize + "px Arial", fill: "#000000", align: "center", tabs: tabLinesTabs };
        var tabLinesY = tabHeadingY + tabHeading.height;
        var tabLines = g.add.text(g.world.centerX, tabLinesY, strings["scores"]["tab_list_empty"], tabLinesStyle);
        tabLines.anchor.setTo(0.5, 0.0);
        if (scoresDatas.all.length > 0)
            tabLines.parseList(scoresDatas.getTop(10));
        //Reset
        var butReset = new Button(Button.TYPE["TEXT"], String(strings["scores"]["reset"]), g.world.width - GraphicInterface.spacing, GraphicInterface.spacing, 14, this.resetAll, this);
        butReset.setAnchor(1, 0);
    };
    Scores.prototype.back = function () {
        //Start menu state
        Tools.startState("Menu");
    };
    Scores.prototype.resetAll = function () {
        //Reset scores
        scoresDatas.reset();
        Tools.startState("Scores");
    };
    return Scores;
}(Phaser.State));
