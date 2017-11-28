var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Preload state, load most of the game.
 */
var Preload = (function (_super) {
    __extends(Preload, _super);
    function Preload() {
        _super.apply(this, arguments);
    }
    Preload.prototype.preload = function () {
        //Ground
        g.stage.backgroundColor = "#d3a548";
        // Load the assets
        g.load.pack("global", "assets/assets-pack.json");
        g.load.pack("level", "assets/assets-pack.json");
        g.load.pack("scores", "assets/assets-pack.json");
        g.load.pack("about", "assets/assets-pack.json");
    };
    Preload.prototype.create = function () {
        //Static initializations
        GeometryTools.init();
        GraphicInterface.init();
        GameStateInformation.init();
        SoundManager.init();
        //Configurations
        conf = g.cache.getJSON(isTestMode ? "config_test" : "config_normal");
        //Inspector
        if (conf["global"]["inspector"])
            g.plugins.add(Phaser.Plugin.Inspector);
        //Player name
        playerName = strings["global"]["player_name"];
        //Debug
        d = new Debug();
        //Sounds
        sounds = new SoundManager("global");
        sounds.play("ambiance_desert");
        //Scores datas
        scoresDatas = new ScoresDatas();
        //Add states
        g.state.add("Menu", Menu);
        g.state.add("Level", Level);
        g.state.add("Scores", Scores);
        g.state.add("About", About);
        g.state.add("Test", Test);
        //Start menu state
        Tools.startState("Menu");
    };
    return Preload;
}(Phaser.State));
