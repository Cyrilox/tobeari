window.onload = function() {
	// Create the Phaser game and inject it into the page.
	g = new Phaser.Game(800, 450, Phaser.CANVAS);
	
	// Add boot state.
	g.state.add("Boot", Boot);

	// Start boot state.
	g.state.start("Boot");
};

//Global scope

/** @type Boolean */
var testMode = false;

/** @type JSON */
var config;

/** @type Phaser.Game */
var g;

/** @type Debug */
var d;

/** @type String */
var player;

/** @type ScoresDatas */
var scoresDatas;

/** @type Sounds */
var sounds;

/**
 *  console.log output of arguments
 *  @param arguments single for "arg" or couples for "{evenArg}: {oddArg}"
 */
function l(){
	var text = "_l> ";
	if(arguments.length > 1){
		for(var i=0; i<arguments.length; i+=2){
			if(i > 0)
				text += ", ";
			text += arguments[i] + ": " + arguments[i+1];
			}
	}else
		text = arguments[0];
	console.log(text);
}