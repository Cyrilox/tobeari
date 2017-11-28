/**
 * Hexagonal cell
 * Cube storage, cube constructor
 * Ranges from 0 to number of cells
 */
var Hex = (function () {
    function Hex(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (z === undefined) {
            z = -x - y;
            this.z = z;
        }
        assert(x + y + z == 0, "Hex invalid for x=" + x + ", y=" + y + ", z=" + z);
    }
    //*** Equality ***
    /**
     * Return true if this Hex and the Hex in parameter are equal
     */
    Hex.prototype.equal = function (b) {
        return this.x == b.x && this.y == b.y && this.z == b.z;
    };
    //*** Coordinate arithmetic ***
    /**
     * Return a new Hex corresponding to the addition of this Hex and the Hex in parameter
     */
    Hex.prototype.add = function (b) {
        return new Hex(this.x + b.x, this.y + b.y, this.z + b.z);
    };
    /**
     * Return a new Hex corresponding to the substraction of this Hex and the Hex in parameter
     */
    Hex.prototype.subtract = function (b) {
        return new Hex(this.x - b.x, this.y - b.y, this.z - b.z);
    };
    /**
     * Return a new Hex corresponding to the multiplication of this Hex and the number in parameter
     */
    Hex.prototype.multiply = function (k) {
        return new Hex(this.x * k, this.y * k, this.z * k);
    };
    //*** Distance ***
    /**
     * Return the length of this Hex
     */
    Hex.prototype.length = function () {
        return Math.floor((Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)) / 2);
    };
    /**
     * Return the distance between this Hex and the Hex in parameter
     */
    Hex.prototype.distance = function (b) {
        return this.subtract(b).length();
    };
    /**
     * Return the standard Hex direction corresponding to the direction number in parameter
     * @param {number} direction - The direction from 0 to 5 included
     */
    Hex.direction = function (direction) {
        assert(0 <= direction && direction < 6, "Hex direction should be between 0 and 5 included, actual is " + direction);
        return Hex.DIRECTIONS[direction];
    };
    /**
     * Return the addition of this Hex plus the standard Hex direction chosed with the direction number in parameter
     * @param {number} direction - The direction from 0 to 5 included
     * @return A new Hex
     */
    Hex.prototype.neighbor = function (direction) {
        return this.add(Hex.direction(direction));
    };
    /**
     * Return all the neighbors of this Hex, even out of bounds
     */
    Hex.prototype.neighbors = function () {
        var neighbors = [];
        for (var direction = 0; direction < Hex.DIRECTIONS.length; direction++)
            neighbors.push(this.neighbor(direction));
        return neighbors;
    };
    //*** Rounding ***
    /**
     * Round the values of this Hex
     */
    Hex.prototype.round = function () {
        var x = Math.round(this.x);
        var y = Math.round(this.y);
        var z = Math.round(this.z);
        var x_diff = Math.abs(x - this.x);
        var y_diff = Math.abs(y - this.y);
        var z_diff = Math.abs(z - this.z);
        if (x_diff > y_diff && x_diff > z_diff)
            x = -y - z;
        else if (y_diff > z_diff)
            y = -x - z;
        else
            z = -x - y;
        this.x = x;
        this.y = y;
        this.z = z;
    };
    //*** Selection ***
    /**
     * Return the Hexs around this Hex, AT a distance (circle)
     * @param {number} radius Must be >0
     */
    Hex.prototype.getRing = function (radius) {
        //Décalage vers le point de départ
        var hex = this;
        for (var shift = 0; shift < radius; shift++)
            hex = hex.add(Hex.direction(4));
        //Trace le cercle
        var hexs = [];
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < radius; j++) {
                hexs.push(hex);
                hex = hex.neighbor(i);
            }
        }
        return hexs;
    };
    /**
     * Return the Hexs around this Hex, TO a distance (disk)
     */
    Hex.prototype.getDisk = function (fromRadius, radius) {
        //Trace les cercles à toutes les distances
        var hexs = [];
        for (var i = fromRadius; i <= radius; i++)
            hexs = hexs.concat(this.getRing(i));
        return hexs;
    };
    //Show
    Hex.prototype.toString = function () {
        return "[" + this.x + ", " + this.y + "]";
    };
    Hex.DIRECTIONS = [
        new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1),
        new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
    return Hex;
}());
