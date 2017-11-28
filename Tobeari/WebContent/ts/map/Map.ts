/**
 * A Map composed of Cell
 */
class Map {
    //Layout, in screen size
    private layout: Layout;

    //Cells, in numbers
    private cellsX: number = 20;//35;
    private cellsY: number = 15;//23;
    private cellsYVisible: number = 11;//13;
    private cells: Cell[];
    private cellSelected: Cell = null;

    public center: Cell = null;
    private perimeter: Cell[] = [];

    //Node network
    public nodeNetwork: NodeNetwork;

    //Drawing
	public elements: Phaser.Group;
	private gridAllGraphics: Phaser.Graphics;
	private gridSelectableGraphics: Phaser.Graphics;
    private cellSelectedGraphics: Phaser.Graphics;

    constructor() {
        //Graphics
		this.gridAllGraphics = g.add.graphics(0, 0);
		this.gridSelectableGraphics = g.add.graphics(0, 0);
		this.cellSelectedGraphics = g.add.graphics(0, 0);
        this.cellSelectedGraphics.visible = false;

        //Display order
        this.elements = g.add.group();
        this.elements.add(this.gridAllGraphics);
        this.elements.add(this.gridSelectableGraphics);
        this.elements.add(this.cellSelectedGraphics);

        //Création de la grille Hexagonale
        this.createGrid();

        //Création du réseau de noeuds
        this.createNodeNetwork();

        //Traçage des grilles
        if(isTestMode)
            this.drawGridAll();
        this.drawGridSelectable();
        this.drawCellSelectedGraphics();
    }

    /**
     * Crée le Layout et les Cell
     */
    private createGrid() {
        //Diagonal / Edge
        let cellEdge: number, pointyCellYCount: number, flattyCellYCount: number, sideYCountVisible: number;//Variables verticales
        pointyCellYCount = (this.cellsYVisible + 1) / 2;
        flattyCellYCount = this.cellsYVisible - pointyCellYCount;
        sideYCountVisible = pointyCellYCount * 2 + flattyCellYCount;
        cellEdge = g.world.height / sideYCountVisible;

        let pointyCellYCountTotal: number, flattyCellYCountTotal: number, sideYCountTotal: number;
        pointyCellYCountTotal = (this.cellsY + 1) / 2;
        flattyCellYCountTotal = this.cellsY - pointyCellYCountTotal;
        sideYCountTotal = pointyCellYCountTotal * 2 + flattyCellYCountTotal;
        
        Cell.init(cellEdge);

        //Apotheme (segment perpendiculaire à un coté, jusqu'au centre)
        let cellApothem = cellEdge * Math.sqrt(3) / 2;
        
        //Centering with a shift
        let origin: Phaser.Point, width: number, height: number;
        width = cellApothem * 2 * this.cellsX;
        height = sideYCountTotal * cellEdge;
        origin = new Phaser.Point();
        origin.x = (g.world.width - width) / 2 + cellApothem;
        origin.y = (g.world.height - height) / 2 + cellEdge;
        
        //Layout creation
        let orientation: Orientation, size: Point;
        orientation = Orientation.LAYOUT_POINTY;
        size = new Point(cellEdge, cellEdge);
        this.layout = new Layout(orientation, size, origin);

        //Cells creation, with Hex into them, array position == Cell id
        this.cells = [];
        let hex: Hex;
        let cell: Cell;
        let id = 0;
        for(let y: number = 0; y < this.cellsY; y++) {
            let yOffset = Math.floor(y / 2);
            for(let x = -yOffset; x < this.cellsX - yOffset; x++) {
                hex = new Hex(x, y, -x-y);
                cell = new Cell(id, this, hex, this.layout, cellEdge, cellApothem);
                this.cells.push(cell);
                id++;
            }
        }

        //Cache
        this.setCenter();
        this.setPerimeter();
    }

    //*** Drawing ***

    /**
     * Trace la grille entière
     */
    private drawGridAll() {
        //Start
        this.gridAllGraphics.clear();

        //Cells
        for(let i in this.cells)
            this.cells[i].draw(this.gridAllGraphics);
    }
    
    /**
     * Trace une cellule de la grille
     */
    private drawGridAllCell(cell: Cell) {
        //Erase
        cell.clear(this.gridAllGraphics);

        //Cells
        cell.draw(this.gridAllGraphics);
    }
    
    /**
     * Trace la grille sélectionnable
     */
    private drawGridSelectable() {
        //Start
        this.gridSelectableGraphics.clear();

        //Cells
        for(let i in this.cells)
            if(this.cells[i].isSelectable())
                this.cells[i].draw(this.gridSelectableGraphics);
    }

    /**
     * Trace la cellule séléctionnée
     */
    private drawCellSelectedGraphics() {
        //Move coordinates to origin [0, 0]
        let coordinates = this.cells[0].coordinates.clone();
        coordinates.moveToOrigin();

        //Draw
        this.cells[0].draw(this.cellSelectedGraphics, true, coordinates);
    }

    //*** Getters, Setters ***

    /**
     * Return the Hex at the center of the visible area
     */
    private setCenter() {
        let y = Math.floor((this.cellsY - 1) / 2);
        let x = Math.floor((this.cellsX - 1) / 2) - Math.floor(y / 2);
        let hex = new Hex(x, y);
        this.center = this.cellAt(hex);
    }

    /**
     * Define the cells at the perimeter
     */
    private setPerimeter() {
        this.perimeter = [];
        
        let maxX: number;
        let offset: number;
        let cell: Cell;
        for(let y: number=0; y<this.cellsY; y++){
            offset = Math.floor(y / 2);
            maxX = this.cellsX-offset-1;
            for(let x=-offset; x<=maxX; x++) {
                if(y == 0 || y == this.cellsY-1 || x == -offset  || x == maxX){
                    cell = this.cellAt(new Hex(x, y));
                    this.perimeter.push(cell);
                }
            }
        }
    }

    /**
     * Return a random walkable Cell, or null if no one
     */
    public getRandomWalkableCell(): Cell {
        let cellsShuffled = Tools.shuffle(Tools.clone(this.cells));
        let cell: Cell;
        for(let i in cellsShuffled){
            cell = cellsShuffled[i];
            if(cell != null && cell.isWalkable())
                return cell;
        }
        return null;
    }

    /**
     * Return a walkable cell around a Cell, at a radius
     */
    public getRandomRingEmptyCell(cell: Cell, radius: number): Cell {
        let cells: Cell[] = this.getRingCells(cell, radius, true);
        return cells[Tools.getRandomArbitrary(0, cells.length, true)];
    }
    
    /**
     * Return cells around a Cell, at a radius, walkable and notSelectable optionnaly
     */
    public getRingCells(cell: Cell, radius: number, walkable: boolean, notSelectable = false): Cell[] {
        let cells: Cell[] = [];
        let hexs = cell.hex.getRing(radius);
        let cellRing: Cell;
        for(let i in hexs){
            cellRing = this.cellAt(hexs[i]);
            if(cellRing != null && (!walkable || cellRing.isWalkable()) && (!notSelectable || !cellRing.isSelectable()))
                cells.push(cellRing);
        }
        return cells;
    }

    /**
     * Return a random walkable Cell at the perimeter of the Map
     */
    public getRandomPerimeterCell(): Cell {
        //Random
        let cells = Tools.shuffle(this.perimeter.slice());
        
        //Empty
        for(let i in cells)
            if(cells[i].isWalkable())
                return cells[i];
        return null;
    }

    /**
     * Return all neighbors Hex at a Hex coordinate, even not walkables
     */
    public getNeighborsHex(hex: Hex): Hex[] {
        let neighborsCell: Cell[] = this.getNeighborsCell(this.cellAt(hex));
        let neighborsHex: Hex[] = [];
        for(let i in neighborsCell)
            neighborsHex.push(neighborsCell[i].hex);
        return neighborsHex;
    }

    /**
     * Return all neighbors of a Cell, even not walkables
     */
    public getNeighborsCell(cell: Cell): Cell[] {
        let neighborsHex: Hex[] = cell.hex.neighbors();
        let neighborsCell: Cell[] = [];
        let neighborCell: Cell;
        for(let i in neighborsHex) {
            neighborCell = this.cellAt(neighborsHex[i]);
            if(neighborCell != null)
                neighborsCell.push(neighborCell);
        }
        return neighborsCell;
    }

    //*** Pathfinding ***
    
    /**
     * Create the NodeNetwork of paths, even for no walkables, all weighted 1
     */
    private createNodeNetwork() {
        //Noeuds
        this.nodeNetwork = new NodeNetwork(this.cells.length);//ID of NodeNetwork matching ID of Cell

        //Liens
        let cell: Cell;
        for(let i in this.cells)
            this.createLinksToNeighbors(this.nodeNetwork, this.cells[i]);
    }

    /**
     * Create Links to all neighbors of a Cell, even not walkables, bidirectionnally if needed
     */
    private createLinksToNeighbors(nodeNetwork: NodeNetwork, cell: Cell, bidirectionnal = false) {
        let neighbors: Cell[];
        let neighbor: Cell;
        neighbors = this.getNeighborsCell(cell);
        for(let i in neighbors){
            neighbor = neighbors[i];
            nodeNetwork.newLink(cell.id, neighbor.id, 1);
            if(bidirectionnal)
                nodeNetwork.newLink(neighbor.id, cell.id, 1);
        }
    }

    /**
     * Called when the walkable value of a Cell is changed, redraw if testmode
     */
    public onCellEntitiesChanged(cell: Cell) { 
        //If testmode, redraw Cell
        if(isTestMode)
            this.drawGridAllCell(cell);
    }

    /**
     * Return a clone of the nodeNetwork, adding optionnally Cells of an Entity to walkable
     * NOT USED because it's too heavy to clone network each pathfinding
     */
    public getClonedNodeNetwork(entityWalkable?: Entity): NodeNetwork {
        //Clonage en poupée Russe
        let nodeNetwork = this.nodeNetwork.clone();

        //Réactivation d'une cellule si besoin
        if(entityWalkable !== undefined){
            //For all Cells
            let cell: Cell;
            for(let i in this.cells) {
                cell = this.cells[i];
                if(cell.containEntity(entityWalkable)){
                    //Delete Links bidirectionnaly
                    this.nodeNetwork.removeLinks(cell.id);
                    
                    //If walkable, create Link to neighbors walkable, bidirectionnally
                    this.createLinksToNeighbors(nodeNetwork, cell, true);
                }
            }
        }

        return nodeNetwork;
    }

    /**
     * Return the distance as the crow flies between 2 Cell by ID, this is an heuristic
     */
    public getHeuristicDistance(cellAID: number, cellBID: number): number {
        let cellA = this.cellByID(cellAID);
        assert(cellA != null, "cellA with id '"+cellAID+"' not found in cells, at getHeuristicDistance");
        let cellB = this.cellByID(cellBID);
        assert(cellB != null, "cellA with id '"+cellBID+"' not found in cells, at getHeuristicDistance");
        return cellA.hex.distance(cellB.hex);
    }
    
    /**
     * Return the cell corresponding with the id
     */
    private cellByID(id: number): Cell {
        return this.cells[id];
    }

    /**
     * Return an array of Cell corresponding to the array of cell id
     */
    public cellsOfID(ids: number[]): Cell[] {
        let cells: Cell[] = [];
        for(let i in ids)
            cells.push(this.cellByID(ids[i]));
        return cells;
    }

    //*** Cell Selection ***

    /**
     * Return the Cell at a given Hex, or null
     */
    public cellAt(hex: Hex): Cell {
        for(let i in this.cells)
            if(this.cells[i].hex.equal(hex))
                return this.cells[i];
        return null;
    }

    /**
     * Return the Cells containing the Entity on it
     */
    public getCellsContainingEntity(entity: Entity): Cell[] {
        let cells: Cell[] = [];
        for(let i in this.cells)
            if(this.cells[i].containEntity(entity))
                cells.push(this.cells[i]);
        
        return cells;
    }

    /**
     * Change the selectable attribute for the given Cells and redraw
     */
    public setSelectableCells(cells: Cell[], selectable: boolean) {
        if(cells.length > 0) {
            //Selectable
            for(let i in cells)
                cells[i].setSelectable(selectable);

            //Redraw
            this.drawGridSelectable();
        }
    }

    /**
     * Set the Hex around a Hex selectable
     */
    public setSelectableCellsAround(hex: Hex, fromRadius: number, radius: number) {
        let hexs = hex.getDisk(fromRadius, radius);
        let cell: Cell;
        for(let i in hexs){
            cell = this.cellAt(hexs[i]);
            if(cell != null)
                cell.setSelectable(true);
        }
        //Redraw
        this.drawGridSelectable();
    }

    /**
     * Change la cellule séléctionné sous le curseur, et la renvoi
     */
    public setSelectedCellOn(coordinate: Phaser.Point): Cell {
        //New cell
        let cell: Cell = this.getCellOn(coordinate);
        
        //If cell is changed
        if(cell != this.cellSelected){
            //Unselect
            if(this.cellSelected != null){
                this.cellSelected.setSelected(false);
                this.cellSelected = null;
            }
            //Select
            if(cell != null && cell.isSelectable()){
                cell.setSelected(true);
                this.cellSelected = cell;
            }
        }

        return this.cellSelected;
    }

    /**
     * Return the Cell below the coordinate, or null if none
     */
    public getCellOn(coordinate: Phaser.Point): Cell {
        let cell: Cell = null;
        let hex = GridTools.pixelToHex(this.layout, coordinate);
        if(hex != null)
            cell = this.cellAt(hex);
        
        return cell;
    }

    /**
     * Called when a Cell selected attribute has changed
     */
    public onCellSelectedChanged(cell: Cell) {
        //Position
        if(cell.isSelected())
            this.cellSelectedGraphics.position.setTo(cell.coordinates.center.x, cell.coordinates.center.y);

        //Visibility
        this.cellSelectedGraphics.visible = cell.isSelected();
    }
}
