
class PlotData {

    constructor(country, xVal, yVal, color, circleSize) {
        this.state = country;
        this.xVal = xVal;
        this.yVal = yVal;
        this.color = color;
        this.circleSize = circleSize;
    }
}

class bubblePlot {


    constructor(data,activeyear){


        this.margin = { top: 20, right: 20, bottom: 100, left: 80 };
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;

        this.data = data;
        this.activeyear = activeyear;


        this.minSize = {
            'population': Infinity,
            'income': Infinity,
            'unemployment': Infinity,
            'crime': Infinity
        };
        this.maxSize = {
            'population': -Infinity,
            'income': -Infinity,
            'unemployment': -Infinity,
            'crime': -Infinity
        };

        this.colorSelect = {
            "unemployment": d3.interpolateBlues,
            "crime": d3.interpolateReds,
            "population": d3.interpolatePurples,
            "income": d3.interpolateGreens
        };
        //console.log(this.data);
        for (let key of d3.keys(this.data)){
            let karray = this.data[key];
            if (key === "unemployment"){
                let Minvalue = Infinity;
                let Maxvalue = -Infinity;
                for (let eachState of karray){
                    for (let item of eachState.values){
                        let minvalue = parseFloat(item["Unemployment-rate"]) ? parseFloat(item["Unemployment-rate"]) :Infinity;
                        Minvalue = minvalue < Minvalue ? minvalue : Minvalue;
                        let maxvalue = parseFloat(item["Unemployment-rate"]) ? parseFloat(item["Unemployment-rate"]) :-Infinity;
                        Maxvalue = maxvalue > Maxvalue ? maxvalue : Maxvalue;
                    }
                }
                this.minSize[key] = Minvalue;
                this.maxSize[key] = Maxvalue;
            }
            if (key === "income"){
                let Minvalue = Infinity;
                let Maxvalue = -Infinity;

                for (let eachState of karray){
                    for (let item of eachState.values){
                        let minvalue = Number(item.income) ? Number(item.income) :Infinity;
                        Minvalue = minvalue < Minvalue ? minvalue : Minvalue;
                        let maxvalue = Number(item.income) ? Number(item.income) :-Infinity;
                        Maxvalue = maxvalue > Maxvalue ? maxvalue : Maxvalue;
                    }
                }
                this.minSize[key] = Minvalue;
                this.maxSize[key] = Maxvalue;

            }
            if (key === "crime") {
                let Minvalue = Infinity;
                let Maxvalue = -Infinity;
                let pMinvalue = Infinity;
                let pMaxvalue = -Infinity;
                for (let eachState of karray) {
                    //console.log(eachState);
                    if(eachState.key == "UnitedStatesTotal"){
                        continue;
                    }
                    for (let item of eachState.values) {
                        let minvalue = parseFloat(item.rate) ? parseFloat(item.rate) : Infinity;
                        Minvalue = minvalue < Minvalue ? minvalue : Minvalue;
                        let maxvalue = parseFloat(item.rate) ? parseFloat(item.rate) : -Infinity;
                        Maxvalue = maxvalue > Maxvalue ? maxvalue : Maxvalue;

                        let pminvalue = parseFloat(item.Population) ? parseFloat(item.Population) :Infinity;
                        pMinvalue= pminvalue < pMinvalue ? pminvalue : pMinvalue;
                        let pmaxvalue = parseFloat(item.Population) ? parseFloat(item.Population) :-Infinity;
                        pMaxvalue = pmaxvalue > pMaxvalue ? pmaxvalue : pMaxvalue;
                    }
                }
                this.minSize[key] = Minvalue;
                this.maxSize[key] = Maxvalue;
                this.maxSize["population"] = pMaxvalue;
                this.minSize["population"] = pMinvalue;
            }
        }

        //console.log(this.minSize);
        //console.log(this.maxSize);

        this.drawPlot();
        this.drawDropDown("unemployment", "crime", "income", "unemployment");
        this.updatePlot(this.activeyear, "unemployment", "crime", "income", "unemployment");
    }

    drawPlot(){
        d3.select("#bubbleChart").append("div").attr("id","chart-view")
            .attr("width", 1600)
            .attr("height", 650);


        let dropdownWrap = d3.select('#chart-view').append('div').classed('dropdown-wrapper', true);

        let cWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        cWrap.append('div').classed('c-label', true)
            .append('text')
            .text('Circle Size: ');

        cWrap.append('div').attr('id', 'dropdown_c').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');

        //let colorWrap = dropdownWrap.append('g').classed('dropdown-panel', true);

        //colorWrap.append('div').classed('c-color', true)
            //.append('text')
            //.text('Circle Color: ');

        //colorWrap.append('div').attr('id', 'dropdown_color').classed('dropdown', true).append('div').classed('dropdown-content', true)
            //.append('select');

        let xWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        xWrap.append('div').classed('x-label', true)
            .append('text')
            .text('X Axis Data: ');

        xWrap.append('div').attr('id', 'dropdown_x').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');

        let yWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

        yWrap.append('div').classed('y-label', true)
            .append('text')
            .text('Y Axis Data: ');

        yWrap.append('div').attr('id', 'dropdown_y').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');



        d3.select('#chart-view')
            .append('svg').classed('plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("transform","translate(0, 40)");
            //.attr("transform", "("+ this.margin.left+","+this.margin.top+")");

        this.svgGroup = d3.select('#chart-view').select('.plot-svg').append('g');

        this.svgGroup.append("g").attr("id","bx-axis");
        this.svgGroup.append("text").attr("id", "xaxis-label").attr("fill","white");
        this.svgGroup.append("g").attr("id","by-axis");
        this.svgGroup.append("text").attr("id", "yaxis-label").attr("fill","white");

        d3.select('.plot-svg')
            .append('g')
            .classed('circle-legend', true)
            .append('svg')
            .append('g')
            .attr('transform', 'translate(700, 10)');



    }

    updatePlot(activeYear, xIndicator, yIndicator, circleSizeIndicator, circleColorIndicator){

        
        //this.activeyear = activeYear;
        let that = this;
        let data = that.data
        let minCS = this.minSize[circleSizeIndicator];
        let maxCS = this.maxSize[circleSizeIndicator];

        let circleSizer = function (d) {
            let cScale = d3.scaleSqrt().range([3, 20])
                .domain([minCS, maxCS]);
            return d.circleSize ? cScale(d.circleSize) : 3;
        };

        let plot_Data = [];
        //console.log(this.data["unemployment"]);
        let stateIDs = d3.map(that.data["unemployment"], function (d) {
            return d.key;
        });
        //console.log(activeYear);
        //console.log(that.data[yIndicator]);
        //console.log(that.data[xIndicator]);
        for (let cID of d3.keys(stateIDs)){
            //console.log(cID);
            let state = stateIDs[cID].State ;
            //console.log(stateIDs[cID]);
            //let activeyear = activeYear;
            let id = stateIDs[cID].key;
            if (id == undefined){
                continue;
            }
            //console.log(id)
            //console.log(that.data[xIndicator])
            let xData = that.data[xIndicator].find(d=> d.key === id);
            //console.log(this.data[xIndicator].find(d=> d.key === id));
            let xVal = filterData(xData, xIndicator,activeYear);
            //console.log(xVal);
            let yData = that.data[yIndicator].find(d=> d.key === id);

            let yVal = filterData(yData, yIndicator,activeYear);
            //console.log(yVal);
            let csData = that.data[circleSizeIndicator].find(d=> d.key === id);
            //console.log(csData);
            let circleSize = filterData(csData, circleSizeIndicator,activeYear);
            let ccData = that.data[circleColorIndicator].find(d=> d.key === id);
            let color = filterData(ccData, circleColorIndicator,activeYear);

            plot_Data.push(new PlotData(id, xVal, yVal, color, circleSize));
        }
            //console.log(plot_Data);
        function filterData(d, indicator,activeYear){
            //console.log(d);
            //console.log(activeYear);
            let stateData = d.values.find(d => d.Year === activeYear);
            //console.log(stateData);
            if (indicator === "unemployment"){
                return parseFloat(stateData["Unemployment-rate"]);
            }
            if (indicator === "crime"){
                return parseFloat(stateData["rate"]);
            }
            if (indicator === "population"){
                return parseFloat(stateData["Population"]);
            }
            if (indicator === "income"){
                return parseFloat(stateData.income);
            }
        }

        let xbScale = d3.scaleLinear().range([0, this.width])
            .domain([this.minSize[xIndicator], this.maxSize[xIndicator]]).nice();
        let ybScale = d3.scaleLinear().range([this.height, 0])
            .domain([this.minSize[yIndicator], this.maxSize[yIndicator]]).nice();


        let colorScale = d3.scaleSequential(this.colorSelect[circleColorIndicator])
            .domain([this.minSize[circleColorIndicator], this.maxSize[circleColorIndicator]]);

        let axisLabel = {
            'population': "Population",
            'income': "Annual Income ($)",
            'unemployment': "Unemployment Rate (%)",
            'crime': "Crime Rate (‰)"
        }


        let scatterplot = this.svgGroup.selectAll('circle').data(plot_Data);

        scatterplot.exit().remove();

        let newscatterplot = scatterplot.enter().append('circle');
        scatterplot = newscatterplot.merge(scatterplot);

        scatterplot.attr('cx', d => (this.margin.left + (d.xVal ? xbScale(d.xVal) : 0)))
            .attr('cy', d => (this.margin.top + (d.yVal ? ybScale(d.yVal) : this.height)))
            .attr('r', circleSizer)
            .attr("id", function(d){return(d.state.replace(/[ ]/g,""))})
            .attr("class","bubbles")
            .style("fill", d => colorScale(d.color))
            .on("mouseover",function(d){
                //console.log(d)
                let loc = d3.select(".plot-svg")
                loc.append("line")
                   .attr("x1",80)
                   .attr("y1",20 + (d.yVal ? ybScale(d.yVal) : this.height))
                   .attr("x2",80 + (d.xVal ? xbScale(d.xVal) : 0))
                   .attr("y2",20 + (d.yVal ? ybScale(d.yVal) : this.height))
                   .attr("stroke","red")
                   .attr("stroke-dasharray", "2 2")
                   .attr("class","position")
                loc.append("line")
                   .attr("x1",80 + (d.xVal ? xbScale(d.xVal) : 0))
                   .attr("y1",20 + (d.yVal ? ybScale(d.yVal) : this.height))
                   .attr("x2",80 + (d.xVal ? xbScale(d.xVal) : 0))
                   .attr("y2",500)
                   .attr("stroke","red")
                   .attr("stroke-dasharray", "2 2")
                   .attr("class","position")
                let state = "#"+d.state.replace(/[ ]/g,"");
                d3.select("div#lineChart").selectAll(state).classed("selectedPath",true)
                d3.select("div#lineChart").selectAll("#linename").text(d.state)
                d3.select("#mapChart").selectAll("g").selectAll("#states").selectAll(state).classed("selected",true)
                d3.select("#bubbleChart")
                  .append("div")
                  .classed("tooltip", true)
                  .style("opacity", 0);
                let tooltip = d3.select(".tooltip");
                tooltip.transition()
                       .duration(200)
                       .style("opacity", 0.9);
                tooltip
                       .html(that.tooltipRender(d) + "<br/>")
                       .style("left", (d3.event.pageX + 40) + "px")
                       .style("top", (d3.event.pageY-80) + "px");
                let x_scale = d3.scaleLinear()
                                .domain([2007,2018])
                                .range([0,600])
                                .nice()
                let y_scale = d3.scaleLinear()
                                .domain([15,0])
                                .range([0,500])
                                .nice()
                d3.select("div#lineChart")
                .select("svg")
                .append("circle")
                .attr("cx",x_scale(activeYear))
                .attr("cy",function(){
                    let state = d.state
                    return (y_scale(data["unemployment"].filter(d=>{
                                return (d.key == state);
                            })[0]["values"][activeYear-2007]["Unemployment-rate"]        
                        )
                    )     
                })
                .attr("r",5)
                .attr("fill","white")
                .attr("stroke","red")
                .attr("stroke-width",3)
                .attr("transform","translate(40,30)")
                .attr("id","poscircle")

            })
            .on("mouseleave",function(d){
                let state = "#"+d.state.replace(/[ ]/g,"");
                d3.select("div#lineChart").selectAll(state).classed("selectedPath",false)
                d3.select("div#lineChart").selectAll("#linename").text("")
                d3.select("#mapChart").selectAll("g").selectAll("#states").selectAll(state).classed("selected",false)
                let tooltip = d3.select(".tooltip");
                tooltip.remove()
                d3.selectAll("#poscircle").remove();
                d3.selectAll(".position").remove();
            });

        let xbAxis = d3.axisBottom()
            .scale(xbScale);
        if (xIndicator === "crime"){
            xbAxis.tickFormat(d=>d/100);
        }

        d3.select("#bx-axis")
            .classed("axis",true)
            .attr("transform", "translate("+this.margin.left+"," + (this.height+this.margin.top) + ")")
            .call(xbAxis)
            .call(g => g.select(".domain").attr("stroke","white"))
            .call(g => g.selectAll(".tick:not(:first-of-type) line").attr("stroke","white"))    ;

        d3.select("#xaxis-label")
            .attr("transform",
                "translate(" + (this.width)/2 + " ," +
                (this.height + this.margin.top + 40) + ")")
            .classed("axis-label", true)
            .text(axisLabel[xIndicator]);
            //.text(xIndicator.charAt(0).toUpperCase() + xIndicator.slice(1));

        let ybAxis = d3.axisLeft()
            .scale(ybScale);
        if (yIndicator === "crime"){
            ybAxis.tickFormat(d=>d/100);
        }
        d3.select("#by-axis")
            .attr("transform",
                "translate("+this.margin.left+"," + this.margin.top  + ")")
            .call(ybAxis)
            .call(g => g.select(".domain").attr("stroke","white"))
            .call(g => g.selectAll(".tick:not(:first-of-type) line").attr("stroke","white"));

        d3.select("#yaxis-label")
            .attr("transform", "translate(12, "+(this.height / 2 + this.margin.top)+") rotate(-90)")
            .classed("axis-label", true)
            .text(axisLabel[yIndicator]);
            //.text(yIndicator.charAt(0).toUpperCase() + yIndicator.slice(1));

        if (circleSizeIndicator === "crime"){
            this.drawLegend(minCS/100, maxCS/100);
        }else{
            this.drawLegend(minCS, maxCS);
        }


    }

    drawDropDown(xIndicator, yIndicator, circleSizeIndicator, circleColorIndicator){

        let that = this;
        //console.log(that.activeyear);
        let dropDownWrapper = d3.select('.dropdown-wrapper');
        let dropData = [];
        //console.log(this.data);
        let index = 0;
        for (let key in this.data) {
            dropData.push({
                indicator: key,
                indicator_name: key.charAt(0).toUpperCase() + key.slice(1)
            });
            index=index+1;
        }

        //console.log(dropData);
        /* CIRCLE DROPDOWN */
        let dropC = dropDownWrapper.select('#dropdown_c').select('.dropdown-content').select('select');

        let optionsC = dropC.selectAll('option')
            .data(dropData);


        optionsC.exit().remove();

        let optionsCEnter = optionsC.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsCEnter.append('text')
            .text((d, i) => d.indicator_name);

        optionsC = optionsCEnter.merge(optionsC);

        let selectedC = optionsC.filter(d => d.indicator === circleSizeIndicator)
            .attr('selected', true);

        dropC.on('change', function(d, i) {
            let cValue = this.options[this.selectedIndex].value.toLowerCase();
            let xValue = dropX.node().value.toLowerCase();
            let yValue = dropY.node().value.toLowerCase();
            //let cColor = dropColor.node().value.toLowerCase();
            let cColor = "unemployment";
            let activeyear = that.activeyear;
            that.updatePlot(activeyear, xValue, yValue, cValue, cColor);
            d3.event.stopPropagation();
        });

        /* CIRCLE COLOR DROPDOWN */
        /*let dropColor = dropDownWrapper.select('#dropdown_color').select('.dropdown-content').select('select');

        let optionsColor = dropColor.selectAll('option')
            .data(dropData);

        optionsColor.exit().remove();

        let optionsColorEnter = optionsColor.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsColor = optionsColorEnter.merge(optionsColor);

        optionsColorEnter.append('text')
            .text((d, i) => d.indicator_name);

        let selectedColor = optionsColor.filter(d => d.indicator === circleColorIndicator)
            .attr('selected', true);

        dropColor.on('change', function(d, i) {
            let cColor = this.options[this.selectedIndex].value;
            let xValue = dropX.node().value;
            let cValue = dropC.node().value;
            let yValue = dropY.node().value;
            let activeyear = that.activeyear;
            that.updatePlot(activeyear, xValue, yValue, cValue, cColor);

            d3.event.stopPropagation();
        }); */

        /* X DROPDOWN */
        let dropX = dropDownWrapper.select('#dropdown_x').select('.dropdown-content').select('select');

        let optionsX = dropX.selectAll('option')
            .data(dropData);

        optionsX.exit().remove();

        let optionsXEnter = optionsX.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsXEnter.append('text')
            .text((d, i) => d.indicator_name);

        optionsX = optionsXEnter.merge(optionsX);

        let selectedX = optionsX.filter(d => d.indicator === xIndicator)
            .attr('selected', true);

        dropX.on('change', function(d, i) {
            let xValue = this.options[this.selectedIndex].value;
            let yValue = dropY.node().value;
            let cValue = dropC.node().value;
            //let cColor = dropColor.node().value;
            let cColor = "unemployment";
            let activeyear = that.activeyear;
            that.updatePlot(activeyear, xValue, yValue, cValue, cColor);

            d3.event.stopPropagation();
        });

        /* Y DROPDOWN */
        let dropY = dropDownWrapper.select('#dropdown_y').select('.dropdown-content').select('select');

        let optionsY = dropY.selectAll('option')
            .data(dropData);

        optionsY.exit().remove();

        let optionsYEnter = optionsY.enter()
            .append('option')
            .attr('value', (d, i) => d.indicator);

        optionsY = optionsYEnter.merge(optionsY);

        optionsYEnter.append('text')
            .text((d, i) => d.indicator_name);
        //console.log(yIndicator);
        let selectedY = optionsY.filter(d => d.indicator === yIndicator)
            .attr('selected', true);

        dropY.on('change', function(d, i) {
            //console.log(that.activeyear);
            let yValue = this.options[this.selectedIndex].value;
            let xValue = dropX.node().value;
            let cValue = dropC.node().value;
            //let cColor = dropColor.node().value;
            let cColor = "unemployment";
            let activeyear = that.activeyear;
            
            that.updatePlot(activeyear, xValue, yValue, cValue, cColor);
            //console.log(yValue);
            d3.event.stopPropagation();
        });

    }

    drawLegend(min, max) {

        let scale = d3.scaleSqrt().range([3, 20]).domain([min, max]);

        let circleData = [min, max];

        let svg = d3.select('.circle-legend').select('svg').select('g');
        let circleGroup = svg.selectAll('g').data(circleData);
        circleGroup.exit().remove();

        let circleEnter = circleGroup.enter().append('g');
        circleEnter.append('circle').classed('neutral', true).classed("bubbles",true);
        circleEnter.append('text').classed('circle-size-text', true);

        circleGroup = circleEnter.merge(circleGroup);

        circleGroup.attr('transform', (d, i) => 'translate(' + ((i * (5 * scale(d))) + 20) + ', 25)');

        circleGroup.select('circle').attr('r', (d) => scale(d));
        circleGroup.select('circle').attr('cx', '0');
        circleGroup.select('circle').attr('cy', '0');

        let numText = circleGroup.select('text').text(d => new Intl.NumberFormat().format(d));

        numText.attr('transform', (d) => 'translate(' + ((scale(d)) + 10) + ', 0)');
    }

    updateYear(year){
        let that = this;
        let activeyear = year;
        //console.log(year);
        let xValue = d3.select("#dropdown_x").select('.dropdown-content').select('select').node().value;
        let yValue = d3.select("#dropdown_y").select('.dropdown-content').select('select').node().value;
        let cValue = d3.select("#dropdown_c").select('.dropdown-content').select('select').node().value;
        //let cColor = d3.select("#dropdown_color").select('.dropdown-content').select('select').node().value;
        let cColor = "unemployment";
        that.updatePlot(activeyear, xValue, yValue, cValue, cColor);
        this.activeyear = year
        //console.log(xValue);

    }
    tooltipRender(tooldata) {
          let text = "<h2>" + "State: " + tooldata.state + "</h2>";
          //console.log(this.activeyear)
          let crimedata = this.data["crime"].filter(d=>{
            return (d.key === tooldata.state);
          })
          let unemdata = this.data["unemployment"].filter(d=>{
            return (d.key === tooldata.state);
          })
          let popudata = this.data["population"].filter(d=>{
            return (d.key === tooldata.state);
          })
          let incdata = this.data["income"].filter(d=>{
            return (d.key === tooldata.state);
          })
          //console.log(crimedata,unemdata,popudata,incdata)
          text += "<h2>" + "Unemployment Rate: " + unemdata[0]["values"][this.activeyear-2007]["Unemployment-rate"] + "%<h2>";
          text += "<h2>" + "Crime Rate: " + (crimedata[0]["values"][this.activeyear-2007]["rate"]/100).toFixed(2) + "‰<h2>";
          text += "<h2>" + "Income: " + incdata[0]["values"][this.activeyear-2007]["income"] + "$<h2>";
          text += "<h2>" + "Population: " + popudata[0]["values"][this.activeyear-2007]["Population"] + "<h2>";
          return text;
        }


}

