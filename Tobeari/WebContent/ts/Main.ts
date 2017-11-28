window.onload = function() {
	//Game size is only 16/9, in order to have the same field of view between players
	let size = Tools.getGameSize(16, 9);

	//Create the Phaser game and inject it into the page
	g = new Phaser.Game(size.width, size.height, Phaser.CANVAS);
	
	//Add and Start boot state
	g.state.add("Boot", Boot);
	g.state.start("Boot");
};

//*** Global scope ***

/** @type boolean */
const isTestMode: boolean = false;

/** @type Phaser.Game */
let g: Phaser.Game;

/** @type any */
let conf: any;

/** @type any */
let strings: any;

/** @type Debug */
let d: Debug;

/** @type string */
let playerName: string;

/** @type ScoresDatas */
let scoresDatas: ScoresDatas;

/** @type SoundManager */
let sounds: SoundManager;

/**
 *  console.log output of arguments
 *  @param arguments single for "arg" or couples for "{evenArg}: {oddArg}"
 */
function l(...param: any[]) {
	let text = "_l> ";
	if(param.length > 1) {
		for(let i=0; i<param.length; i+=2) {
			if(i > 0)
				text += ", ";
			text += param[i] + ": " + param[i+1];
		}
	}else
		text += param[0];
	console.log(text);
}

/**
 * assert function, throw exception if input is false
 */
function assert(bool: boolean, message: string) {
	if(!bool)
		throw message;
}