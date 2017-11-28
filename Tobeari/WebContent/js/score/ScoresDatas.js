/**
 * The scores datas.
 */
var ScoresDatas = (function () {
    function ScoresDatas() {
        this.all = [];
        this.bestScore = 0;
        //Local storage loading
        this.load();
    }
    //A score: Ranking, Points, actual player name, Date
    ScoresDatas.prototype.add = function (points) {
        //Creation
        var date = new Date();
        var score = new ScoreData(-1, points, playerName, date);
        this.all.push(score);
        //Sorting
        this.all.sort(this.sortComparisonDate);
        this.all.sort(this.sortComparisonScore);
        this.updateRanking();
        //Best score
        if (points > this.bestScore)
            this.bestScore = points;
        //Local storage saving
        this.save();
    };
    ScoresDatas.prototype.getTop = function (amount) {
        amount = Math.min(this.all.length, amount);
        var topScores = [], date;
        for (var i = 0; i < amount; i++)
            topScores[i] = this.all[i].toArray();
        return topScores;
    };
    /**
     * Reset all scores
     */
    ScoresDatas.prototype.reset = function () {
        this.all = [];
        this.bestScore = 0;
        this.save();
    };
    ScoresDatas.prototype.sortComparisonScore = function (scoreA, scoreB) {
        //Points and date older
        if (scoreA.points > scoreB.points)
            return -1;
        else
            return 1;
    };
    ScoresDatas.prototype.sortComparisonDate = function (scoreA, scoreB) {
        //Date is older
        if (scoreA.date.getTime() < scoreB.date.getTime())
            return 1;
        else
            return -1;
    };
    ScoresDatas.prototype.updateRanking = function () {
        for (var i = 0; i < this.all.length; i++)
            this.all[i].ranking = i + 1;
    };
    //Data saving to local storage
    ScoresDatas.prototype.save = function () {
        //Scores
        var scoreDataSavable, scoresDatas = [];
        for (var i = 0; i < this.all.length; i++) {
            scoreDataSavable = this.all[i].getSavableArray();
            scoresDatas.push(scoreDataSavable);
        }
        var scoresDatasSavable = JSON.stringify(scoresDatas);
        localStorage.setItem('scoresDatas-all', scoresDatasSavable);
        //Meilleure score
        localStorage.setItem('scoresDatas-bestScore', JSON.stringify(this.bestScore));
    };
    //Data loading from local storage
    ScoresDatas.prototype.load = function () {
        //Scores		
        this.all = [];
        var scoresDatasSavable = localStorage.getItem('scoresDatas-all');
        if (scoresDatasSavable != null) {
            var scoresDatas_1 = JSON.parse(scoresDatasSavable);
            var scoreDataSavable = void 0, scoreData = void 0;
            for (var i = 0; i < scoresDatas_1.length; i++) {
                scoreData = new ScoreData();
                scoreData.setSavableArray(scoresDatas_1[i]);
                this.all.push(scoreData);
            }
        }
        //Meilleure score
        this.bestScore = 0;
        var bestScoreSavable = localStorage.getItem('scoresDatas-bestScore');
        if (bestScoreSavable != null)
            this.bestScore = JSON.parse(bestScoreSavable);
    };
    return ScoresDatas;
}());
