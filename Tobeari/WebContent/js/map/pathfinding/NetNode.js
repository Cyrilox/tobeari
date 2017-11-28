/**
 * NetNode
 */
var NetNode = (function () {
    function NetNode(id) {
        this.id = id;
        this.links = [];
    }
    /**
     * Create a unidirectionnal new Link to a NetNode, with a weight, duplication possible
     */
    NetNode.prototype.newLink = function (node, weight) {
        this.links.push(new NetLink(this, node, weight));
    };
    /**
     * Add the NetLink to this Node
     */
    NetNode.prototype.addLink = function (link) {
        this.links.push(link);
    };
    /**
     * Remove all Links of this Node, bidirectionnaly
     */
    NetNode.prototype.removeLinksBidirectionnaly = function () {
        //Removing to -> from
        var link;
        for (var i in this.links) {
            link = this.links[i];
            link.nodeEnd.removeLinkTo(this);
        }
        //Removing from -> to
        this.links = [];
    };
    /**
     * Remove a Link to a Node
     */
    NetNode.prototype.removeLinkTo = function (node) {
        for (var i in this.links) {
            if (this.links[i].nodeEnd == node) {
                this.links.splice(parseInt(i), 1);
                break;
            }
        }
    };
    /**
     * Return the neighbors of this NetNode, by ID
     */
    NetNode.prototype.getNeighbors = function () {
        var neighbors = [];
        for (var i in this.links)
            neighbors.push(this.links[i].nodeEnd.id);
        return neighbors;
    };
    /**
     * Return a Link to a neighbor, or Throw exception if no Link exist
     */
    NetNode.prototype.getLink = function (neighborID) {
        var link;
        for (var i in this.links) {
            link = this.links[i];
            if (link.nodeEnd.id == neighborID)
                return link;
        }
        throw "Neighbor with id '" + neighborID + "' can't be found in neighbors of Node with id '" + this.id + "'";
    };
    /**
     * Return the neighbor of this NetNode, or Throw exception if no Link exist
     */
    NetNode.prototype.getNeighbor = function (neighborID) {
        return this.getLink(neighborID).nodeEnd;
    };
    /**
     * Return the weight of travel to a neighbor of this Node, or Throw exception if no Link exist
     */
    NetNode.prototype.getWeight = function (neighborID) {
        return this.getLink(neighborID).weight;
    };
    NetNode.prototype.clone = function () {
        var node = new NetNode(this.id);
        for (var i in this.links)
            node.addLink(this.links[i].clone());
        return node;
    };
    return NetNode;
}());
