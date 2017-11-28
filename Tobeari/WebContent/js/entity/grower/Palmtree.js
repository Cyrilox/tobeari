var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The palmtree.
 */
var Palmtree = (function (_super) {
    __extends(Palmtree, _super);
    function Palmtree(map, controller, cell) {
        _super.call(this, map, controller, cell, conf["palmtree"]["sizecells"], conf["palmtree"]["sizesprite"], 'palmtree', true, false, false);
        //Random rotation
        this.group.rotation = Tools.getRandomRadianAngle();
    }
    return Palmtree;
}(Entity));
