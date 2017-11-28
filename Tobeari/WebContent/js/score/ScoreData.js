/**
 * A score data.
 */
var ScoreData = (function () {
    function ScoreData(ranking, points, player, date) {
        this.ranking = ranking;
        this.points = points;
        this.player = player;
        this.date = date;
    }
    ScoreData.prototype.toArray = function () {
        var dateStr = this.date.toLocaleDateString();
        return [this.ranking, this.points, this.player, dateStr];
    };
    //Return a savable array
    ScoreData.prototype.getSavableArray = function () {
        return [this.ranking, this.points, this.player, this.date.getTime()];
    };
    //Set the current datas from a savable array	
    ScoreData.prototype.setSavableArray = function (values) {
        this.ranking = values[0];
        this.points = values[1];
        this.player = values[2];
        this.date = new Date(values[3]);
    };
    return ScoreData;
}());
