class Line{
	constructor(unemstate){
		this.unemstate = unemstate;
		this.drawInit();
	}
	drawInit(){
		linesvg = d3.select(".lineChart")
		            .append("svg")
		            .attr("width",500)
		            .attr("height",500)
	}
}