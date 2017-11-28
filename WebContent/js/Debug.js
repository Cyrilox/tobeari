/*
 * A debug frame.
 * @class Debug
 * @contructor
 */
function Debug(){
	
	this.clear = function() {
		this.texts = [];
	};

	this.addText = function(name, text) {
		this.texts[name] = text;
	};

	this.show = function() {
		var line = 1, text;
		for(var name in this.texts){
			text = name + ": " + this.texts[name];
			g.debug.text(text, 100, this.spacing * line);
			line++;
		}
	};
	
	this.spacing = 30;//Space between elements
	this.texts = [];
}