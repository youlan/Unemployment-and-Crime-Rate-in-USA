loadData().then(mapData => {


    this.activeState = null;
    this.activeYear = "2007";
    let that = this;
    this.dataLabel = "unemployment";


    //


    //console.log(mapData);
    d3.csv("data/unemployment_state.csv").then(unemstate=>{
        d3.csv("data/crimerate.csv").then(crimerate=>{

            const lineChart = new Line(unemstate, crimerate)
            const mapChart = new Map(unemstate, crimerate, this.activeYear, updateYear, updateState, updateOverview, lineChart, mapData, this.dataLabel)


            //const barChart = new BarPlot(mapData, this.activeYear, this.dataLabel);

            const bubbleChart = new bubblePlot(mapData, this.activeYear);
            function updateState() {
                if(that.activeState == undefined || that.activeState == null){
                    return null;
                }
    
            }

            function updateYear(year) {
                this.activeYear = year;

                //barChart.updateBarYear(year);
                bubbleChart.updateYear(year);

            }

            function updateOverview(label) {
                //console.log(label);
                this.dataLabel = label;
                barChart.ChangeOverView(label);
            }


            //console.log(data);
        });
    });
});

async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        var mapped = d3.nest()
            .key(function (d) {
              return d.State;
            })
            .entries(d);
        return mapped;
    });
    //console.log(data);
    return data;
}

async function loadData() {
    let sUnData = await loadFile('data/unemployment_state.csv');
    let sCrime = await loadFile('data/crimerate.csv');
    let sIncome = await loadFile('data/finalincomebystate.csv');
    let sPopulation = await  loadFile("data/populations.csv")


    //return [sUnem, cUnem, sCrime];
    return {
        'unemployment': sUnData,
        'crime': sCrime,
        'income': sIncome,
        "population":sPopulation
    };
}