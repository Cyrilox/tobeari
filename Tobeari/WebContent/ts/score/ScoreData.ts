/**
 * A score data.
 */
class ScoreData {

	constructor(public ranking?: number, public points?: number, public player?: string, public date?: Date) {
		
	}

	public toArray(): any[] {
		let dateStr = this.date.toLocaleDateString();
		return [this.ranking, this.points, this.player, dateStr];
	}
	
	//Return a savable array
	public getSavableArray(): any[] {
		return [this.ranking, this.points, this.player, this.date.getTime()];
	}
	
	//Set the current datas from a savable array	
	public setSavableArray(values: any[]) {
		this.ranking = values[0];
		this.points = values[1];
		this.player = values[2];
		this.date = new Date(values[3]);
	}
}