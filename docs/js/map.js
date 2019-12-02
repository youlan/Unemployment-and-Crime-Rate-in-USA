class Map{
    constructor(unemstate, crimerate, activeyear, updateyear, updatestate,updateOverview, lineChart, otherdata){
        this.unemstate = unemstate;
        this.crimerate = crimerate;
        this.activeyear = activeyear;
        this.updateYear = updateyear;
        this.updateState = updatestate;
        this.lineChart = lineChart;
        this.drawYearSlider();
        this.drawMap();
        this.un_max = d3.max(this.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
        this.un_min = d3.min(this.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
        this.currview = 1;
        this.updateOverview = updateOverview;
        this.otherdata = otherdata;
    }

    drawYearSlider() {
        let that = this;
        var dataTime = d3.range(0, 12).map(function (d) {
            return new Date(2007 + d, 10, 3);
        });

        const showactiveYear = d3.select('div#slider-vertical').append("svg").attr("id","yearsliderSVG")
            .attr("width",240).attr("height",500)
             .append("svg").attr('width', 240)
            .attr('height', 500).append("text").attr("id", "htmlYear");
        showactiveYear.attr("x", 120)
            .attr("y", 150)
            .attr("align", "center")
            .classed("activeYear-background", true)
            .html(this.activeyear);

        var sliderVertical = d3
            .sliderLeft()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .height(400)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .ticks(12)
            .default(new Date(2007, 10, 3))
            .on('onchange', val => {
                let activeyear = d3.timeFormat('%Y')(val);
                that.activeyear = activeyear
                that.updateYear(activeyear);
                d3.select("#htmlYear").html(activeyear);
                let statearea = d3.select("#mapChart").select("#states").selectAll("path")
                //console.log(statearea.data())
                //let max = d3.max(this.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
                //let min = d3.min(this.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
                //console.log(that.currview)
                let unemColorScale = d3.scaleLinear()
                    .domain([this.un_min, this.un_max])
                    .range([0, 1]);
                let cr_max = d3.max(this.crimerate, function (d) {
                    return parseFloat(d["rate"])
                })
                let cr_min = d3.min(this.crimerate, function (d) {
                    return parseFloat(d["rate"])
                })
                let crColorScale = d3.scaleLinear()
                    .domain([cr_min, cr_max])
                    .range([0, 1]);
                statearea.attr("fill", function (d) {
                    if (that.currview == 1 || that.currview == 3) {
                        if (d.unemployment_data != undefined) {
                            //console.log(d.properties, d.unemployment_data[0].unemployment_rate)
                            return (d3.interpolateBlues(unemColorScale(d.unemployment_data[activeyear - 2007].unemployment_rate)))
                        }
                    }
                    if (that.currview == 2) {
                        if (d.crimerate != undefined) {
                            //console.log(d.properties, d.unemployment_data[0].unemployment_rate)
                            return (d3.interpolateReds(crColorScale(d.crimerate[activeyear - 2007].crimerate)))
                        }
                    }

                })
                let x_scale = d3.scaleLinear()
                    .domain([2007, 2018])
                    .range([0, 600])
                    .nice()
                //console.log(d3.select("#lineChart").select("#yearline"))
                let yearline = d3.select("#lineChart").select("#yearline").attr("x1", x_scale(activeyear)).attr("x2", x_scale(activeyear))
                //that.updateMap(activeyear);
                //that.activeyear = activeyear
            });

        var gVertical = d3
            .select('#yearsliderSVG')
            .append('svg')
            .attr('width', 100)
            .attr('height', 500)
            .append('g')
            .attr('transform', 'translate(90, 60)');

        gVertical.call(sliderVertical);

    }


    drawMap(){
        let that = this;
        let margin = {
            top:60,
            bottom:10,
            left:0,
            right:0
        };
        
        //let width = (parseInt(d3.select("div#mapChart").style("width")) - margin.left - margin.right);
        let width = 700;
        let mapRatio = 0.5;
        let height = width * mapRatio;
        let active = d3.select(null);
        let mapSvg = d3.select("div#mapChart")
                       .append("svg")
                       .attr("class","center-container")
                       .attr("height", height + margin.top + margin.bottom)
                       .attr("width", width +margin.left + margin.right);
        mapSvg.append("rect")
              .attr("class", "background center-container")
              .attr("height", height + margin.top + margin.bottom)
              .attr("width", width +margin.left + margin.right)

        let max = d3.max(this.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
        let min = d3.min(this.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
        //console.log(max)
        let unemColorScale = d3.scaleLinear()
                               .domain([min,max])
                               .range([0,1]);
        Promise.resolve(d3.json("data/us-counties.topojson"))
               .then(ready);

        let mapprojection = d3.geoAlbersUsa()
                              .translate([width / 2, height / 2])
                              .scale(width);
        let mappath = d3.geoPath()
                        .projection(mapprojection);


        let g_area = mapSvg.append("g")
                           .attr("class","center-container center-items us-state")
                           .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                           .attr('width', width + margin.left + margin.right)
                           .attr('height', height + margin.top + margin.bottom);
        let unemstate = this.unemstate
        let crimerate = this.crimerate
     
        let selection_button = d3.select(".btn-group").selectAll("button").data([1,2,3])

        selection_button.on("click",function(d){
            console.log(d)
            that.currview = d
            //console.log(d)
            //console.log(that.lineChart)
            let cr_max = d3.max(that.crimerate,function(d){return parseFloat(d["rate"])})
            let cr_min = d3.min(that.crimerate,function(d){return parseFloat(d["rate"])})
            let crColorScale = d3.scaleLinear()
                           .domain([cr_min,cr_max])
                           .range([0,1]);
            if(d == 1){
                that.lineChart.drawupdate(that.unemstate, "unemployment", that.activeyear)
                //d3.select("#bar-plot").select("svg").remove();
                //console.log(d3.select("#sorting-button").select("g"))
                //d3.select("#sorting-button").select("g").remove();
                //console.log(that.mapData, that.activeYear)
                //const barChart = new BarPlot(that.mapData, that.activeyear, "sUnem")
                that.updateOverview("unemployment");
                d3.select("#legend1").attr("fill", d3.interpolateBlues(unemColorScale(13.5)))
                d3.select("#legend2").attr("fill", d3.interpolateBlues(unemColorScale(10.5)))
                d3.select("#legend3").attr("fill", d3.interpolateBlues(unemColorScale(7.5)))
                d3.select("#legend4").attr("fill", d3.interpolateBlues(unemColorScale(4.5)))
                d3.select("#legend5").attr("fill", d3.interpolateBlues(unemColorScale(1.5)))
                d3.select("#legendtext1").text("15")
                d3.select("#legendtext2").text("12")
                d3.select("#legendtext3").text("9")
                d3.select("#legendtext4").text("6")
                d3.select("#legendtext5").text("3")
                d3.select("#legendtext6").text("0")
                d3.select("#legendname").text("unemployment rate(%)")
            }
            if(d == 2){
                that.lineChart.drawupdate(that.crimerate, "crime", that.activeyear)
                //d3.select("#bar-plot").select("svg").remove();
                //d3.select("#sorting-button").select("g").remove();
                //console.log(that.mapData, that.activeYear)
                //const barChart = new BarPlot(that.mapData, that.activeyear, "sCrime")
                d3.select("#legend1").attr("fill", d3.interpolateReds(crColorScale(900)))
                d3.select("#legend2").attr("fill", d3.interpolateReds(crColorScale(700)))
                d3.select("#legend3").attr("fill", d3.interpolateReds(crColorScale(500)))
                d3.select("#legend4").attr("fill", d3.interpolateReds(crColorScale(300)))
                d3.select("#legend5").attr("fill", d3.interpolateReds(crColorScale(100)))
                d3.select("#legendtext1").text("10")
                d3.select("#legendtext2").text("8")
                d3.select("#legendtext3").text("6")
                d3.select("#legendtext4").text("4")
                d3.select("#legendtext5").text("2")
                d3.select("#legendtext6").text("0")
                d3.select("#legendname").text("crime rate(‰)")
                that.updateOverview("crime");
            }
            if(d == 3){
                that.lineChart.drawupdate(that.unemstate, "unemployment", that.activeyear)
                d3.select("#legend1").attr("fill", d3.interpolateBlues(unemColorScale(13.5)))
                d3.select("#legend2").attr("fill", d3.interpolateBlues(unemColorScale(10.5)))
                d3.select("#legend3").attr("fill", d3.interpolateBlues(unemColorScale(7.5)))
                d3.select("#legend4").attr("fill", d3.interpolateBlues(unemColorScale(4.5)))
                d3.select("#legend5").attr("fill", d3.interpolateBlues(unemColorScale(1.5)))
                d3.select("#legendtext1").text("15")
                d3.select("#legendtext2").text("12")
                d3.select("#legendtext3").text("9")
                d3.select("#legendtext4").text("6")
                d3.select("#legendtext5").text("3")
                d3.select("#legendtext6").text("0")
                d3.select("#legendname").text("unemployment rate(%)")
                
                that.updateOverview("overview");
            }
            
          let statearea = d3.select("#mapChart").select("#states").selectAll("path")
          
          statearea.attr("fill",function(d){
                                  if(that.currview != 2){
                                      if(d.unemployment_data != undefined){
                                          //console.log(d.properties, d.unemployment_data[0].unemployment_rate)
                                          return(d3.interpolateBlues(unemColorScale(d.unemployment_data[that.activeyear-2007].unemployment_rate)))
                                      }
                                  }
                                  else{
                                      if(d.crimerate != undefined){
                                          //console.log(d.properties, d.unemployment_data[0].unemployment_rate)
                                          return(d3.interpolateReds(crColorScale(d.crimerate[that.activeyear-2007].crimerate)))
                                      }
                                  }
                                  
                              })  
          //console.log(this.currview)
        })
        function ready(us) {
            
            //console.log(topojson.feature(us, us.objects.counties).features.filter(d=>(d.id-d.id%1000)/1000 ==55))
            //console.log(topojson.feature(us, us.objects.states).features.filter(d=>d.id == 55))
            let test = topojson.feature(us, us.objects.states).features;
            //console.log(this)
            for (let i = 0; i<unemstate.length; i=i+12){
                for (let j=0; j<test.length; j++){
                     //console.log(test[j].properties.name,this.unemstate[i].State)
                    if(test[j].properties.name.replace(/[ ]/g,"") === unemstate[i].State.replace(/[ ]/g,"")){
                        for (let k = 0; k<crimerate.length; k=k+12){
                            //console.log(crimerate[k].State)
                            if(test[j].properties.name.replace(/[ ]/g,"") === crimerate[k].State.replace(/[ ]/g,"")){
                                let data_un = [];
                                let data_cr = [];
                                for (let n = 0;n < 12; n++){
                                    //console.log(this.unemstate[i])
                                    data_un[n] = {"year":unemstate[i+n]["Year"],"unemployment_rate":unemstate[i+n]["Unemployment-rate"]}
                                    data_cr[n] = {"year":unemstate[i+n]["Year"],"crimerate":crimerate[k+n]["rate"]}
                                }
                                //console.log(data,test[j].properties.name,this.unemstate[i].State)
                                let new_test = {
                                        "type":test[j].type,
                                        "id":test[j].id,
                                        "properties":test[j].properties,
                                        "geometry":test[j].geometry,
                                        "unemployment_data":data_un,
                                        "crimerate":data_cr
                                    }
                                test[j]=new_test
                                break;
                            }
                        }
                    }
                }
            }
            
            //console.log(test)
            // g_area.append("g")
            //       .attr("id", "counties")
            //       .selectAll("path")
            //       .data(topojson.feature(us, us.objects.counties).features)
            //       .enter()
            //       .append("path")
            //       .attr("d", mappath)
            //       .attr("class", "county-boundary")
            //       .attr("id", function(d){
            //                       let id = (d.id-d.id%1000)/1000
            //                       let name =  topojson.feature(us, us.objects.states).features.filter(d=>d.id == id)
            //                       return(name[0].properties.name+d.properties.name)
            //                   })
            //       .on("click",reset);
            g_area.append("g")
                  .attr("id", "states")
                  .selectAll("path")
                  .data(function(d){
                            //console.log(d)
                            let dataset = test;
                            //let dataset = topojson.feature(us, us.objects.states).features;
                            //console.log(dataset)
                            return dataset;
                        })
                  .enter()
                  .append("path")
                  .attr("d", mappath)
                  .attr("class", "state")
                  .attr("id",function(d){
                                 //console.log(d)
                                 return d.properties.name.replace(/[ ]/g,"")
                             })
                  .attr("fill",function(d){
                                  if(d.unemployment_data != undefined){
                                      //console.log(d.properties, d.unemployment_data[0].unemployment_rate)
                                      return(d3.interpolateBlues(unemColorScale(d.unemployment_data[0].unemployment_rate)))
                                  }  
                               })
                  
                  .on('mouseenter', function (d) {
                                        //console.log(d)
                                        let state = "#"+this.id;
                                        d3.select("#mapChart")
                                          .append("div")
                                          .classed("tooltip", true)
                                          .style("opacity", 0);
                                        let tooltip = d3.select(".tooltip");
                                        if(that.currview != 3){
                                          let staterect = d3.select("div#bar-plot").selectAll(state);
                                          //staterect.style("opacity",0.5);
                                          const y = staterect.attr("y");
                                          var line = d3.select(".bars")
                                                       .append("line")
                                                       .attr('id', 'limit')
                                                       .attr('x1', 0)
                                                       .attr('y1', y)
                                                       .attr('x2', 1300)
                                                       .attr('y2', y)
                                                       .attr("stroke","red")
                                                       .attr("stroke-width","3px")
                                                       .attr("stroke-dasharray", "3 6");
                                        }
                                        let year = that.activeyear;
                                        let staterect = d3.select("div#bar-plot").selectAll(state);
                                        //staterect.style("opacity",0.5);
                                        staterect.classed("selected",true)
                                        const y = staterect.attr("y");
                                        var line = d3.select(".bars")
                                                     .append("line")
                                                     .attr('id', 'limit')
                                                     .attr('x1', 0)
                                                     .attr('y1', y)
                                                     .attr('x2', 1300)
                                                     .attr('y2', y)
                                                     .attr("stroke","red")
                                                     .attr("stroke-width","3px")
                                                     .attr("stroke-dasharray", "3 6");
                                        d3.select("div#lineChart").selectAll(state).classed("selectedPath",true)
                                        //console.log(d3.selectAll("path").select(state))
                                        //d3.selectAll("path").select(state).attr("fill","orange")

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
                                        d3.select("div#lineChart").selectAll("#linename").text(d.properties.name)
                                        d3.select("div#bubbleChart").selectAll(state).classed("selectedBubble",true)
                                        d3.select("div#lineChart")
                                          .select("svg")
                                          .append("circle")
                                          .attr("cx",x_scale(year))
                                          .attr("cy",function(){
                                            if (that.currview == 1 || that.currview == 3){
                                                return y_scale_um(d["unemployment_data"][year-2007]["unemployment_rate"])
                                            }
                                            if (that.currview == 2){
                                                return y_scale_cr(d["crimerate"][year-2007]["crimerate"])
                                            }
                                        })
                                          .attr("r",5)
                                          .attr("fill","white")
                                          .attr("stroke","red")
                                          .attr("strokeStyle","red")
                                          .attr("stroke-width",3)
                                          .attr("transform","translate(40,30)")
                                          .attr("id","poscircle")
                                        tooltip.transition()
                                               .duration(200)
                                               .style("opacity", 0.9);
                                        tooltip
                                               .html(that.tooltipRender(d) + "<br/>")
                                                //.style("font-size",10)
                                               .style("left", (d3.event.pageX + 80) + "px")
                                               .style("top", (d3.event.pageY+40) + "px");
                                    })  
                  .on("mouseleave", function (d) {
                                        let state = "#"+this.id
                                        //d3.select(".bars").selectAll(state).style("opacity",1)
                                        d3.select(".bars").selectAll(state).classed("selected",false);
                                        d3.select("div#lineChart").selectAll(state).classed("selectedPath",false)
                                        //d3.select(this).style("opacity",1);
                                        d3.select(".bars").selectAll('#limit').remove()
                                        d3.select("div#lineChart").selectAll("#linename").text("")
                                        d3.select("div#bubbleChart").selectAll(state).classed("selectedBubble",false)
                                        let tooltip = d3.select(".tooltip");
                                        tooltip.remove()
                                        d3.selectAll("#poscircle").remove();
                                    });

            g_area.append("path")
                  .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                  .attr("id", "state-borders")
                  .attr("d", mappath)
                  //.attr("fill", "black")
            g_area.append("rect")
                  .attr("x",600)
                  .attr("y",300)
                  .attr("height",15)
                  .attr("width",10)
                  .attr("id","legend1")
                  .attr("class","legend")
                  .attr("fill", d3.interpolateBlues(unemColorScale(13.5)))
            g_area.append("rect")
                  .attr("x",600)
                  .attr("y",315)
                  .attr("height",15)
                  .attr("width",10)
                  .attr("id","legend2")
                  .attr("class","legend")
                  .attr("fill", d3.interpolateBlues(unemColorScale(10.5)))
            g_area.append("rect")
                  .attr("x",600)
                  .attr("y",330)
                  .attr("height",15)
                  .attr("width",10)
                  .attr("id","legend3")
                  .attr("class","legend")
                  .attr("fill", d3.interpolateBlues(unemColorScale(7.5)))
            g_area.append("rect")
                  .attr("x",600)
                  .attr("y",345)
                  .attr("height",15)
                  .attr("width",10)
                  .attr("id","legend4")
                  .attr("class","legend")
                  .attr("fill", d3.interpolateBlues(unemColorScale(4.5)))
            g_area.append("rect")
                  .attr("x",600)
                  .attr("y",360)
                  .attr("height",15)
                  .attr("width",10)
                  .attr("id","legend5")
                  .attr("class","legend")
                  .attr("fill", d3.interpolateBlues(unemColorScale(1.5)))
            g_area.append("text")
                  .attr("x",612)
                  .attr("y",303)
                  .attr("class","legendtext")
                  .attr("id","legendtext1")
                  .text("15")
            g_area.append("text")
                  .attr("x",612)
                  .attr("y",318)
                  .attr("class","legendtext")
                  .attr("id","legendtext2")
                  .text("12")
            g_area.append("text")
                  .attr("x",612)
                  .attr("y",333)
                  .attr("class","legendtext")
                  .attr("id","legendtext3")
                  .text("9")
            g_area.append("text")
                  .attr("x",612)
                  .attr("y",348)
                  .attr("class","legendtext")
                  .attr("id","legendtext4")
                  .text("6")
            g_area.append("text")
                  .attr("x",612)
                  .attr("y",363)
                  .attr("class","legendtext")
                  .attr("id","legendtext5")
                  .text("3")
            g_area.append("text")
                  .attr("x",612)
                  .attr("y",378)
                  .attr("class","legendtext")
                  .attr("id","legendtext6")
                  .text("0")
            g_area.append("text")
                  .attr("x",580)
                  .attr("y",290)
                  .attr("class","legendtext")
                  .attr("id","legendname")
                  .text("unemployment rate(%)")


        }
        function clicked(d) {
            if (d3.select('.background').node() === this) return reset();
    
            if (active.node() === this) return reset();

            active.classed("active", false);
            active = d3.select(this).classed("active", true);

            var bounds = mappath.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

            g_area.transition()
                  .duration(750)
                  .style("stroke-width", 1.5 / scale + "px")
                  .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        }


        function reset() {
            active.classed("active", false);
            active = d3.select(null);

            g_area.transition()
                  .delay(100)
                  .duration(750)
                  .style("stroke-width", "1.5px")
                  .attr('transform', 'translate('+margin.left+','+margin.top+')');
        }


        
    }
    tooltipRender(data) {
          let text = "<h2>" + "State: " + data.properties.name + "</h2>";
          let other = this.otherdata.filter(d=>{
            return (parseInt(d.Year) == this.activeyear && d.State == data.properties.name);
          })
          let crime = this.crimerate.filter(d=>{
            return (parseInt(d.Year) == this.activeyear && d.State == data.properties.name);  
          })
          //console.log(crime)
          text += "<h2>" + "Unemployment Rate: " + other[0]["Unemployment-rate"] + "%<h2>";
          text += "<h2>" + "Crime Rate: " + (crime[0]["rate"]/100).toFixed(2) + "‰<h2>";
          text += "<h2>" + "Income: " + other[0]["Income"] + "$<h2>";
          text += "<h2>" + "Population: " + other[0]["Population"] + "<h2>";
          return text;
        }

}


