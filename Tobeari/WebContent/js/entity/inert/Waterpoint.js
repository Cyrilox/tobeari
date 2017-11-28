var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The waterpoint.
 */
var Waterpoint = (function (_super) {
    __extends(Waterpoint, _super);
    function Waterpoint(map, controller, cell) {
        _super.call(this, map, controller, cell, conf["waterpoint"]["sizecells"], conf["waterpoint"]["sizesprite"], 'waterhole', true, true, false);
        //Random rotation
        this.group.rotation = Tools.getRandomRadianAngle();
    }
    return Waterpoint;
}(Entity));
