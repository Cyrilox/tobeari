/**
 * Boot state.
 */
class Boot extends Phaser.State{
	
	preload() {
		//Preload
		g.load.pack("preload", "assets/assets-pack.json");
	}

	create() {
		//Configuration
		g.input.maxPointers = 1;

		g.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		g.scale.pageAlignHorizontally = true;
		g.scale.pageAlignVertically = true;

		if(isTestMode)
			g.time.advancedTiming = true;

		//Strings needed for LoadingScreen invoked by Tools.startState(
		strings = Tools.getStringsJSON();

		//Add and Start preload state
		g.state.add("Preload", Preload);
		Tools.startState("Preload", true);
	}
}