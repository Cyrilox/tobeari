/**
 * Unidirectionnal NetLink
 */
class NetLink {
    
    constructor(public nodeStart: NetNode, public nodeEnd: NetNode, public weight: number) {
        
    }

    public clone(): NetLink {
        return new NetLink(this.nodeStart, this.nodeEnd, this.weight);
    }
}