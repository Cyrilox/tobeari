/*
 * A score data.
 * @class ScoreData
 * @contructor
 */
function ScoreData(ranking, points, player, date){

	this.toArray = function() {
		var dateStr = this.date.toLocaleDateString();
		return [this.ranking, this.points, this.player, dateStr];
	};
	
	//Return a savable array
	this.getSavableArray = function() {
		return [this.ranking, this.points, this.player, this.date.getTime()];
	};
	
	//Set the current datas from a savable array
	this.setSavableArray = function(savableArray) {
		this.ranking = savableArray[0];
		this.points = savableArray[1];
		this.player = savableArray[2];
		this.date = new Date(savableArray[3]);
	};
	
	this.ranking = ranking;
	this.points = points;
	this.player = player;
	this.date = date;
}