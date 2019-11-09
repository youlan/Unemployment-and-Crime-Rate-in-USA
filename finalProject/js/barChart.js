
class barData{

    constructor(state, rate){
        this.state = state;
        this.rate = rate;
    }
}

class BarPlot {
    constructor(data, activeYear) {
        this.margin = {top: 20, right: 20, bottom: 100, left: 80};
        this.width = 1400 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        this.activeYear = activeYear;
        this.data = data;

        let minValue = Infinity;
        let maxValue = -Infinity;
        for (let key of d3.keys(this.data)){
            //console.log(key);
            let karray = this.data[key];
            //console.log(karray);
            for (let eachYear of karray.values){
                //console.log(eachYear);
                minValue = parseInt(eachYear.rate) < minValue ? parseInt(eachYear.rate) : minValue;
                maxValue = parseInt(eachYear.rate) > maxValue ? parseInt(eachYear.rate) : maxValue;
            }
        }
        console.log(maxValue);
        console.log(minValue);

        this.yScale = d3.scaleLinear()
            .range([this.height,0]);

        this.xScale = d3.scaleBand()
            .range([0,this.width])
            .padding(0.1);

        this.activeData = [];

        for (let sID of d3.keys(this.data)){
            let stateID = this.data[sID].key;
            let stateData = this.data[sID].values.find(d => d.Year == this.activeYear);
            //console.log(stateData);
            let sRate = parseInt(stateData.rate);
            this.activeData.push({"state":stateID,"value":sRate});
        }
        console.log(this.activeData);
        this.drawDropDown();
        this.drawBarPlot();
        this.updateBarPlot();

    }

    drawBarPlot(){

         d3.select(".bar-plot").append("svg").attr("class","barChart")
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

        //console.log(activeYear);
        let plotData = this.activeData;

        let xScale = this.xScale
            .domain(plotData.map(function (d) {
                return d.state;
            }));

        let maxValue = -Infinity;

        plotData.forEach(function (d) {
            if(d.value > maxValue){
                maxValue = d.value;
            }});
        //console.log(maxValue);
        let yScale = this.yScale
            .domain([0,maxValue])
            .nice();

        let xAxis = d3.axisBottom()
            .scale(xScale);

        let yAxis = d3.axisLeft()
            .ticks(5)
            .tickSize(-this.width)
            .scale(yScale.nice());

        //d3.select("#y-axis")
        //    .attr("transform", "translate("+this.margin.left+"," + this.margin.top + ")")
        //    .call(yAxis)
        //    .call(g => g.select(".domain").remove());



        d3.select("#y-axis").append('g').attr("class","grid")
            .attr("transform", "translate("+this.margin.left+"," + this.margin.top + ")")
            .call(yAxis)
                //d3.axisLeft()
            //    .ticks(5)
              //  .tickSize(-this.width, 0, 0)
              //  .tickFormat('')
               // .scale(yScale))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line")
            //.style("opacity",0.2)
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "2 2"))
            .call(g => g.selectAll(".tick text")
                .attr("x", -4)
                .attr("dy", -4))
            .style("stroke-fill", "white");


        d3.select("#x-axis")
            .attr("class","axis")
            .attr("transform", "translate("+this.margin.left+"," + (this.height+this.margin.top) + ")")
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


        let barplot = svg.selectAll("rect").data(plotData);

        let newbarplot = barplot.enter().append("rect");

        barplot.exit().remove();

        barplot =newbarplot.merge(barplot);

        barplot.attr("id",function(d){console.log(d.state);return d.state.replace(/[ ]/g,"")})
            .attr("x", function (d){
                return xScale(d.state);
            })
            .attr("y",function (d){
                console.log(d.value);
                return yScale(d.value)
            })
            .attr("width", xScale.bandwidth())
            .attr("height",function (d) {
                return that.height - yScale(d.value);
            })
            .style("fill", "teal")
            .style("opacity",1)
            .on('mouseenter', function (actual, i) {
                d3.select(this).style("opacity",0.5)
                const y = yScale(actual.value)
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
                d3.select(".mapChart").selectAll("g").selectAll("#states").selectAll(state).classed("selected",true)
                //console.log(d3.selectAll("path").select(state))
                //d3.selectAll("path").select(state).attr("fill","orange")
            })
            .on("mouseleave", function (actual,i) {
                d3.select(this).style("opacity",1);
                d3.select(".bars").selectAll('#limit').remove()
                let state = "#"+this.id
                d3.select(".mapChart").selectAll("g").selectAll("#states").selectAll(state).classed("selected",false)
            });

        //console.log(this.xScale);

    }

    drawDropDown(){
        let that = this;

        let dropData = ["Alphabetical", "Frequency, ascending", "Frequency, descending"]

        var dropdown = d3.select(".bar-plot").append("g")
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

        this.activeData = this.activeData.sort(function (a,b) {
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
        console.log(this.activeData);

        that.updateBarPlot();

    }
}