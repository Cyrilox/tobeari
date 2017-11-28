var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Boot state.
 */
var Boot = (function (_super) {
    __extends(Boot, _super);
    function Boot() {
        _super.apply(this, arguments);
    }
    Boot.prototype.preload = function () {
        //Preload
        g.load.pack("preload", "assets/assets-pack.json");
    };
    Boot.prototype.create = function () {
        //Configuration
        g.input.maxPointers = 1;
        g.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        g.scale.pageAlignHorizontally = true;
        g.scale.pageAlignVertically = true;
        if (isTestMode)
            g.time.advancedTiming = true;
        //Strings needed for LoadingScreen invoked by Tools.startState(
        strings = Tools.getStringsJSON();
        //Add and Start preload state
        g.state.add("Preload", Preload);
        Tools.startState("Preload", true);
    };
    return Boot;
}(Phaser.State));
