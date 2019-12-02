loadData().then(mapData => {


    this.activeState = null;
    this.activeYear = "2007";
    let that = this;
    this.dataLabel = "unemployment";

    //document.body.style.zoom = 0.67;
    const bubbleChart = new bubblePlot(mapData, this.activeYear);
    document.getElementById("bubbleChart").style.display = "none";
    const barChart = new BarPlot(mapData, this.activeYear, this.dataLabel);

    function updateOverview(label){

        this.dataLabel = label;
        if (label === "unemployment" || label === "crime"){
            //console.log("here")
            document.getElementById("bubbleChart").style.display = "none";
            document.getElementById("barChart").style.display = "block";

            barChart.ChangeOverView(label);
        }
        if(label === "overview"){
            //console.log("here")
            document.getElementById("barChart").style.display = "none";
            document.getElementById("bubbleChart").style.display = "block";
        }
    }

    function updateYear(year) {
        this.activeYear = year;

        barChart.updateBarYear(year);
        bubbleChart.updateYear(year);
    }


    d3.csv("data/unemployment_state.csv").then(unemstate=>{
        d3.csv("data/crimerate.csv").then(crimerate=>{
            d3.csv("data/metadata.csv").then(otherdata=>{

                const lineChart = new Line(unemstate, crimerate)
                const mapChart = new Map(unemstate, crimerate, this.activeYear, updateYear, updateState, updateOverview, lineChart, otherdata)
                const storyTelling = new StoryTelling(mapData,lineChart,unemstate,this.activeYear,updateOverview);

                function updateState() {
                    if (that.activeState == undefined || that.activeState == null) {
                        return null;
                    }

                }

            })

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
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}