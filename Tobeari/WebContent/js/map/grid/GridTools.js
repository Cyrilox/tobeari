/**
 * Tools for Hexagonal Grid
 */
var GridTools = (function () {
    function GridTools() {
    }
    //*** Coordinate conversion ***
    /**
     * Return the screen position of a Hex cell
     */
    GridTools.hexToPixel = function (layout, h) {
        var M = layout.orientation;
        var x = (M.f0 * h.x + M.f1 * h.y) * layout.size.x;
        var y = (M.f2 * h.x + M.f3 * h.y) * layout.size.y;
        return new Phaser.Point(x + layout.origin.x, y + layout.origin.y);
    };
    /**
     * Return the Hex position of a screen Phaser.Point
     */
    GridTools.pixelToHex = function (layout, p) {
        var M = layout.orientation;
        var pt = new Point((p.x - layout.origin.x) / layout.size.x, (p.y - layout.origin.y) / layout.size.y);
        var x = M.b0 * pt.x + M.b1 * pt.y;
        var y = M.b2 * pt.x + M.b3 * pt.y;
        var hex = new Hex(x, y, -x - y);
        hex.round();
        return hex;
    };
    //*** Line drawing ***
    /**
     * Interpolation of 3 values
     */
    GridTools.lerpValues = function (a, b, t) {
        return a * (1 - t) + b * t;
    };
    /**
     * Interpolation of an Hex
     */
    GridTools.lerpHex = function (a, b, t) {
        return new Hex(GridTools.lerpValues(a.x, b.x, t), GridTools.lerpValues(a.y, b.y, t), GridTools.lerpValues(a.z, b.z, t));
    };
    /**
     * Line drawing between two Hex
     */
    GridTools.lineDraw = function (a, b) {
        var N = a.distance(b);
        var results = [];
        var step = 1 / Math.max(N, 1);
        for (var i = 0; i <= N; i++)
            results.push(GridTools.lerpHex(a, b, step * i));
        return results;
    };
    return GridTools;
}());
