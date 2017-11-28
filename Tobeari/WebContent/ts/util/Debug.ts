/**
 * A debug frame.
 */
class Debug {
	private xposition: number;
	private ymargin: number;
	private yspacing: number;
	private texts: string[][];
	private font: string;

	constructor() {
		this.xposition = GraphicInterface.sizeOfWidth(15);
		this.ymargin = GraphicInterface.sizeOfHeight(5);
		this.yspacing = GraphicInterface.spacing;
		this.texts = [];
		this.font = "bold "+GraphicInterface.sizeOfHeight(5)+"px Arial";
	}

	public clear() {
		this.texts = [];
	}

	public addText(title: string, content: string) {
		this.texts.push([title, content]);
	}

	public show() {
		let text: string;
		for(let i in this.texts) {
			text = this.texts[i][0] + ": " + this.texts[i][1];
			g.debug.text(text, this.xposition, this.ymargin + (Number(i) * this.yspacing), "#FFFFFF", this.font);
		}
	}
}