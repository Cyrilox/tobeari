/**
 * A Map composed of Cell
 */
var Map = (function () {
    function Map() {
        //Cells, in numbers
        this.cellsX = 20; //35;
        this.cellsY = 15; //23;
        this.cellsYVisible = 11; //13;
        this.cellSelected = null;
        this.center = null;
        this.perimeter = [];
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
        if (isTestMode)
            this.drawGridAll();
        this.drawGridSelectable();
        this.drawCellSelectedGraphics();
    }
    /**
     * Crée le Layout et les Cell
     */
    Map.prototype.createGrid = function () {
        //Diagonal / Edge
        var cellEdge, pointyCellYCount, flattyCellYCount, sideYCountVisible; //Variables verticales
        pointyCellYCount = (this.cellsYVisible + 1) / 2;
        flattyCellYCount = this.cellsYVisible - pointyCellYCount;
        sideYCountVisible = pointyCellYCount * 2 + flattyCellYCount;
        cellEdge = g.world.height / sideYCountVisible;
        var pointyCellYCountTotal, flattyCellYCountTotal, sideYCountTotal;
        pointyCellYCountTotal = (this.cellsY + 1) / 2;
        flattyCellYCountTotal = this.cellsY - pointyCellYCountTotal;
        sideYCountTotal = pointyCellYCountTotal * 2 + flattyCellYCountTotal;
        Cell.init(cellEdge);
        //Apotheme (segment perpendiculaire à un coté, jusqu'au centre)
        var cellApothem = cellEdge * Math.sqrt(3) / 2;
        //Centering with a shift
        var origin, width, height;
        width = cellApothem * 2 * this.cellsX;
        height = sideYCountTotal * cellEdge;
        origin = new Phaser.Point();
        origin.x = (g.world.width - width) / 2 + cellApothem;
        origin.y = (g.world.height - height) / 2 + cellEdge;
        //Layout creation
        var orientation, size;
        orientation = Orientation.LAYOUT_POINTY;
        size = new Point(cellEdge, cellEdge);
        this.layout = new Layout(orientation, size, origin);
        //Cells creation, with Hex into them, array position == Cell id
        this.cells = [];
        var hex;
        var cell;
        var id = 0;
        for (var y = 0; y < this.cellsY; y++) {
            var yOffset = Math.floor(y / 2);
            for (var x = -yOffset; x < this.cellsX - yOffset; x++) {
                hex = new Hex(x, y, -x - y);
                cell = new Cell(id, this, hex, this.layout, cellEdge, cellApothem);
                this.cells.push(cell);
                id++;
            }
        }
        //Cache
        this.setCenter();
        this.setPerimeter();
    };
    //*** Drawing ***
    /**
     * Trace la grille entière
     */
    Map.prototype.drawGridAll = function () {
        //Start
        this.gridAllGraphics.clear();
        //Cells
        for (var i in this.cells)
            this.cells[i].draw(this.gridAllGraphics);
    };
    /**
     * Trace une cellule de la grille
     */
    Map.prototype.drawGridAllCell = function (cell) {
        //Erase
        cell.clear(this.gridAllGraphics);
        //Cells
        cell.draw(this.gridAllGraphics);
    };
    /**
     * Trace la grille sélectionnable
     */
    Map.prototype.drawGridSelectable = function () {
        //Start
        this.gridSelectableGraphics.clear();
        //Cells
        for (var i in this.cells)
            if (this.cells[i].isSelectable())
                this.cells[i].draw(this.gridSelectableGraphics);
    };
    /**
     * Trace la cellule séléctionnée
     */
    Map.prototype.drawCellSelectedGraphics = function () {
        //Move coordinates to origin [0, 0]
        var coordinates = this.cells[0].coordinates.clone();
        coordinates.moveToOrigin();
        //Draw
        this.cells[0].draw(this.cellSelectedGraphics, true, coordinates);
    };
    //*** Getters, Setters ***
    /**
     * Return the Hex at the center of the visible area
     */
    Map.prototype.setCenter = function () {
        var y = Math.floor((this.cellsY - 1) / 2);
        var x = Math.floor((this.cellsX - 1) / 2) - Math.floor(y / 2);
        var hex = new Hex(x, y);
        this.center = this.cellAt(hex);
    };
    /**
     * Define the cells at the perimeter
     */
    Map.prototype.setPerimeter = function () {
        this.perimeter = [];
        var maxX;
        var offset;
        var cell;
        for (var y = 0; y < this.cellsY; y++) {
            offset = Math.floor(y / 2);
            maxX = this.cellsX - offset - 1;
            for (var x = -offset; x <= maxX; x++) {
                if (y == 0 || y == this.cellsY - 1 || x == -offset || x == maxX) {
                    cell = this.cellAt(new Hex(x, y));
                    this.perimeter.push(cell);
                }
            }
        }
    };
    /**
     * Return a random walkable Cell, or null if no one
     */
    Map.prototype.getRandomWalkableCell = function () {
        var cellsShuffled = Tools.shuffle(Tools.clone(this.cells));
        var cell;
        for (var i in cellsShuffled) {
            cell = cellsShuffled[i];
            if (cell != null && cell.isWalkable())
                return cell;
        }
        return null;
    };
    /**
     * Return a walkable cell around a Cell, at a radius
     */
    Map.prototype.getRandomRingEmptyCell = function (cell, radius) {
        var cells = this.getRingCells(cell, radius, true);
        return cells[Tools.getRandomArbitrary(0, cells.length, true)];
    };
    /**
     * Return cells around a Cell, at a radius, walkable and notSelectable optionnaly
     */
    Map.prototype.getRingCells = function (cell, radius, walkable, notSelectable) {
        if (notSelectable === void 0) { notSelectable = false; }
        var cells = [];
        var hexs = cell.hex.getRing(radius);
        var cellRing;
        for (var i in hexs) {
            cellRing = this.cellAt(hexs[i]);
            if (cellRing != null && (!walkable || cellRing.isWalkable()) && (!notSelectable || !cellRing.isSelectable()))
                cells.push(cellRing);
        }
        return cells;
    };
    /**
     * Return a random walkable Cell at the perimeter of the Map
     */
    Map.prototype.getRandomPerimeterCell = function () {
        //Random
        var cells = Tools.shuffle(this.perimeter.slice());
        //Empty
        for (var i in cells)
            if (cells[i].isWalkable())
                return cells[i];
        return null;
    };
    /**
     * Return all neighbors Hex at a Hex coordinate, even not walkables
     */
    Map.prototype.getNeighborsHex = function (hex) {
        var neighborsCell = this.getNeighborsCell(this.cellAt(hex));
        var neighborsHex = [];
        for (var i in neighborsCell)
            neighborsHex.push(neighborsCell[i].hex);
        return neighborsHex;
    };
    /**
     * Return all neighbors of a Cell, even not walkables
     */
    Map.prototype.getNeighborsCell = function (cell) {
        var neighborsHex = cell.hex.neighbors();
        var neighborsCell = [];
        var neighborCell;
        for (var i in neighborsHex) {
            neighborCell = this.cellAt(neighborsHex[i]);
            if (neighborCell != null)
                neighborsCell.push(neighborCell);
        }
        return neighborsCell;
    };
    //*** Pathfinding ***
    /**
     * Create the NodeNetwork of paths, even for no walkables, all weighted 1
     */
    Map.prototype.createNodeNetwork = function () {
        //Noeuds
        this.nodeNetwork = new NodeNetwork(this.cells.length); //ID of NodeNetwork matching ID of Cell
        //Liens
        var cell;
        for (var i in this.cells)
            this.createLinksToNeighbors(this.nodeNetwork, this.cells[i]);
    };
    /**
     * Create Links to all neighbors of a Cell, even not walkables, bidirectionnally if needed
     */
    Map.prototype.createLinksToNeighbors = function (nodeNetwork, cell, bidirectionnal) {
        if (bidirectionnal === void 0) { bidirectionnal = false; }
        var neighbors;
        var neighbor;
        neighbors = this.getNeighborsCell(cell);
        for (var i in neighbors) {
            neighbor = neighbors[i];
            nodeNetwork.newLink(cell.id, neighbor.id, 1);
            if (bidirectionnal)
                nodeNetwork.newLink(neighbor.id, cell.id, 1);
        }
    };
    /**
     * Called when the walkable value of a Cell is changed, redraw if testmode
     */
    Map.prototype.onCellEntitiesChanged = function (cell) {
        //If testmode, redraw Cell
        if (isTestMode)
            this.drawGridAllCell(cell);
    };
    /**
     * Return a clone of the nodeNetwork, adding optionnally Cells of an Entity to walkable
     * NOT USED because it's too heavy to clone network each pathfinding
     */
    Map.prototype.getClonedNodeNetwork = function (entityWalkable) {
        //Clonage en poupée Russe
        var nodeNetwork = this.nodeNetwork.clone();
        //Réactivation d'une cellule si besoin
        if (entityWalkable !== undefined) {
            //For all Cells
            var cell = void 0;
            for (var i in this.cells) {
                cell = this.cells[i];
                if (cell.containEntity(entityWalkable)) {
                    //Delete Links bidirectionnaly
                    this.nodeNetwork.removeLinks(cell.id);
                    //If walkable, create Link to neighbors walkable, bidirectionnally
                    this.createLinksToNeighbors(nodeNetwork, cell, true);
                }
            }
        }
        return nodeNetwork;
    };
    /**
     * Return the distance as the crow flies between 2 Cell by ID, this is an heuristic
     */
    Map.prototype.getHeuristicDistance = function (cellAID, cellBID) {
        var cellA = this.cellByID(cellAID);
        assert(cellA != null, "cellA with id '" + cellAID + "' not found in cells, at getHeuristicDistance");
        var cellB = this.cellByID(cellBID);
        assert(cellB != null, "cellA with id '" + cellBID + "' not found in cells, at getHeuristicDistance");
        return cellA.hex.distance(cellB.hex);
    };
    /**
     * Return the cell corresponding with the id
     */
    Map.prototype.cellByID = function (id) {
        return this.cells[id];
    };
    /**
     * Return an array of Cell corresponding to the array of cell id
     */
    Map.prototype.cellsOfID = function (ids) {
        var cells = [];
        for (var i in ids)
            cells.push(this.cellByID(ids[i]));
        return cells;
    };
    //*** Cell Selection ***
    /**
     * Return the Cell at a given Hex, or null
     */
    Map.prototype.cellAt = function (hex) {
        for (var i in this.cells)
            if (this.cells[i].hex.equal(hex))
                return this.cells[i];
        return null;
    };
    /**
     * Return the Cells containing the Entity on it
     */
    Map.prototype.getCellsContainingEntity = function (entity) {
        var cells = [];
        for (var i in this.cells)
            if (this.cells[i].containEntity(entity))
                cells.push(this.cells[i]);
        return cells;
    };
    /**
     * Change the selectable attribute for the given Cells and redraw
     */
    Map.prototype.setSelectableCells = function (cells, selectable) {
        if (cells.length > 0) {
            //Selectable
            for (var i in cells)
                cells[i].setSelectable(selectable);
            //Redraw
            this.drawGridSelectable();
        }
    };
    /**
     * Set the Hex around a Hex selectable
     */
    Map.prototype.setSelectableCellsAround = function (hex, fromRadius, radius) {
        var hexs = hex.getDisk(fromRadius, radius);
        var cell;
        for (var i in hexs) {
            cell = this.cellAt(hexs[i]);
            if (cell != null)
                cell.setSelectable(true);
        }
        //Redraw
        this.drawGridSelectable();
    };
    /**
     * Change la cellule séléctionné sous le curseur, et la renvoi
     */
    Map.prototype.setSelectedCellOn = function (coordinate) {
        //New cell
        var cell = this.getCellOn(coordinate);
        //If cell is changed
        if (cell != this.cellSelected) {
            //Unselect
            if (this.cellSelected != null) {
                this.cellSelected.setSelected(false);
                this.cellSelected = null;
            }
            //Select
            if (cell != null && cell.isSelectable()) {
                cell.setSelected(true);
                this.cellSelected = cell;
            }
        }
        return this.cellSelected;
    };
    /**
     * Return the Cell below the coordinate, or null if none
     */
    Map.prototype.getCellOn = function (coordinate) {
        var cell = null;
        var hex = GridTools.pixelToHex(this.layout, coordinate);
        if (hex != null)
            cell = this.cellAt(hex);
        return cell;
    };
    /**
     * Called when a Cell selected attribute has changed
     */
    Map.prototype.onCellSelectedChanged = function (cell) {
        //Position
        if (cell.isSelected())
            this.cellSelectedGraphics.position.setTo(cell.coordinates.center.x, cell.coordinates.center.y);
        //Visibility
        this.cellSelectedGraphics.visible = cell.isSelected();
    };
    return Map;
}());
