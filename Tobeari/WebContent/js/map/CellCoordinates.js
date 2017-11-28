/**
 * Contain the game coordinates of a cell, in pixel
 */
var CellCoordinates = (function () {
    function CellCoordinates(hex, layout) {
        if (hex !== undefined) {
            var point = GridTools.hexToPixel(layout, hex);
            this.center = new Phaser.Point(point.x, point.y);
            this.corners = layout.polygonCorners(hex);
            this.topCorner = this.corners[4];
            this.bottomRightCorner = this.corners[0];
        }
    }
    /**
     * Move the center to origin [0, 0], with others coordinates relative to it also
     */
    CellCoordinates.prototype.moveToOrigin = function () {
        var xShift, yShift, corner;
        xShift = -this.center.x;
        yShift = -this.center.y;
        for (var i in this.corners) {
            corner = this.corners[i];
            corner.x += xShift;
            corner.y += yShift;
        }
        this.center.setTo(0, 0);
        this.topCorner = this.corners[4];
        this.bottomRightCorner = this.corners[0];
    };
    CellCoordinates.prototype.clone = function () {
        var coordinates = new CellCoordinates();
        coordinates.center = this.center.clone();
        coordinates.corners = [];
        for (var i in this.corners)
            coordinates.corners.push(this.corners[i].clone());
        coordinates.topCorner = coordinates.corners[4];
        coordinates.bottomRightCorner = coordinates.corners[0];
        return coordinates;
    };
    CellCoordinates.prototype.toString = function () {
        return "center: " + this.center + ", corners: " + this.corners;
    };
    return CellCoordinates;
}());
