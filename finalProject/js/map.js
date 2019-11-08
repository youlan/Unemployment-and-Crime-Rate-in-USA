// var margin = {
//     top: 10,
//     bottom: 10,
//     left: 10,
//     right:10
// }, width = parseInt(d3.select('.viz').style('width'))
//     , width = width - margin.left - margin.right
//     , mapRatio = 0.5
//     , height = width * mapRatio
//     , active = d3.select(null);

// var svg = d3.select('.viz').append('svg')
//     .attr('class', 'center-container')
//     .attr('height', height + margin.top + margin.bottom)
//     .attr('width', width + margin.left + margin.right);

// svg.append('rect')
//     .attr('class', 'background center-container')
//     .attr('height', height + margin.top + margin.bottom)
//     .attr('width', width + margin.left + margin.right)
//     .on('click', clicked);


// Promise.resolve(d3.json("us-counties.topojson"))
//     .then(ready);

// var projection = d3.geoAlbersUsa()
//     .translate([width /2 , height / 2])
//     .scale(width);

// var path = d3.geoPath()
//     .projection(projection);

// var g = svg.append("g")
//     .attr('class', 'center-container center-items us-state')
//     .attr('transform', 'translate('+margin.left+','+margin.top+')')
//     .attr('width', width + margin.left + margin.right)
//     .attr('height', height + margin.top + margin.bottom)

// function ready(us) {

//     g.append("g")
//      .attr("id", "counties")
//      .selectAll("path")
//      .data(topojson.feature(us, us.objects.counties).features)
//      .enter().append("path")
//      .attr("d", path)
//      .attr("class", "county-boundary")
//     .on("click", reset);

//             g.append("g")
//                 .attr("id", "states")
//                 .selectAll("path")
//                 .data(topojson.feature(us, us.objects.states).features)
//                 .enter().append("path")
//                 .attr("d", path)
//                 .attr("class", "state")
//                 .on("click", clicked);


//             g.append("path")
//                 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
//                 .attr("id", "state-borders")
//                 .attr("d", path);

//         }

//         function clicked(d) {
//             if (d3.select('.background').node() === this) return reset();

//             if (active.node() === this) return reset();

//             active.classed("active", false);
//             active = d3.select(this).classed("active", true);

//             var bounds = path.bounds(d),
//                 dx = bounds[1][0] - bounds[0][0],
//                 dy = bounds[1][1] - bounds[0][1],
//                 x = (bounds[0][0] + bounds[1][0]) / 2,
//                 y = (bounds[0][1] + bounds[1][1]) / 2,
//                 scale = .9 / Math.max(dx / width, dy / height),
//                 translate = [width / 2 - scale * x, height / 2 - scale * y];

//             g.transition()
//                 .duration(750)
//                 .style("stroke-width", 1.5 / scale + "px")
//                 .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
//         }


//         function reset() {
//             active.classed("active", false);
//             active = d3.select(null);

//             g.transition()
//                 .delay(100)
//                 .duration(750)
//                 .style("stroke-width", "1.5px")
//                 .attr('transform', 'translate('+margin.left+','+margin.top+')');

//         }
let margin = {
    top:10,
    bottom:10,
    left:10,
    right:10
};
let width = (parseInt(d3.select(".mapChart").style("width")) - margin.left - margin.right)*0.7;
let mapRatio = 0.5;
let height = width * mapRatio;
let active = d3.select(null);
let mapSvg = d3.select(".mapChart")
               .append("svg")
               .attr("class","center-container")
               .attr("height", height + margin.top + margin.bottom)
               .attr("width", width +margin.left + margin.right);
mapSvg.append("rect")
      .attr("class", "background center-container")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width +margin.left + margin.right)
      //.on("click", clicked)
let unstateCSV;

d3.csv("data/unemployment_state.csv").then(readCSV=> {
  let max = d3.max(readCSV,function(d){return parseFloat(d["Unempolyment-rate"])})
  let min = d3.min(readCSV,function(d){return parseFloat(d["Unempolyment-rate"])})
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
  
  function ready(us) {
      //console.log(topojson.feature(us, us.objects.counties).features.filter(d=>(d.id-d.id%1000)/1000 ==55))
      //console.log(topojson.feature(us, us.objects.states).features.filter(d=>d.id == 55))
      test = topojson.feature(us, us.objects.states).features;
      console.log(readCSV)
      for (let i = 0; i<readCSV.length; i=i+12){
          for (let j=0; j<test.length; j++){
            //console.log(test[j].properties.name,readCSV[i].State)
            if(test[j].properties.name === readCSV[i].State){
              let data = [];
              for (let k = 0;k < 12; k++){
                //console.log(readCSV[i])
                data[k] = {"year":readCSV[i+k]["Year"],"unemployment_rate":readCSV[i+k]["Unempolyment-rate"]}
              }
              //console.log(data,test[j].properties.name,readCSV[i].State)
              new_test = {
                "type":test[j].type,
                "id":test[j].id,
                "properties":test[j].properties,
                "geometry":test[j].geometry,
                "unemployment_data":data
              }
              test[j]=new_test
              break;
            }
          }
      }
      console.log(test)
      g_area.append("g")
            .attr("id", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter()
            .append("path")
            .attr("d", mappath)
            .attr("class", "county-boundary")
            .attr("id", function(d){
              let id = (d.id-d.id%1000)/1000
              let name =  topojson.feature(us, us.objects.states).features.filter(d=>d.id == id)
                 return(name[0].properties.name+d.properties.name)
              })
            .on("click",reset);
      g_area.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(function(d){
              //console.log(d)
              let dataset = test;
              //let dataset = topojson.feature(us, us.objects.states).features;
              console.log(dataset)
              return dataset;
            })
            .enter()
            .append("path")
            .attr("d", mappath)
            .attr("class", "state")
            .attr("id",function(d){
              //console.log(d)
              return d.properties.name.replace(/[ ]/g,"")})
            .attr("fill",function(d){
              if(d.unemployment_data != undefined){
                return(d3.interpolateBlues(unemColorScale(d.unemployment_data[0].unemployment_rate)))
              }
            })
            .on("click",clicked)
            .on('mouseenter', function (d) {
                let state = "#"+this.id
                let staterect = d3.select(".bars").selectAll(state)
                staterect.style("opacity",0.5)
                //console.log(staterect.datum().value)
                let yScale = d3.scaleLinear()
                               .range([280,0])
                               .domain([0,660])
                               .nice();
                const y = yScale(staterect.datum().value)
                //console.log(y)
                var line = d3.select(".bars").append("line")
                    .attr('id', 'limit')
                    .attr('x1', 0)
                    .attr('y1', y)
                    .attr('x2', 1300)
                    .attr('y2', y)
                    .attr("stroke","red")
                    .attr("stroke-width","3px")
                    .attr("stroke-dasharray", "3 6");
                //console.log(d3.selectAll("path").select(state))
                //d3.selectAll("path").select(state).attr("fill","orange")
            })
            .on("mouseleave", function (d) {
                let state = "#"+this.id
                d3.select(".bars").selectAll(state).style("opacity",1)
                //d3.select(this).style("opacity",1);
                d3.select(".bars").selectAll('#limit').remove()
            });

      g_area.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("id", "state-borders")
            .attr("d", mappath);
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

});





