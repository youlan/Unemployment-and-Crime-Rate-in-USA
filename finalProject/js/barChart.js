
class barData{

    constructor(state, rate){
        this.state = state;
        this.rate = rate;
    }
}

class BarPlot {
    constructor(data, activeYear, label) {
        this.margin = {top: 20, right: 20, bottom: 100, left: 80};
        this.width = 1400 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        this.activeYear = activeYear;
        this.oriData = data;
        this.data = data[label];
        this.label = label;



        this.xScale = d3.scaleBand()
            .range([0,this.width])
            .padding(0.1);

        this.activeData = [];
        //console.log(this.data)
        //console.log(this.activeYear)
        for (let sID of d3.keys(this.data)){
            
            let that = this;
            let stateID = this.data[sID].key;
            if(stateID == "UnitedStatesTotal"){
                continue;
            }
            let stateData = this.data[sID].values.find(d => d.Year == this.activeYear);
            //console.log(stateData);
            let sRate = null;
            if(that.label == "unemployment"){
                sRate = parseFloat(stateData["Unemployment-rate"]);
            }else {
                sRate = parseFloat(stateData["rate"]);
            }
            
            this.activeData.push({"state":stateID,"value":sRate});
        }
        //console.log(this.activeData);
        this.drawDropDown();
        this.drawBarPlot();
        this.updateBarPlot(this.activeYear);

    }

    drawBarPlot(){
         //console.log("here")
         d3.select("div#bar-plot").append("svg").attr("class","barChart")
            .attr("width", 1400)
            .attr("height", 400);
         this.svgGroup = d3.select(".barChart");

         this.svgGroup.append("g").attr("class","axis").attr("id","x-axis");
         //this.svgGroup.append("text").attr("id", "xaxis-label");
         this.svgGroup.append("g").attr("class","axis").attr("id","y-axis");
         //this.svgGroup.append("text").attr("id", "yaxis-label");

    }

    updateBarPlot(){
        let that = this;
        let activeYear = that.activeYear;
        let plotData = this.activeData;

        let xScale = this.xScale
            .domain(plotData.map(function (d) {
                return d.state;
            }));


        let minValue = Infinity;
        let maxValue = -Infinity;
        for (let key of d3.keys(this.data)){
            //console.log(key);
            let karray = this.data[key];

            for (let eachYear of karray.values){
                let that = this;
                let sRate = null;
                if(that.label == "unemployment"){
                    sRate = parseFloat(eachYear["Unemployment-rate"]);
                }else {
                    sRate = parseFloat(eachYear.rate);
                }
                minValue = sRate < minValue ? sRate : minValue;
                maxValue = sRate > maxValue ? sRate : maxValue;
            }
        }


        let yScale = d3.scaleLinear()
            .range([this.height,0])
            .domain([0,maxValue])
            .nice();

        let colorSelect = {"unemployment": d3.interpolateBlues,
                            "crime":d3.interpolateReds}

        let colorScale = d3.scaleSequential(colorSelect[that.label]).domain([0,maxValue])


        let xAxis = d3.axisBottom()
            .scale(xScale);

        let yAxis = d3.axisLeft()
            .ticks(8)
            .tickSize(-this.width)
            .scale(yScale.nice());

        let yCAxis = d3.axisLeft()
            .ticks(8)
            .tickSize(-this.width)
            .scale(yScale.nice())
            .tickFormat(d=>d/100);

        let yAxisSet = {
            "unemployment": yAxis,
            "crime": yCAxis
        }


        d3.select("#y-axis").selectAll(".grid").remove();
        d3.select("#x-axis").selectAll(".axis").remove();


        d3.select("#y-axis").append('g').attr("class","grid")
            .attr("transform", "translate("+that.margin.left+"," + that.margin.top + ")")
            .call(yAxisSet[that.label])
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line")
            //.style("opacity",0.2)
                .attr("stroke", "white")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "2 2"))

            .call(g => g.selectAll(".tick text")
                .attr("x", -4)
                .attr("dy", -4))
            .style("stroke-fill", "white");


        d3.select("#x-axis")
            .attr("class","axis")
            .attr("transform", "translate("+that.margin.left+"," + (that.height+that.margin.top) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        d3.select(".bars").remove();
        var svg = d3.select(".barChart").append("g")
            .attr("class","bars")
            .attr("width",this.width)
            .attr("height",this.height)
            .attr("transform", "translate("+ this.margin.left + "," + this.margin.top + ")");

        //console.log(plotData)
        let barplot = svg.selectAll("rect").data(plotData);

        let newbarplot = barplot.enter().append("rect");

        barplot.exit().remove();

        barplot =newbarplot.merge(barplot);

        barplot.attr("id",function(d){let nospace = d.state.replace(/[ ]/g,"");return nospace})
            .attr("x", function (d){
                return xScale(d.state);
            })
            .attr("y",function (d){
                //console.log(d.value);
                return yScale(d.value)
               })
            .attr("width", xScale.bandwidth())
            .attr("height",function (d) {
                return that.height - yScale(d.value);
            })
            .attr("fill", d=>colorScale(d.value))
            .style("opacity",1)
            .on('mouseenter', function (actual, i) {
                //console.log(d)
                //d3.select(this).style("opacity",0.5)
                d3.select(this).classed("selected",true);
                const y = yScale(actual.value);
                //console.log(y)
                var line = d3.select(".bars").append("line")
                    .attr('id', 'limit')
                    .attr('x1', 0)
                    .attr('y1', y)
                    .attr('x2', that.width)
                    .attr('y2', y)
                    .attr("stroke","red")
                    .attr("stroke-width","3px")
                    .attr("stroke-dasharray", "3 6");
                let state = "#"+this.id
                d3.select("#mapChart").selectAll("g").selectAll("#states").selectAll(state).classed("selected",true)
                d3.select("#lineChart").selectAll(state).classed("selectedPath",true)
                d3.select("div#lineChart").selectAll("#linename").text(actual.state)
                let x_scale = d3.scaleLinear()
                                .domain([2007,2018])
                                .range([0,600])
                                .nice()
                let y_scale_um = d3.scaleLinear()
                                   .domain([15,0])
                                   .range([0,500])
                                   .nice()
                let y_scale_cr = d3.scaleLinear()
                                   .domain([1000,0])
                                   .range([0,500])
                                   .nice()
                
                
                d3.select("div#lineChart")
                  .select("svg")
                  .append("circle")
                  .attr("cx",x_scale(activeYear))
                  .attr("cy",function(){
                    console.log(actual.value)
                        if (that.label == "unemployment"){
                            return y_scale_um(actual.value)
                        }
                        else{
                            return y_scale_cr(actual.value)
                        }
                    })
                  .attr("r",5)
                  .attr("fill","white")
                  .attr("stroke","red")
                  .attr("strokeStyle","red")
                  .attr("stroke-width",3)
                  .attr("transform","translate(40,30)")
                  .attr("id","poscircle")
                //console.log(d3.selectAll("path").select(state))
                //d3.selectAll("path").select(state).attr("fill","orange")
            })
            .on("mouseleave", function (actual,i) {
                //d3.select(this).style("opacity",1);
                d3.select(this).classed("selected",false);
                d3.select(".bars").selectAll('#limit').remove()
                let state = "#"+this.id
                d3.select("#mapChart").selectAll("g").selectAll("#states").selectAll(state).classed("selected",false)
                d3.select("#lineChart").selectAll(state).classed("selectedPath",false)
                d3.select("div#lineChart").selectAll("#linename").text("")
                d3.selectAll("#poscircle").remove();
            });
        
        //console.log(this.xScale);

    }

    drawDropDown(){
        let that = this;

        let dropData = ["Alphabetical", "Frequency, ascending", "Frequency, descending"]

        var dropdown = d3.select("div#sorting-button").append("g")
            .attr("transform", "translate("+ this.width+ "," + this.margin.top + ")")
            .append("select")
            .attr("id", "sortingSelector")
            .on("change",function (d) {
                var selectedOption = d3.select(this).property("value")
                that.dropdownChange(selectedOption);
            });

        let options = dropdown.selectAll("option")
            .data(dropData);
        options.exit().remove();

        let optionsCEnter = options.enter().append("option")
            .attr("value",function (d,i) {
                return i;
            })
            .text(function (d) {
                return d;
            });

    }

    dropdownChange(s){
        let that = this;
        //console.log(this.activeData);
        const data = this.activeData.sort(function (a,b) {
            let result =0;
            let stateA = a.state.toLowerCase();
            let stateB = b.state.toLowerCase();
            let valueA = parseFloat(a.value);
            let valueB = parseFloat(b.value);
            s = parseInt(s);
            switch(s){
                case 0:
                    //console.log(stateB);
                    if(stateA > stateB){
                        result = 1;
                    }
                    if(stateA < stateB){
                        result = -1;
                    }
                    //console.log(result)
                    return result;
                    break;
                case 1:
                    if(valueA > valueB){
                        //console.log("test");
                        result = 1;
                    }
                    if(valueA < valueB){
                        result = -1
                    }
                    return result;
                    break;
                case 2:
                    if(valueA < valueB){
                        result = 1
                    }
                    if(valueA > valueB){
                        result = -1
                    }
                    return result;
                    break;
            }});

        const t = d3.select(".barChart").transition()
            .duration(1000);
        let plotData = this.activeData;

        let xScale = this.xScale
            .domain(plotData.map(function (d) {
                return d.state;
            }));
        let xAxis = d3.axisBottom()
            .scale(xScale);
        //console.log(data);
        //console.log(d3.selectAll("rect"));
        d3.select("div#bar-plot").selectAll("rect").data(data, d=>d.state)
            .order()
            .transition(t)
            .delay((d,i)=>i*20)
            .attr("x", function (d){
                return xScale(d.state);
            });

        d3.select("#x-axis").transition(t)
            .call(xAxis)
            .selectAll(".tick")
            .delay((d,i)=>i*20);

    }

    updateBarYear(year){
        let that = this;
        this.activeYear = year;
        this.activeData = [];

        for (let sID of d3.keys(that.data)){
            let stateID = that.data[sID].key;
            let stateData = that.data[sID].values.find(d => d.Year == this.activeYear);
            let sRate = null;
            if(that.label == "unemployment"){
                sRate = parseFloat(stateData["Unemployment-rate"]);
            }else {
                sRate = parseFloat(stateData.rate);
            }
            this.activeData.push({"state":stateID,"value":sRate});
        }

        that.updateBarPlot();
    }

    ChangeOverView(label){
        let that = this;
        this.activeData =[];
        this.label =label;
        this.data = this.oriData[label];

        //console.log(that.activeYear);
        for (let sID of d3.keys(this.data)){
            let stateID = that.data[sID].key;
            let stateData = that.data[sID].values.find(d => d.Year == that.activeYear);
            let sRate = null;
            if(that.label == "unemployment"){
                sRate = parseFloat(stateData["Unemployment-rate"]);
            }else {

                sRate = parseFloat(stateData.rate);
                //console.log(sRate);
            }
            this.activeData.push({"state":stateID,"value":sRate});
        }
       //console.log(this.activeData);

        that.updateBarPlot();

    }
}