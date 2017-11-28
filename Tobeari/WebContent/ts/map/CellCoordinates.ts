/**
 * Contain the game coordinates of a cell, in pixel
 */
class CellCoordinates {
    public center: Phaser.Point;
    public corners: Phaser.Point[];
    public topCorner: Phaser.Point;
    public bottomRightCorner: Phaser.Point;

    constructor(hex?: Hex, layout?: Layout) {
        if(hex !== undefined) {
            let point = GridTools.hexToPixel(layout, hex);
            this.center = new Phaser.Point(point.x, point.y);

            this.corners = layout.polygonCorners(hex);

            this.topCorner = this.corners[4];
            this.bottomRightCorner = this.corners[0];
        }
    }

    /**
     * Move the center to origin [0, 0], with others coordinates relative to it also
     */
    public moveToOrigin() {
        let xShift: number, yShift: number, corner: Phaser.Point;
        xShift = -this.center.x;
        yShift = -this.center.y;
        for(let i in this.corners) {
            corner = this.corners[i];
            corner.x += xShift;
            corner.y += yShift;
        }

        this.center.setTo(0, 0);
        
        this.topCorner = this.corners[4];
        this.bottomRightCorner = this.corners[0];
    }

    public clone(): CellCoordinates {
        let coordinates = new CellCoordinates();

        coordinates.center = this.center.clone();

        coordinates.corners = [];
        for(let i in this.corners)
            coordinates.corners.push(this.corners[i].clone());
        
        coordinates.topCorner = coordinates.corners[4];
        coordinates.bottomRightCorner = coordinates.corners[0];
        
        return coordinates;
    }

    public toString(): string {
        return "center: "+this.center+", corners: "+this.corners;
    }
}