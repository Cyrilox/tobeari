/**
 * InertManager
 */
var InertManager = (function () {
    function InertManager(map, controller, predator) {
        var ringCells = map.getRingCells(predator.cell, conf["inertmanager"]["oasisdistance"], false);
        var ringPos = Tools.getRandomArbitrary(0, ringCells.length, true);
        var oasisCell = ringCells[ringPos];
        this.waterpoint = new Waterpoint(map, controller, oasisCell);
    }
    return InertManager;
}());
