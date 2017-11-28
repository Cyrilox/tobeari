/**
 * Astar
 */
var Astar = (function () {
    function Astar(pathfinder) {
        this.pathfinder = pathfinder;
    }
    /**
     * Search a path from start to a goal, traveling on walkable, optionnally allowing nodes even if not walkables
     */
    Astar.prototype.find = function (start, goal, nodesWalkable) {
        var frontier = new FastPriorityQueue(function (a, b) {
            return a.priority < b.priority;
        });
        frontier.add(new AstarNode(start, 0));
        var cameFrom = {};
        var costSoFar = {};
        cameFrom[start] = null;
        costSoFar[start] = 0;
        var current, next, newCost, priority;
        var neighbors;
        //Tant qu'il reste des noeuds à explorer à la frontière
        while (!frontier.isEmpty()) {
            current = frontier.pop().id;
            //Le noeud objectif est atteint
            if (current == goal)
                break; //Sortie de boucle
            //Pour tous les noeuds voisins
            neighbors = this.pathfinder.getWalkableNeighbors(current, nodesWalkable);
            for (var i in neighbors) {
                next = neighbors[i];
                //Le coût total pour arriver à ce noeud voisin
                newCost = costSoFar[current] + this.pathfinder.getWeight(current, next);
                //Si il est plus faible
                if (costSoFar[next] === undefined || newCost < costSoFar[next]) {
                    //Sauvegarde de celui-ci
                    costSoFar[next] = newCost;
                    priority = newCost + this.pathfinder.getHeuristicDistance(goal, next);
                    frontier.add(new AstarNode(next, priority));
                    cameFrom[next] = current;
                }
            }
        }
        //Si un chemin a été trouvé, on le renvoi reconstruit
        return cameFrom[goal] !== undefined ? this.reconstruct(cameFrom, start, goal) : null;
    };
    /**
     * Create the path from the start to the goal, the camefrom should be a valid path
     */
    Astar.prototype.reconstruct = function (cameFrom, start, goal) {
        var current = goal;
        var path = [current];
        while (current != start) {
            current = cameFrom[current];
            path.push(current);
        }
        path.reverse();
        return path;
    };
    return Astar;
}());
/**
 * AstarNode
 */
var AstarNode = (function () {
    function AstarNode(id, priority) {
        this.id = id;
        this.priority = priority;
    }
    return AstarNode;
}());
