/**
 * Menu state.
 */
class Menu extends Phaser.State {
	private menuInterface: MenuInterface;
	
	create() {
		//UI
		this.menuInterface = new MenuInterface();
		
		//Loading screen
		LoadingScreen.hide();
	}
}