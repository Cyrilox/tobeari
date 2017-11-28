/**
 * NetNode
 */
class NetNode {
    private links: NetLink[] = [];
    
    constructor(public id: number) {
        
    }

    /**
     * Create a unidirectionnal new Link to a NetNode, with a weight, duplication possible
     */
    public newLink(node: NetNode, weight: number) {
        this.links.push(new NetLink(this, node, weight));
    }

    /**
     * Add the NetLink to this Node
     */
    public addLink(link: NetLink) {
        this.links.push(link);
    }

    /**
     * Remove all Links of this Node, bidirectionnaly
     */
    public removeLinksBidirectionnaly() {
        //Removing to -> from
        let link: NetLink;
        for(let i in this.links){
            link = this.links[i];
            link.nodeEnd.removeLinkTo(this);
        }
        //Removing from -> to
        this.links = [];
    }

    /**
     * Remove a Link to a Node
     */
    public removeLinkTo(node: NetNode) {
        for(let i in this.links){
            if(this.links[i].nodeEnd == node){
                this.links.splice(parseInt(i), 1);
                break;
            }
        }
    }
    
    /**
     * Return the neighbors of this NetNode, by ID
     */
    public getNeighbors(): number[] {
        let neighbors: number[] = [];
        for(let i in this.links)
            neighbors.push(this.links[i].nodeEnd.id);
        
        return neighbors;
    }

    /**
     * Return a Link to a neighbor, or Throw exception if no Link exist
     */
    private getLink(neighborID: number): NetLink {
        let link: NetLink;
        for(let i in this.links) {
            link = this.links[i];
            if(link.nodeEnd.id == neighborID)
                return link;
        }
        throw "Neighbor with id '"+neighborID+"' can't be found in neighbors of Node with id '"+this.id+"'";
    }

    /**
     * Return the neighbor of this NetNode, or Throw exception if no Link exist
     */
    private getNeighbor(neighborID: number): NetNode {
        return this.getLink(neighborID).nodeEnd;
    }

    /**
     * Return the weight of travel to a neighbor of this Node, or Throw exception if no Link exist
     */
    public getWeight(neighborID: number): number {
        return this.getLink(neighborID).weight;
    }

    public clone(): NetNode {
        let node: NetNode = new NetNode(this.id);
        for(let i in this.links)
            node.addLink(this.links[i].clone());

        return node;
    }
}