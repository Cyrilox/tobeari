/**
 * A layout for Hexagonal Grid
 */
class Layout {

    constructor(public orientation: Orientation, public size: Point, public origin: Point) {
        //The size correspond to the size of the circle composed by the corners, no edge to edge
    }

    /**
     * Return the screen position of a Hex corner, relative for this layout
     */
    public hexCornerOffset(corner: number): Phaser.Point {
        let angle = 2 * Math.PI * (corner + this.orientation.startAngle) / 6;
        return new Phaser.Point(this.size.x * Math.cos(angle), this.size.y * Math.sin(angle));
    }

    /**
     * Return the screen position corners of a Hex, for this layout
     */
    public polygonCorners(h: Hex): Phaser.Point[] {
        let corners: Phaser.Point[] = [];
        let center: Phaser.Point = GridTools.hexToPixel(this, h);
        let offset: Phaser.Point;
        for(let i = 0; i < 6; i++) {
            offset = this.hexCornerOffset(i);
            corners.push(new Phaser.Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }
}