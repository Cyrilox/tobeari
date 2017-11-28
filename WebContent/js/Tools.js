/*
 * Tools.
 * @class Tools
 * @contructor
 */
function Tools(){
	
}

/**
 * Return the actual time in millisecond
 */
Tools.currentTimeMillis = function() {
	return new Date().getTime();
};

/*
 * Return the positive radian, from 0 to 2PI, clockwize
 */
Tools.positiveRadian = function(radian){
	return radian < 0 ? Math.PI * 2 + radian : radian;
};

/*
 * Return the regular radian, -0 to -PI counter-clockwize, or 0 to PI clockwize
 */
Tools.regularRadian = function(radian){
	return radian > Math.PI ? radian - Math.PI * 2 : radian;
};

/*
 * Return a random angle in radian
 */
Tools.getRandomRadianAngle = function(){
	return Tools.getRandomArbitrary(-Math.PI, Math.PI);
};

/*
 * Return the distance between 2 target
 */
Tools.getDistance = function(targetA, targetB){
	return g.physics.arcade.distanceBetween(targetA, targetB);
};

/*
 * Return the angle between 2 target in radian
 */
Tools.getAngle = function(targetA, targetB){
	return g.physics.arcade.angleBetween(targetA, targetB);
};

/*
 * Return the closest angle between 2 radian angle in positive radian
 */
Tools.getClosestAngle = function(angleA, angleB){
	var posAngleA, posAngleB;
	posAngleA = Tools.positiveRadian(angleA);
	posAngleB = Tools.positiveRadian(angleB);
	
	var angle = Math.abs(posAngleA - posAngleB);
	var angleReverse = Math.PI * 2 - angle;
		
	return Math.min(angle, angleReverse);
};

/*
 * Calculate a trigonometric position around a point
 * @param {Phaser.Point} origin Central point
 * @param {number} radius Radius from the central point
 * @param {number} angle Angle in radian from the central point
 * Return the new position into a Phaser.Point
 */
Tools.getTrigPosition = function(origin, radius, angle){
	var x, y;
	x = origin.x + radius * Math.cos(angle);
	y = origin.y + radius * Math.sin(angle);
	return new Phaser.Point(x, y);
};

/**
 * Return true if the pointer is in the rectangle
 */
Tools.pointInRectangle = function(pointer, rectangle) {
	return pointer.x < rectangle.x+rectangle.width && pointer.x > rectangle.x && pointer.y < rectangle.y+rectangle.height && pointer.y > rectangle.y;
};

/*
 * Return a random float number between min(included) and max(exluded)
 * integer True for integer value
 */
Tools.getRandomArbitrary = function(min, max, integer) {
	var random = Math.random() * (max - min) + min;
	if(integer == undefined)
		integer = false;
	if(integer){
		random = Math.round(random);
		if(random == max)
			random--;
	}
	return random;
};

/**
 * Return the given value with min and max applied
 */
Tools.minMax = function(val, min, max) {
	return Math.max(min, Math.min(max, val));
};