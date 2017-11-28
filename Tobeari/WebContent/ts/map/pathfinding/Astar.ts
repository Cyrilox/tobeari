/**
 * Astar
 */
class Astar {
    
    constructor(private pathfinder: Pathfinder) {
        
    }

    /**
     * Search a path from start to a goal, traveling on walkable, optionnally allowing nodes even if not walkables
     */
    public find(start: number, goal: number, nodesWalkable: number[]): number[] {
        let frontier = new FastPriorityQueue(function(a: AstarNode, b: AstarNode) {
            return a.priority < b.priority;
        });
        frontier.add(new AstarNode(start, 0));
        let cameFrom: any = {};
        let costSoFar: any = {};
        cameFrom[start] = null;
        costSoFar[start] = 0;

        let current: number,  next: number, newCost: number, priority: number;
        let neighbors: number[];
        //Tant qu'il reste des noeuds à explorer à la frontière
        while(!frontier.isEmpty()) {
            current = frontier.pop().id;

            //Le noeud objectif est atteint
            if(current == goal)
                break;//Sortie de boucle
            
            //Pour tous les noeuds voisins
            neighbors = this.pathfinder.getWalkableNeighbors(current, nodesWalkable);
            for(let i in neighbors){
                next = neighbors[i];
                //Le coût total pour arriver à ce noeud voisin
                newCost = costSoFar[current] + this.pathfinder.getWeight(current, next);
                //Si il est plus faible
                if(costSoFar[next] === undefined || newCost < costSoFar[next]){
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
    }

    /**
     * Create the path from the start to the goal, the camefrom should be a valid path
     */
    private reconstruct(cameFrom: number[], start: number, goal: number): number[] {
        let current = goal;
        let path = [current];
        while(current != start) {
            current = cameFrom[current];
            path.push(current);
        }
        path.reverse();

        return path;
    }
}

/**
 * AstarNode
 */
class AstarNode {

    constructor(public id: number, public priority: number) {
        
    }
}