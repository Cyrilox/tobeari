/**
 * Menu state.
 */
function Menu() {
	Phaser.State.call(this);
	
	this.create = function() {
		this.menuInterface = new MenuInterface();
		
		//Sounds
		sounds.menuSelection = g.add.audio("menu_selection");
	};
}