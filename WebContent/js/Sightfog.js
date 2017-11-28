/*
 * The sight fog of the player.
 * @class Sightfog
 * @contructor
 */
function Sightfog(predator){

	//Updating in loop
	this.update = function() {
		if(this.activated){
			//Draw a giant black rounded man over everything but UI, the "mouse" is the visible sight
			var angle, center, startRad, endRad;
			angle = this.predator.group.rotation + Math.PI;
			center = Tools.getTrigPosition(this.predator.group.position, this.predator.group.width / 4, angle);
			
			this.fog.clear();
			this.fog.beginFill(0x000000);
			if(this.closed){
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
	};
	
	//Close the predator fog
	this.close = function() {
		this.closed = true;
	};
	
	this.predator = predator;
	
	this.closed = false;
	this.minWidth = config.sightfog.min_width;
	this.maxWidth = config.sightfog.max_width;
	this.widthRange = this.maxWidth - this.minWidth;
	this.halfWidth = 1;
	
	this.activated = config.sightfog.activated;
	if(this.activated)
		this.fog = g.add.graphics(0, 0);
}