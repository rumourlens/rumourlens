const Link = new function () {
  this._ele = null;
  this._data = [];
  this._searchName = "";
  this._searchMentions = "";
  this._searchScore = "";
  this._sorting = "";
  this._sortingField = "";

  this.init = (ele) => {
    this._ele = $("#" + ele);
    const curThis = this;
    $.get("./link/getTopLinks", function (data) {
      curThis._data = data;
      curThis.renderHtml(data);
    });
  }

  this.reInit = () => {
    const curThis = this;
    $.get("./link/getTopLinks", function (data) {
      curThis._data = data;
      curThis.rerender();
    });
  }

  this.changeFilter = (ele, item) => {
    if (item === "usages") {
      this._searchMentions = $(ele).val();
    }
    if (item === "score") {
      this._searchScore = $(ele).val();
    }
    if (item === "text") {
      this._searchName = $(ele).val();
    }
    Link.rerender();
  }

  
  this.showHistory = (id) => {
    document.getElementById('cvx-history').innerHTML = "";
    document.getElementById('div-history').innerHTML = "";

    d3.json("./link/getMentionHistory?id=" + id, function (error, data) {
      $("#btnViewDetail").trigger("click");
      $('#div-history').hide();
      $('#cvx-history').show();
      var ctx = document.getElementById('cvx-history').getContext('2d');
      const labels = [];
      const graphData = [];
      data = data.results;
      for (let i = 0; i < data.length; i++) {
        labels.push(data[i].date);
        graphData.push(data[i].total);
      }
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Usages',
            data: graphData,
            backgroundColor: "#022859",
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
                labelString: 'Mentions',
                fontSize: 14,
              },
            }],
            xAxes: [{
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

  this.rerender = () => {
    let data = this._data.slice(0);
    if (this._searchName) {
      data = data.filter(word => word.text.indexOf(this._searchName) >= 0);
    }
    if (this._searchScore) {
      data = data.filter(word => Utils.compareCondition(word.score, this._searchScore));
    }
    if (this._searchMentions) {
      data = data.filter(word => Utils.compareCondition(word.mentions, this._searchMentions));
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
      Link.rerender();
      return;
    }
    if (this._sorting == 'asc') {
      this._sorting = "desc";
    } else if (this._sorting == 'desc') {
      this._sorting = "";
    } else if (this._sorting == '') {
      this._sorting = "asc";
    }
    Link.rerender();
  }

  this.renderHeader = () => {
    let thead = '<thead><tr>';
    thead += '<th onclick="Link.toggleSorting(\'text\')" class="' + Link.getSortingIcon('text') + '">Link</th>';
    thead += '<th onclick="Link.toggleSorting(\'mentions\')" class="' + Link.getSortingIcon('mentions') + '">Mentions</th>';
    thead += '<th onclick="Link.toggleSorting(\'score\')" class="' + Link.getSortingIcon('score') + '">p-value</th>';
    thead += '</tr></thead>';
    return thead;
  }

  this.renderHtml = (data) => {
    let html = '<table>';
    const thead = Link.renderHeader();
    html += thead;
    html += "<tr>";
    html += '<td>' + '<input onChange="Link.changeFilter(this,\'text\');"  type="text"  value="' + this._searchName + '"/>' + '</td>';
    html += '<td class="textRight">' + '<input placeholder="= | > | < | >= | <= + value" onChange="Link.changeFilter(this,\'usages\')" class="search-number" type="text" value="' + this._searchMentions + '"/>' + '</td>';
    html += '<td class="textRight">' + '<input placeholder="= | > | < | >= | <= + value" onChange="Link.changeFilter(this,\'score\')" class="search-number" type="text" value="' + this._searchScore + '"/>' + '</td>';
    html += "</tr>";
    for (let i = 0; i < data.length; i++) {
      let highlightClass = "";
      if (data[i]['score'] <= ALPHA_MAX) {
        highlightClass = 'highlight';
      }
      let tr = '<tr  style="cursor:pointer" onclick="RumourGraph.changeSelectedItem(\'' + data[i]["id"] + '\')">';
      tr += '<td> <div class="wrapText">' + data[i]['text'] + '</div></td>';
      tr += '<td class="textRight">' + data[i]['mentions'] + '</td>';
      tr += '<td class="textRight ' + highlightClass + '">' + data[i]['score'].toFixed(3) + '</td>';
      tr += '</tr>';
      html += tr;
    }
    html += '</table>';
    this._ele.html(html);
  }
}