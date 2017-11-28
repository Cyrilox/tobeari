/**
 * A Cell which contain all elements linked to this one
 */
var Cell = (function () {
    function Cell(id, map, hex, layout, edge, apotheme) {
        this.id = id;
        this.map = map;
        this.hex = hex;
        this.edge = edge;
        this.apotheme = apotheme;
        //Selection
        this.selectable = false;
        this.selected = false;
        //Entities attached
        this.entities = [];
        //Coordinates
        this.coordinates = new CellCoordinates(hex, layout);
        this.polygon = new Phaser.Polygon(this.coordinates.corners);
        //Hitarea is not updated because Cell is not moving
        this.hitarea = this.polygon;
    }
    /**
     * Should be called as soon as the edge size is known
     */
    Cell.init = function (edgeSize) {
        //Sizes
        Cell.EDGE_SIZE = edgeSize;
        Cell.EDGE_SIZE_X2 = edgeSize * 2;
        //Styles
        var sizeEdge = GraphicInterface.sizeOfHeight(0.5);
        Cell.STYLE_EDGE_ALL[0] = sizeEdge;
        Cell.STYLE_EDGE_SELECTABLE[0] = sizeEdge;
        Cell.STYLE_EDGE_SELECTED[0] = GraphicInterface.sizeOfHeight(0.7);
    };
    //*** Drawing ***
    /**
     * Draw the edges, center and coordinates
     */
    Cell.prototype.draw = function (graphics, drawSelected, coordinates) {
        if (drawSelected === void 0) { drawSelected = false; }
        if (coordinates === void 0) { coordinates = this.coordinates; }
        //Style
        var style;
        if (drawSelected)
            style = Cell.STYLE_EDGE_SELECTED;
        else if (this.selectable)
            style = Cell.STYLE_EDGE_SELECTABLE;
        else
            style = Cell.STYLE_EDGE_ALL;
        graphics.lineStyle(style[0], style[1], style[2]);
        //Test mode. Fill if not walkable
        if (isTestMode && !drawSelected && !this.isWalkable())
            graphics.beginFill(Cell.STYLE_FILL_NOTWALKABLE);
        //Edges
        graphics.drawPolygon(coordinates.corners);
        graphics.lineTo(coordinates.bottomRightCorner.x, coordinates.bottomRightCorner.y);
        //End fill
        graphics.endFill();
    };
    /**
     * Clear the cell from drawing
     */
    Cell.prototype.clear = function (graphics) {
        graphics.beginFill(0xFFFFFF, 1);
        //Edges
        graphics.drawPolygon(this.coordinates.corners);
        graphics.lineTo(this.coordinates.bottomRightCorner.x, this.coordinates.bottomRightCorner.y);
        graphics.endFill();
    };
    //*** Selection ***
    Cell.prototype.isSelectable = function () {
        return this.selectable;
    };
    Cell.prototype.isSelected = function () {
        return this.selected;
    };
    Cell.prototype.setSelectable = function (selectable) {
        this.selectable = selectable;
    };
    Cell.prototype.setSelected = function (selected) {
        if (selected && this.selectable)
            this.selected = true;
        else
            this.selected = false;
        this.map.onCellSelectedChanged(this);
    };
    //*** Entities ***
    /**
     * Add a new Entity, and dispatch the event to Map
     */
    Cell.prototype.addEntity = function (entity) {
        if (!this.containEntity(entity)) {
            this.entities.push(entity);
            this.map.onCellEntitiesChanged(this);
        }
    };
    /**
     * Return true if the entity is already attached on this Cell
     */
    Cell.prototype.containEntity = function (entity) {
        for (var i in this.entities)
            if (this.entities[i] == entity)
                return true;
        return false;
    };
    /**
     * Remove the Entity attached to Cell if present
     */
    Cell.prototype.removeEntity = function (entity) {
        for (var i in this.entities) {
            if (this.entities[i] == entity) {
                this.entities.splice(parseInt(i), 1);
                this.map.onCellEntitiesChanged(this);
                break;
            }
        }
    };
    Cell.prototype.isEmpty = function () {
        return this.entities.length == 0;
    };
    /**
     * Return one of the Entity attached to this Cell, by preference: 1)Prey 2)Plant
     */
    Cell.prototype.getMostAliveEntity = function () {
        var mostAliveEntity = null, entity;
        for (var i in this.entities) {
            entity = this.entities[i];
            if (mostAliveEntity == null || entity instanceof Prey)
                mostAliveEntity = entity;
        }
        return mostAliveEntity;
    };
    //*** Walkable ***
    /**
     * Cell is walkable if no entities or all entities are walkable
     */
    Cell.prototype.isWalkable = function () {
        return this.isEmpty() || !this.containEntityNotWalkable();
    };
    /**
     * Return true if at least 1 entity on this Cell is not walkable
     */
    Cell.prototype.containEntityNotWalkable = function () {
        for (var i in this.entities)
            if (!this.entities[i].walkable)
                return true;
        return false;
    };
    //*** Hit area ***
    Cell.prototype.getHitarea = function () {
        return this.hitarea;
    };
    //*** Show ***
    Cell.prototype.toString = function () {
        return this.hex.toString();
    };
    //Styles
    Cell.STYLE_FILL_NOTWALKABLE = 0xFF5733; //diameter
    Cell.STYLE_EDGE_ALL = [5, 0x808080, 0.7]; //lineWidth, color, alpha
    Cell.STYLE_EDGE_SELECTABLE = [5, 0x666666, 0.7]; //lineWidth, color, alpha
    Cell.STYLE_EDGE_SELECTED = [5, 0xFFFFFF, 1]; //lineWidth, color, alpha
    return Cell;
}());
