/**
 * Boot state.
 */
function Boot() {
	Phaser.State.call(this);
	
	this.init = function() {
		// 1 pointer
		g.input.maxPointers = 1;

		// Setup the scale strategy
		g.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;//EXACT_FIT
		g.scale.pageAlignHorizontally = true;
		g.scale.pageAlignVertically = true;
	};
	
	this.preload = function() {
		// Load the preload assets
		g.load.pack("preload", "assets/assets-pack.json");
	};
	
	this.create = function() {
		//Start preloader state
		g.state.add("Preload", Preload);
		g.state.start("Preload");
	};
}