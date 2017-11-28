/**
 * The scores datas.
 */
class ScoresDatas {
	public bestScore: number;
	public all: ScoreData[];

	constructor() {
		this.all = [];
		this.bestScore = 0;

		//Local storage loading
		this.load();
	}
	
	//A score: Ranking, Points, actual player name, Date
	public add(points: number) {
		//Creation
		let date = new Date();
		let score = new ScoreData(-1, points, playerName, date);
		this.all.push(score);
		
		//Sorting
		this.all.sort(this.sortComparisonDate);
		this.all.sort(this.sortComparisonScore);
		this.updateRanking();
		
		//Best score
		if(points > this.bestScore)
			this.bestScore = points;
		
		//Local storage saving
		this.save();
	}
	
	public getTop(amount: number): any[][] {
		amount = Math.min(this.all.length, amount);
		let topScores: any[][] = [], date: Date;
		for(let i=0; i<amount; i++)
			topScores[i] = this.all[i].toArray();
		
		return topScores;
	}
	
	/**
	 * Reset all scores
	 */
	public reset() {
		this.all = [];
		this.bestScore = 0;
		
		this.save();
	}
	
	private sortComparisonScore(scoreA: ScoreData, scoreB: ScoreData): number {
		//Points and date older
		if(scoreA.points > scoreB.points)
			return -1;
		else
			return 1;
	}
	
	private sortComparisonDate(scoreA: ScoreData, scoreB: ScoreData): number {
		//Date is older
		if(scoreA.date.getTime() < scoreB.date.getTime())
			return 1;
		else
			return -1;
	}
	
	private updateRanking() {
		for(let i=0; i<this.all.length; i++)
			this.all[i].ranking = i+1;
	}
	
	//Data saving to local storage
	private save() {
		//Scores
		let scoreDataSavable: any[], scoresDatas: any[][] = [];
		for(let i=0; i<this.all.length; i++) {
			scoreDataSavable = this.all[i].getSavableArray();
			scoresDatas.push(scoreDataSavable);
		}
		let scoresDatasSavable = JSON.stringify(scoresDatas);
		localStorage.setItem('scoresDatas-all', scoresDatasSavable);
		
		//Meilleure score
		localStorage.setItem('scoresDatas-bestScore', JSON.stringify(this.bestScore));
	}
	
	//Data loading from local storage
	private load() {
		//Scores		
		this.all = [];
		let scoresDatasSavable = localStorage.getItem('scoresDatas-all');
		if(scoresDatasSavable != null) {
			let scoresDatas = JSON.parse(scoresDatasSavable);
			let scoreDataSavable: any[], scoreData: ScoreData;
			for(let i=0; i<scoresDatas.length; i++) {
				scoreData = new ScoreData();
				scoreData.setSavableArray(scoresDatas[i]);
				this.all.push(scoreData);
			}
		}
		
		//Meilleure score
		this.bestScore = 0;
		let bestScoreSavable = localStorage.getItem('scoresDatas-bestScore');
		if(bestScoreSavable != null)
			this.bestScore = JSON.parse(bestScoreSavable);
	}
}