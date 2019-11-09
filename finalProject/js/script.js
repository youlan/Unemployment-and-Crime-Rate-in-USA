d3.csv("data/unemployment_state.csv").then(unemstate=>{

    d3.csv("data/crimerate.csv").then(mapData => {


        this.activeYear = "2010";
        let that = this;

        var data = d3.nest()
            .key(function (d) {
                //return d.Area.replace(/(^\s*)|(\s*$)/g, "");
                return d.Area;
            })
            .entries(mapData);

        const barChart = new BarPlot(data, this.activeYear)
        const mapChart = new Map(unemstate)
        const lineChart = new Line(unemstate)
        //console.log(data);
    });
});