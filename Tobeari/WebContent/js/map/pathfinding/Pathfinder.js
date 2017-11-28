/**
 * A pathfinder
 */
var Pathfinder = (function () {
    function Pathfinder(map) {
        this.map = map;
        this.nodeNetwork = this.map.nodeNetwork;
        this.astar = new Astar(this);
    }
    /**
     * Search a path to a Cell and return it, or null if not reachable
     * Optionnaly allow to walk Entity Cells, for example for the Entity wanting to walk in his own Cells
     */
    Pathfinder.prototype.find = function (start, end, entityWalkable) {
        //Noeuds parcourable exceptionnellement
        var nodesWalkable = [];
        if (entityWalkable !== undefined) {
            var cellsWalkable = this.map.getCellsContainingEntity(entityWalkable);
            for (var i in cellsWalkable)
                nodesWalkable.push(cellsWalkable[i].id);
        }
        var pathID = this.astar.find(start.id, end.id, nodesWalkable);
        var path = pathID != null ? this.map.cellsOfID(pathID) : null;
        return path;
    };
    /**
     * Return the neighbors nodes walkable to, optionnaly with nodes allowed
     */
    Pathfinder.prototype.getWalkableNeighbors = function (node, nodesWalkable) {
        var neighborsCells = this.map.cellsOfID(this.nodeNetwork.getNeighbors(node));
        var walkableNeighbors = [];
        var cell;
        for (var i in neighborsCells) {
            cell = neighborsCells[i];
            if (cell.isWalkable() || Tools.inArray(nodesWalkable, cell.id))
                walkableNeighbors.push(cell.id);
        }
        return walkableNeighbors;
    };
    /**
     * Return the weight to travel between 2 nodes
     */
    Pathfinder.prototype.getWeight = function (nodeA, nodeB) {
        return this.nodeNetwork.getWeight(nodeA, nodeB);
    };
    /**
     * Return the heuristic distance between 2 nodes
     */
    Pathfinder.prototype.getHeuristicDistance = function (nodeA, nodeB) {
        return this.map.getHeuristicDistance(nodeA, nodeB);
    };
    return Pathfinder;
}());
