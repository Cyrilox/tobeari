/**
 * The sight fog of the player.
 */
class Sightfog {
	public activated: boolean;
	public closed: boolean;

	private minWidth: number;
	private maxWidth: number;
	private widthRange: number;
	public halfWidth: number;

	public fog: Phaser.Graphics;

	constructor(private predator: Predator) {
		this.activated = conf["sightfog"]["activated"];
		this.closed = false;
		
		this.minWidth = conf["sightfog"]["min_width"];
		this.maxWidth = conf["sightfog"]["max_width"];
		this.widthRange = this.maxWidth - this.minWidth;
		this.halfWidth = 1;
		
		this.fog = this.activated ? g.add.graphics(0, 0) : null;
	}

	//Updating in loop
	public update() {
		if(this.activated) {
			//Draw a giant black rounded man over everything but UI, the "mouse" is the visible sight
			let angle: number, center: Phaser.Point, startRad: number, endRad: number;
			angle = this.predator.group.rotation + Math.PI;
			center = Tools.getTrigPosition(this.predator.group.position, this.predator.group.width / 4, angle);
			
			this.fog.clear();
			this.fog.beginFill(0x000000);
			if(this.closed) {
				//Fermeture complète
				this.fog.drawCircle(center.x, center.y, g.world.width * 2);
			}else{
				//Ouverture proportionnel à l'énergie
				this.halfWidth = (this.widthRange * this.predator.energy / 100 + this.minWidth)/ 2;
				startRad = this.predator.group.rotation - this.halfWidth;
				endRad = this.predator.group.rotation + this.halfWidth;
				
				this.fog.arc(center.x, center.y, g.world.width, startRad, endRad, true);
			}
			
			this.fog.endFill();
		}
	}
}