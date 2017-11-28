/**
 * Preload state, load most of the game.
 */
function Preload() {
	Phaser.State.call(this);
	
	this.preload = function() {
		// preloadBar automatically crop the sprite from 0 to full-width as the files are loaded in.
		var preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, "loading");
		preloadBar.anchor.set(0.5, 0.5);
		this.load.setPreloadSprite(preloadBar);
		
		//Sound
		sounds = new Sounds();
		sounds.ambianceDesert = g.add.audio("ambiance_desert", 0.1, true);
		sounds.ambianceDesert.play();
		
		//Ground
		g.stage.backgroundColor = "#d3a548";
 
		// Load the assets
		this.load.pack("global", "assets/assets-pack.json");
		this.load.pack("menu", "assets/assets-pack.json");
		this.load.pack("level", "assets/assets-pack.json");
		this.load.pack("scores", "assets/assets-pack.json");
		this.load.pack("about", "assets/assets-pack.json");
		
		//Inspector
		if(testMode)
			g.plugins.add(Phaser.Plugin.Inspector);
	};
	
	this.create = function() {
		//Config file
		config = g.cache.getJSON(testMode ? "config_test" : "config_normal");
		
		//Player
		player = config.global.player_name;
		
		//Debug
		d = new Debug();
		
		//Scores datas
		scoresDatas = new ScoresDatas();
		
		//Add level state
		g.state.add("Level", Level);
		//Add menu state
		g.state.add("Menu", Menu);
		//Add scores state
		g.state.add("Scores", Scores);
		//Add about state
		g.state.add("About", About);
		
		//Démarrage
		g.state.start("Menu");
	};
}