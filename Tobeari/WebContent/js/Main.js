window.onload = function () {
    //Game size is only 16/9, in order to have the same field of view between players
    var size = Tools.getGameSize(16, 9);
    //Create the Phaser game and inject it into the page
    g = new Phaser.Game(size.width, size.height, Phaser.CANVAS);
    //Add and Start boot state
    g.state.add("Boot", Boot);
    g.state.start("Boot");
};
//*** Global scope ***
/** @type boolean */
var isTestMode = false;
/** @type Phaser.Game */
var g;
/** @type any */
var conf;
/** @type any */
var strings;
/** @type Debug */
var d;
/** @type string */
var playerName;
/** @type ScoresDatas */
var scoresDatas;
/** @type SoundManager */
var sounds;
/**
 *  console.log output of arguments
 *  @param arguments single for "arg" or couples for "{evenArg}: {oddArg}"
 */
function l() {
    var param = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        param[_i - 0] = arguments[_i];
    }
    var text = "_l> ";
    if (param.length > 1) {
        for (var i = 0; i < param.length; i += 2) {
            if (i > 0)
                text += ", ";
            text += param[i] + ": " + param[i + 1];
        }
    }
    else
        text += param[0];
    console.log(text);
}
/**
 * assert function, throw exception if input is false
 */
function assert(bool, message) {
    if (!bool)
        throw message;
}
