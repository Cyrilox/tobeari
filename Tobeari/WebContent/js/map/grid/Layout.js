/**
 * A layout for Hexagonal Grid
 */
var Layout = (function () {
    function Layout(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
        //The size correspond to the size of the circle composed by the corners, no edge to edge
    }
    /**
     * Return the screen position of a Hex corner, relative for this layout
     */
    Layout.prototype.hexCornerOffset = function (corner) {
        var angle = 2 * Math.PI * (corner + this.orientation.startAngle) / 6;
        return new Phaser.Point(this.size.x * Math.cos(angle), this.size.y * Math.sin(angle));
    };
    /**
     * Return the screen position corners of a Hex, for this layout
     */
    Layout.prototype.polygonCorners = function (h) {
        var corners = [];
        var center = GridTools.hexToPixel(this, h);
        var offset;
        for (var i = 0; i < 6; i++) {
            offset = this.hexCornerOffset(i);
            corners.push(new Phaser.Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    };
    return Layout;
}());
