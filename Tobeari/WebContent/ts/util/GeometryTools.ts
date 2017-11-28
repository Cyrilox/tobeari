/**
 * Geometry tools.
 */
abstract class GeometryTools {
	static radian90: number;
	static radian180: number;

	static init() {
		GeometryTools.radian90 = Phaser.Math.degToRad(90);
		GeometryTools.radian180 = Phaser.Math.degToRad(180);
	}

	/**
	 * Dans un triangle composé par A, B et C
	 * Avec les points A et B, l'angle B et la distance BC
	 * @param {Phaser.Point} a
	 * @param {Phaser.Point} b
	 * @param {Number} angle En radian
	 * @param {Number} bc
	 * @return Renvoi le point C
	 */
	static getTrianglePointC(a: Phaser.Point, b: Phaser.Point, angleB: number, bc: number): Phaser.Point{
		let c = new Phaser.Point(0, 0), ab: number;
		
		ab = Math.sqrt(Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.y - b.y), 2));
		c.x = b.x + bc / ab * (Math.cos(angleB) * (a.x - b.x) - Math.sin(angleB) * (a.y - b.y));
		c.y = b.y + bc / ab * (Math.sin(angleB) * (a.x - b.x) + Math.cos(angleB) * (a.y - b.y));
		
		return c;
	}
}