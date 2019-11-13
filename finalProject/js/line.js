class Line{
	constructor(unemstate){
		this.unemstate = unemstate;
		this.drawInit();
		this.drawupdate(unemstate,"unemployment");
	}
	drawInit(){
		let linesvg = d3.select(".lineChart")
		                .append("svg")
		             	.attr("width",580)
		                .attr("height",550)
        let x_scale = d3.scaleLinear()
                    .domain([2007,2018])
                    .range([0,520])
                    .nice()
        let x_axis = d3.axisBottom(x_scale)
                       .tickFormat(d=>d)
        	           .tickSize(0)
        	           .tickPadding(6)
        linesvg.append("g")
               .call(x_axis)    
               .attr("transform","translate(20,510)")
	}
	drawupdate(activedata,type){
		let that = this
        let linesvg = d3.select(".lineChart").select("svg").data(activedata);
        let oldaxis = linesvg.selectAll(".axisy").remove()
        if (type == "unemployment"){
        	linesvg.selectAll(".lines").remove()
        	let x_scale = d3.scaleLinear()
                            .domain([2007,2018])
                            .range([0,520])
                            .nice()                            
        	let y_scale = d3.scaleLinear()
                            .domain([15,0])
                            .range([0,500])
                            .nice()
            let y_axis = d3.axisLeft(y_scale)
            	           .tickSize(0)
            	           .tickPadding(6)
            linesvg.append("g")
                   .call(y_axis)
                   .attr("transform","translate(20,10)")
                  .attr("class","axisy")
	        for (let i = 0; i < activedata.length; i = i + 12){
    	    	let path = "M"
        		for (let j = 0; j<12; j++){
            	    path = path + x_scale(2007+j) + "," + y_scale(activedata[i+j]["Unemployment-rate"])
            	    if (j!= 11){
            	    	path += "L"
            	    }
	        	}
    	    	//console.log(path)
    	    	linesvg.append("path")
    	    	       .attr("d",path)
    	    	       .attr("class","lines")
    	    	       .attr("id", activedata[i]["State"].replace(/[ ]/g,""))
    	    	       .attr("fill", "none")
    	    	       .attr("stroke", "grey")
    	    	       .attr("transform","translate(20,10)")
            }
        }
        if (type == "crime"){

        }
	}

}