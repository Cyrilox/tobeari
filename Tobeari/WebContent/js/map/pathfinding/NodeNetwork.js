/**
 * NodeNetwork, abstraction layer between Map and Pathfinding, communicating only by numbers, Node ID and Link weight
 */
var NodeNetwork = (function () {
    function NodeNetwork(size) {
        if (size === void 0) { size = 0; }
        this.nodes = [];
        //Array node id == node id
        for (var id = 0; id < size; id++)
            this.newNode(id);
    }
    /**
     * Create and add a new NetNode with the current number of nodes as ID
     */
    NodeNetwork.prototype.newNode = function (id) {
        this.nodes.push(new NetNode(id));
    };
    /**
     * Add the NetNode to this Node
     */
    NodeNetwork.prototype.addNode = function (node) {
        this.nodes.push(node);
    };
    /**
     * Create and add a new NetLink between 2 NetNode, unidirectionnal and with a weight
     */
    NodeNetwork.prototype.newLink = function (nodeStartID, nodeEndID, weight) {
        var nodeStart = this.getNode(nodeStartID);
        assert(nodeStart != null, "Can't find NetNode with id '" + nodeStartID + "' when creating new link");
        var nodeEnd = this.getNode(nodeEndID);
        assert(nodeEnd != null, "Can't find NetNode with id '" + nodeEndID + "' when creating new link");
        nodeStart.newLink(nodeEnd, weight);
    };
    /**
     * Remove all Links of a Node, bidirectionnally
     */
    NodeNetwork.prototype.removeLinks = function (nodeID) {
        //Node
        var node = this.getNode(nodeID);
        assert(node != null, "Cannot find Node with id '" + nodeID + "' when removing Links");
        //Removing bidirectionnally
        node.removeLinksBidirectionnaly();
    };
    /**
     * Return the neighbors ID of the given NetNode
     */
    NodeNetwork.prototype.getNeighbors = function (id) {
        var node = this.getNode(id);
        assert(node != null, "Can't find NetNode with id '" + id + "' when getting neighbors");
        return node.getNeighbors();
    };
    /**
     * Return the weight of travel between 2 Linked NetNode
     */
    NodeNetwork.prototype.getWeight = function (nodeStartID, nodeEndID) {
        var nodeStart = this.getNode(nodeStartID);
        assert(nodeStart != null, "Can't find NetNode with id '" + nodeStartID + "' when getting cost");
        return nodeStart.getWeight(nodeEndID);
    };
    /**
     * Return the NetNode with the given ID, or null
     */
    NodeNetwork.prototype.getNode = function (id) {
        return this.nodes[id];
    };
    NodeNetwork.prototype.clone = function () {
        var nodeNetwork = new NodeNetwork();
        for (var i in this.nodes)
            nodeNetwork.addNode(this.nodes[i].clone());
        return nodeNetwork;
    };
    return NodeNetwork;
}());
