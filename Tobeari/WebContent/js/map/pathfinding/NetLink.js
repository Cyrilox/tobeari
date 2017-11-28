/**
 * Unidirectionnal NetLink
 */
var NetLink = (function () {
    function NetLink(nodeStart, nodeEnd, weight) {
        this.nodeStart = nodeStart;
        this.nodeEnd = nodeEnd;
        this.weight = weight;
    }
    NetLink.prototype.clone = function () {
        return new NetLink(this.nodeStart, this.nodeEnd, this.weight);
    };
    return NetLink;
}());
