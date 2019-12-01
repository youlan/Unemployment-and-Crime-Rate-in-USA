class StoryTelling {
  constructor(data) {
    this.margin = { top: 20, right: 20, bottom: 60, left: 80 };
    this.width = 1000 - this.margin.left - this.margin.right;
    this.height = 1800 - this.margin.top - this.margin.bottom;

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

      let c0 = content
        .select("#first-content")
        .selectAll("text")
        .data(that.contentData);
      c0.exit().remove();
      let c0Enter = c0.enter().append("text");
      c0 = c0Enter.merge(c0);
      c0.text(
        "Sharp increase of unemployment due to financial crisis in 2007- 2008"
      )
        .attr("x", 400)
        .attr("y", 50);
    });
  }
}
