/**
 * A Cell which contain all elements linked to this one
 */
class Cell {
    //Coordinates
    public coordinates: CellCoordinates;
    public polygon: Phaser.Polygon;
    private hitarea: Phaser.Polygon;//Click area

    //Selection
    private selectable: boolean = false;
    private selected: boolean = false;

    //Entities attached
    private entities: Entity[] = [];

    //Sizes
    static EDGE_SIZE: number;//Coté
    static EDGE_SIZE_X2: number;

    //Styles
    static STYLE_FILL_NOTWALKABLE = 0xFF5733;//diameter
    static STYLE_EDGE_ALL = [5, 0x808080, 0.7];//lineWidth, color, alpha
    static STYLE_EDGE_SELECTABLE = [5, 0x666666, 0.7];//lineWidth, color, alpha
    static STYLE_EDGE_SELECTED = [5, 0xFFFFFF, 1];//lineWidth, color, alpha

    constructor(public id: number, private map: Map, public hex: Hex, layout: Layout, public edge: number, public apotheme: number) {
        //Coordinates
        this.coordinates = new CellCoordinates(hex, layout);
        this.polygon = new Phaser.Polygon(this.coordinates.corners);

        //Hitarea is not updated because Cell is not moving
        this.hitarea = this.polygon;
    }

    /**
     * Should be called as soon as the edge size is known
     */
    static init(edgeSize: number) {
        //Sizes
        Cell.EDGE_SIZE = edgeSize;
        Cell.EDGE_SIZE_X2 = edgeSize * 2;

        //Styles
        let sizeEdge = GraphicInterface.sizeOfHeight(0.5);
        Cell.STYLE_EDGE_ALL[0] = sizeEdge;
        Cell.STYLE_EDGE_SELECTABLE[0] = sizeEdge;
        Cell.STYLE_EDGE_SELECTED[0] = GraphicInterface.sizeOfHeight(0.7);
    }

    //*** Drawing ***
    
    /**
     * Draw the edges, center and coordinates
     */
    public draw(graphics: Phaser.Graphics, drawSelected = false, coordinates = this.coordinates) {
        //Style
        let style: number[];
        if(drawSelected)
            style = Cell.STYLE_EDGE_SELECTED;
        else if(this.selectable)
            style = Cell.STYLE_EDGE_SELECTABLE;
        else
            style = Cell.STYLE_EDGE_ALL;
        graphics.lineStyle(style[0], style[1], style[2]);

        //Test mode. Fill if not walkable
        if(isTestMode && !drawSelected && !this.isWalkable())
            graphics.beginFill(Cell.STYLE_FILL_NOTWALKABLE);

        //Edges
        graphics.drawPolygon(coordinates.corners);
        graphics.lineTo(coordinates.bottomRightCorner.x, coordinates.bottomRightCorner.y);

        //End fill
        graphics.endFill();
    }

    /**
     * Clear the cell from drawing
     */
    public clear(graphics: Phaser.Graphics) {
        graphics.beginFill(0xFFFFFF, 1);

        //Edges
        graphics.drawPolygon(this.coordinates.corners);
        graphics.lineTo(this.coordinates.bottomRightCorner.x, this.coordinates.bottomRightCorner.y);

        graphics.endFill();
    }

    //*** Selection ***

    public isSelectable(): boolean {
        return this.selectable;
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public setSelectable(selectable: boolean) {
        this.selectable = selectable;
    }

    public setSelected(selected: boolean) {
        if(selected && this.selectable)
            this.selected = true;
        else
            this.selected = false;
        
        this.map.onCellSelectedChanged(this);
    }

    //*** Entities ***

    /**
     * Add a new Entity, and dispatch the event to Map
     */
    public addEntity(entity: Entity) {
        if(!this.containEntity(entity)){
            this.entities.push(entity);
            this.map.onCellEntitiesChanged(this);
        }
    }

    /**
     * Return true if the entity is already attached on this Cell
     */
    public containEntity(entity: Entity): boolean {
        for(let i in this.entities)
            if(this.entities[i] == entity)
                return true;
        return false;
    }

    /**
     * Remove the Entity attached to Cell if present
     */
    public removeEntity(entity: Entity) {
        for(let i in this.entities){
            if(this.entities[i] == entity){
                this.entities.splice(parseInt(i), 1);
                this.map.onCellEntitiesChanged(this);
                break;
            }
        }
    }

    public isEmpty(): boolean {
        return this.entities.length == 0;
    }

    /**
     * Return one of the Entity attached to this Cell, by preference: 1)Prey 2)Plant
     */
    public getMostAliveEntity(): Entity {
        let mostAliveEntity: Entity = null, entity: Entity;
        for(let i in this.entities){
            entity = this.entities[i];
            if(mostAliveEntity == null || entity instanceof Prey)
                mostAliveEntity = entity;
        }
        return mostAliveEntity;
    }

    //*** Walkable ***

    /**
     * Cell is walkable if no entities or all entities are walkable
     */
    public isWalkable(): boolean {
        return this.isEmpty() || !this.containEntityNotWalkable();
    }

    /**
     * Return true if at least 1 entity on this Cell is not walkable
     */
    private containEntityNotWalkable(): boolean {
        for(let i in this.entities)
            if(!this.entities[i].walkable)
                return true;
        return false;
    }
    
    //*** Hit area ***

    public getHitarea(): Phaser.Polygon {
        return this.hitarea;
    }

    //*** Show ***

    public toString(): string {
        return this.hex.toString();
    }
}