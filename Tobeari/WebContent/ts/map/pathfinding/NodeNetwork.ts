/**
 * NodeNetwork, abstraction layer between Map and Pathfinding, communicating only by numbers, Node ID and Link weight
 */
class NodeNetwork {
    private nodes: NetNode[] = [];

    constructor(size: number = 0) {
        //Array node id == node id
        for(let id=0; id<size; id++)
            this.newNode(id);
    }

    /**
     * Create and add a new NetNode with the current number of nodes as ID
     */
    private newNode(id: number) {
        this.nodes.push(new NetNode(id));
    }

    /**
     * Add the NetNode to this Node
     */
    public addNode(node: NetNode) {
        this.nodes.push(node);
    }
    
    /**
     * Create and add a new NetLink between 2 NetNode, unidirectionnal and with a weight
     */
    public newLink(nodeStartID: number, nodeEndID: number, weight: number) {
        let nodeStart: NetNode = this.getNode(nodeStartID);
        assert(nodeStart != null, "Can't find NetNode with id '"+nodeStartID+"' when creating new link");

        let nodeEnd: NetNode = this.getNode(nodeEndID);
        assert(nodeEnd != null, "Can't find NetNode with id '"+nodeEndID+"' when creating new link");

        nodeStart.newLink(nodeEnd, weight);
    }

    /**
     * Remove all Links of a Node, bidirectionnally
     */
    public removeLinks(nodeID: number) {
        //Node
        let node = this.getNode(nodeID);
        assert(node != null, "Cannot find Node with id '"+nodeID+"' when removing Links");
        //Removing bidirectionnally
        node.removeLinksBidirectionnaly();
    }

    /**
     * Return the neighbors ID of the given NetNode
     */
    public getNeighbors(id: number): number[] {
        let node: NetNode = this.getNode(id);
        assert(node != null, "Can't find NetNode with id '"+id+"' when getting neighbors");

        return node.getNeighbors();
    }

    /**
     * Return the weight of travel between 2 Linked NetNode
     */
    public getWeight(nodeStartID: number, nodeEndID: number): number {
        let nodeStart: NetNode = this.getNode(nodeStartID);
        assert(nodeStart != null, "Can't find NetNode with id '"+nodeStartID+"' when getting cost");

        return nodeStart.getWeight(nodeEndID);
    }
    
    /**
     * Return the NetNode with the given ID, or null
     */
    private getNode(id: number): NetNode {
        return this.nodes[id];
    }

    public clone(): NodeNetwork {
        let nodeNetwork = new NodeNetwork();
        for(let i in this.nodes)
            nodeNetwork.addNode(this.nodes[i].clone());

        return nodeNetwork;
    }
}