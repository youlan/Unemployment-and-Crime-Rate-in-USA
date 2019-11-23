loadData().then(mapData => {

    console.log(mapData);
    this.activeState = null;
    this.activeYear = "2007";
    let that = this;
    this.dataLabel = "sUnem";
    //label: "sUnem", "sCrime"
    
    //let listOfStates = mapData[this.dataLabel].map(d=>d.key);

    const barChart = new BarPlot(mapData, this.activeYear, this.dataLabel)

    console.log(mapData)
    d3.csv("data/unemployment_state.csv").then(unemstate=>{
        d3.csv("data/crimerate.csv").then(crimerate=>{
            //console.log(crimerate)
            const lineChart = new Line(unemstate, crimerate)
            const mapChart = new Map(unemstate, crimerate, this.activeYear, updateYear, updateState, lineChart, mapData)
            function updateState() {
                if(that.activeState == undefined || that.activeState == null){
                    return null;
                }
    
            }

            function updateYear(year) {
                this.activeYear = year;
                //console.log(year);
                barChart.updateBarYear(year)
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
    //let cUnData = await loadFile('data/unemployment_country.csv');


    //return [sUnem, cUnem, sCrime];
    return {
        'sUnem': sUnData,
        'sCrime': sCrime
        //'cUnem': cUnData,
    };
}