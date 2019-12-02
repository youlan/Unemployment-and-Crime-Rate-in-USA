class StoryTelling {
  constructor(data, lineChart, unemstate, activeyear, updateOverview) {
    this.margin = { top: 20, right: 20, bottom: 60, left: 80 };
    this.width = 1000 - this.margin.left - this.margin.right;
    this.height = 1800 - this.margin.top - this.margin.bottom;
    this.lineChart = lineChart
    this.unemstate = unemstate
    this.activeyear = activeyear
    this.updateOverview = updateOverview
    this.xScale = d3
      .scaleLinear()
      .range([this.margin.left, this.width])
      .domain([-50, 60])
      .nice();

    let that = this;
    this.data = data;
    this.category = d3
      .map(this.data, function(d) {
        return d.category;
      })
      .keys();

    // get one category
    this.c0 = this.data["unemployment"].filter(function(d) {
      return d.category === that.category[1];
    });
    // get extreme on this category
    this.min0 = d3.min(this.c0, function(d) {
      return d.sourceX;
    });

    this.contentData = [];
    this.contentData.push({ value: [this.min0] });
    this.create();
    let content = d3.select("#myNav").select(".overlay-content");
    content.append("g").attr("id", "first-content");
    content.append("g").attr("id", "second-content");
  }

  create() {
    let that = this;
    let story = d3.select("#storyTelling");
    story.on("click", function() {
      document.getElementById("myNav").style.width = "100%";
      
      let content = d3.select("#myNav").select(".overlay-content");
      // console.log(that.contentData.value[0]);
      content.selectAll("svg").remove();
      let c0 = content
        .select("#first-content")
        .append("svg")
        .attr("width",1000)
        .attr("height",1000)
        .attr("class","story")
        .selectAll("text")
        .data(that.contentData);
      c0.exit().remove();
      let c0Enter = c0.enter().append("text");
      c0 = c0Enter.merge(c0);
      d3.select(".story").append("rect")
        .attr("x",230)
        .attr("y",100)
        .attr("width",50)
        .attr("height",400)
        .attr("fill","none")
        .attr("stroke","red")
        .attr("stroke-width","red")
      c0.text(
        "Sharp increase of unemployment due to financial crisis in 2007- 2008"
      )
        .attr("y",50)
      that.lineChart.drawupdate(that.unemstate, "unemployment", that.activeyear)
      that.updateOverview("unemployment");
      let max = d3.max(that.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
      let min = d3.min(that.unemstate,function(d){return parseFloat(d["Unemployment-rate"])})
      let unemColorScale = d3.scaleLinear()
                             .domain([min,max])
                             .range([0,1]);
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
      let statearea = d3.select("#mapChart").select("#states").selectAll("path")
      statearea.attr("fill",function(d){
        if(d.unemployment_data != undefined){
              //console.log(d.properties, d.unemployment_data[0].unemployment_rate)
              return(d3.interpolateBlues(unemColorScale(d.unemployment_data[that.activeyear-2007].unemployment_rate)))
          }
      })
    });
  }
}
