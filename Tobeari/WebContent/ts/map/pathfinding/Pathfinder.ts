/**
 * A pathfinder
 */
class Pathfinder {
    private nodeNetwork: NodeNetwork;
    private astar: Astar;

    constructor(private map: Map) {
        this.nodeNetwork = this.map.nodeNetwork;
        this.astar = new Astar(this);
    }

    /**
     * Search a path to a Cell and return it, or null if not reachable
     * Optionnaly allow to walk Entity Cells, for example for the Entity wanting to walk in his own Cells
     */
    public find(start: Cell, end: Cell, entityWalkable?: Entity): Cell[] {
        //Noeuds parcourable exceptionnellement
        let nodesWalkable: number[] = [];
        if(entityWalkable !== undefined) {
            let cellsWalkable = this.map.getCellsContainingEntity(entityWalkable);
            for(let i in cellsWalkable)
                nodesWalkable.push(cellsWalkable[i].id);
        }

        let pathID: number[] = this.astar.find(start.id, end.id, nodesWalkable);

        let path: Cell[] = pathID != null ? this.map.cellsOfID(pathID) : null;

        return path;
    }
    
    /**
     * Return the neighbors nodes walkable to, optionnaly with nodes allowed
     */
    public getWalkableNeighbors(node: number, nodesWalkable: number[]): number[] {
        let neighborsCells = this.map.cellsOfID(this.nodeNetwork.getNeighbors(node));
        let walkableNeighbors: number[] = [];
        let cell: Cell;
        for(let i in neighborsCells){
            cell = neighborsCells[i];
            if(cell.isWalkable() || Tools.inArray(nodesWalkable, cell.id))
                walkableNeighbors.push(cell.id);
        }

        return walkableNeighbors;
    }

    /**
     * Return the weight to travel between 2 nodes
     */
    public getWeight(nodeA: number, nodeB: number): number {
        return this.nodeNetwork.getWeight(nodeA, nodeB);
    }

    /**
     * Return the heuristic distance between 2 nodes
     */
    public getHeuristicDistance(nodeA: number, nodeB: number): number {
        return this.map.getHeuristicDistance(nodeA, nodeB);
    }
}