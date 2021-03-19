const Users = new function () {
  this._ele = null;
  this._data = [];
  this._searchName = "";
  this._searchFollowers = "";
  this._searchScore = "";
  this._searchFriend = "";
  this._searchFavourite = "";
  this._sorting = "";
  this._sortingField = "";

  this.init = (ele) => {
    this._ele = $("#" + ele);
    const curThis = this;
    $.get("./user/getTopUsers", function (data) {
      curThis._data = data;
      curThis.renderHtml(data);
    });
  }

  this.reInit = () => {
    const curThis = this;
    $.get("./user/getTopUsers", function (data) {
      curThis._data = data;
      curThis.rerender();
    });
  }


  this.showHistory = (id, fieldValue, field) => {
    document.getElementById('cvx-history').innerHTML = "";
    document.getElementById('div-history').innerHTML = "";
    if (field === 'created') {
      this.showCreatedHistogram(id, fieldValue);
      $('#div-history').show();
      $('#cvx-history').hide();
    }
    else {
      this.getUserFeatureHistory(id, field);
      $('#div-history').hide();
      $('#cvx-history').show();
    }
  }

  this.getUserFeatureHistory = (id, field) => {
    d3.json(`./user/getUserFeatureHistory?id=${id}&field=${field}`, function (error, data) {
      $("#btnViewDetail").trigger("click");
      var ctx = document.getElementById('cvx-history').getContext('2d');
      const labels = [];
      const graphData = [];
      data = data.results;
      for (let i = 0; i < data.length; i++) {
        labels.push(data[i].date);
        graphData.push(data[i].total);
      }
      let chartAxis = '# followers';
      if (field === 'friend') {
        chartAxis = '# friends';
      }
      if (field === 'favourite') {
        chartAxis = '# favourites';
      }
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Users',
            data: graphData,
            borderColor: '#022859',
            fill: false
          }]
        },
        padding: 7,
        options: {
          legend: {
            display: false,
            position: 'right',
            labels: {
              boxWidth: 40,
              fontSize: 12,
            },
          },
          scales: {
            yAxes: [{
              ticks: {
                maxTicksLimit: 4,
              },
              scaleLabel: {
                display: true,
                labelString: chartAxis,
                fontSize: 14,
              },
            }],
            xAxes: [{
              ticks: {
                maxTicksLimit: 15,
              },
              scaleLabel: {
                display: true,
                labelString: 'Date',
                float: 'right',
                fontSize: 14,
              },
              maxBarThickness: 100,
            }],
          },
        }
      });
    });
  }

  this.showCreatedHistogram = (id, fieldValue) => {
    d3.json("./user/getCreatedByDate?id=" + id, function (error, data) {
      const interval = Utils.datediff(fieldValue, new Date());
      $("#btnViewDetail").trigger("click");
      var margin = { top: 10, right: 30, bottom: 50, left: 40 },
        width = 590 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#div-history")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // Add an x-axis label.
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + height + ')')
        .append('text')
        .attr('transform', 'translate(' + (width / 2) + ', 0)')
        .attr('class', 'gia-axisLabel')
        .attr('x', 0)
        .attr('y', 35)
        .style('text-anchor', 'middle')
        .text("Age");

      // Add a y-axis label.
      svg.append('g')
        .attr('class', 'y axis')
        .append('text')
        .attr('class', 'gia-axisLabel')
        .attr('transform', 'rotate(-90)')
        .attr("y", -40)
        .attr("x", -height / 2)
        .attr("dy", ".75em")
        .style('text-anchor', 'middle')
        .text("# users");

      // X axis: scale and draw:
      var x = d3.scaleLinear()
        .domain([0, 4757])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Y axis: initialization
      var y = d3.scaleLinear()
        .range([height, 0]);
      var yAxis = svg.append("g")

      // A function that builds the graph for a specific value of bin
      function update(nBin) {

        // set the parameters for the histogram
        var histogram = d3.histogram()
          .value(function (d) { return d; })
          .domain(x.domain())
          .thresholds(x.ticks(nBin));

        // And apply this function to data to get the bins
        var bins = histogram(data.results);
        y.domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
        yAxis
          .transition()
          .duration(1000)
          .call(d3.axisLeft(y));

        // Join the rect with the bins data
        var u = svg.selectAll("rect").data(bins)

        // Manage the existing bars and eventually the new ones:
        u.enter()
          .append("rect") // Add a new rect for each new elements
          .merge(u) // get the already existing elements as well
          .transition() // and apply changes to all of them
          .duration(1000)
          .attr("x", 1)
          .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
          .attr("height", function (d) { return height - y(d.length); })
          .style("fill", function (d) {
            if (d[0] <= interval && d[d.length - 1] >= interval) return 'rgb(251 100 100)';
            return '#002353';
          });


        // If less bar in the new histogram, I delete the ones not in use anymore
        u.exit().remove();

      };
      // Initialize with 20 bins
      update(20);
    });
  };

  this.changeFilter = (ele, item) => {
    if (item === "followers") {
      this._searchFollowers = $(ele).val();
    }
    if (item === "score") {
      this._searchScore = $(ele).val();
    }
    if (item === "text") {
      this._searchName = $(ele).val();
    }
    if (item === "friends") {
      this._searchFriend = $(ele).val();
    }
    if (item === "favourites") {
      this._searchFavourite = $(ele).val();
    }
    this.rerender();
  }

  this.rerender = () => {
    let data = this._data.slice(0);
    if (this._searchName) {
      data = data.filter(word => word.text.indexOf(this._searchName) >= 0);
    }
    if (this._searchFriend) {
      data = data.filter(word => Utils.compareCondition(word.friends_count, this._searchFriend));
    }
    if (this._searchScore) {
      data = data.filter(word => Utils.compareCondition(word.score, this._searchScore));
    }
    if (this._searchFollowers) {
      data = data.filter(word => Utils.compareCondition(word.followers_count, this._searchFollowers));
    }
    if (this._searchFavourite) {
      data = data.filter(word => Utils.compareCondition(word.favourites_count, this._searchFavourite));
    }
    data.sort(Utils.dynamicSort(this._sortingField, this._sorting));
    this.renderHtml(data);
  }

  this.getSortingIcon = (field) => {
    if (field === this._sortingField) {
      switch (this._sorting) {
        case "asc":
          return "sorting_asc";
        case "desc":
          return "sorting_desc";
        default:
          return "sorting";
      }
    }
    return "sorting";
  }

  this.toggleSorting = (field) => {
    if (field != this._sortingField) {
      this._sortingField = field;
      this._sorting = "asc";
      Users.rerender();
      return;
    }
    if (this._sorting == 'asc') {
      this._sorting = "desc";
    } else if (this._sorting == 'desc') {
      this._sorting = "";
    } else if (this._sorting == '') {
      this._sorting = "asc";
    }
    Users.rerender();
  }

  this.renderHeader = () => {
    let thead = '<thead><tr>';
    thead += '<th onclick="Users.toggleSorting(\'text\')" class="' + Users.getSortingIcon('text') + '">Name</th>';
    thead += '<th onclick="Users.toggleSorting(\'followers_count\')" class="' + Users.getSortingIcon('followers_count') + '">Followers</th>';
    thead += '<th onclick="Users.toggleSorting(\'friends_count\')" class="' + Users.getSortingIcon('friends_count') + '">Friends</th>';
    thead += '<th onclick="Users.toggleSorting(\'favourites_count\')" class="' + Users.getSortingIcon('favourites_count') + '">Favourites</th>';
    thead += '<th onclick="Users.toggleSorting(\'score\')" class="' + Users.getSortingIcon('score') + '">p-value</th>';
    thead += '</tr></thead>';
    return thead;
  }

  this.renderHtml = (data) => {
    let html = '<table>';
    const thead = Users.renderHeader();
    html += thead;
    html += "<tr>";
    html += '<td>' + '<input onChange="Users.changeFilter(this,\'text\');"  type="text"  value="' + this._searchName + '"/>' + '</td>';
    html += '<td>' + '<input placeholder="= | > | < | >= | <= + value" onChange="Users.changeFilter(this,\'followers\');"  type="text"  value="' + this._searchFollowers + '"/>' + '</td>';
    html += '<td>' + '<input placeholder="= | > | < | >= | <= + value" onChange="Users.changeFilter(this,\'friends\');"  type="text"  value="' + this._searchFriend + '"/>' + '</td>';
    html += '<td>' + '<input placeholder="= | > | < | >= | <= + value" onChange="Users.changeFilter(this,\'favourites\')" class="search-number" type="text" value="' + this._searchFavourite + '"/>' + '</td>';
    html += '<td>' + '<input placeholder="= | > | < | >= | <= + value" onChange="Users.changeFilter(this,\'score\')"  class="search-number" type="text" value="' + this._searchScore + '"/>' + '</td>';
    html += "</tr>";
    for (let i = 0; i < data.length; i++) {
      let highlightClass = "";
      if (data[i]['score'] <= ALPHA_MAX) {
        highlightClass = 'highlight';
      }
      let tr = '<tr style="cursor:pointer" onclick="RumourGraph.changeSelectedItem(\'' + data[i]["id"] + '\')">';
      tr += '<td>' + data[i]['text'] + '</td>';
      tr += '<td class="textRight">' + data[i]['followers_count'] + '</td>';
      tr += '<td class="textRight">' + data[i]['friends_count'] + '</td>';
      tr += '<td class="textRight">' + data[i]['favourites_count'] + '</td>';
      tr += '<td class="textRight ' + highlightClass + '">' + data[i]['score'].toFixed(3) + '</td>';
      tr += '</tr>';
      html += tr;
    }
    html += '</table>';
    this._ele.html(html);
  }
}