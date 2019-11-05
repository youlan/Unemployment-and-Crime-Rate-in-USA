

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
        console.log(data);
    });
