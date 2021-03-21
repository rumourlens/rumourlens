
const RumourGraph = new function () {
  const limitDateInterval = 6;
  const staticFolder = './static';//'./static';
  let currentSlider = 5;
  let dateSlider;
  let mainGraph;
  let interval;
  let isReloadSetup = true;
  let minScore = 1;
  let selectedNode = '';
  const normalUser = new THREE.TextureLoader().load(`${staticFolder}/img/normal_user.png`);
  const normalUserMaterial = new THREE.SpriteMaterial({ map: normalUser });
  const fakeUser = new THREE.TextureLoader().load(`${staticFolder}/img/fake_user.png`);
  const fakeUserMaterial = new THREE.SpriteMaterial({ map: fakeUser });
  const normalMessage = new THREE.TextureLoader().load(`${staticFolder}/img/normal_message.png`);
  const normalMessageMaterial = new THREE.SpriteMaterial({ map: normalMessage });
  const fakeMessage = new THREE.TextureLoader().load(`${staticFolder}/img/fake_message.png`);
  const fakeMessageMaterial = new THREE.SpriteMaterial({ map: fakeMessage });
  const normalLink = new THREE.TextureLoader().load(`${staticFolder}/img/normal_link.png`);
  const normalLinkMaterial = new THREE.SpriteMaterial({ map: normalLink });
  const fakeLink = new THREE.TextureLoader().load(`${staticFolder}/img/fake_link.png`);
  const fakeLinkMaterial = new THREE.SpriteMaterial({ map: fakeLink });
  const normalHashtag = new THREE.TextureLoader().load(`${staticFolder}/img/normal_hashtag.png`);
  const normalHashtagMaterial = new THREE.SpriteMaterial({ map: normalHashtag });
  const fakeHashtag = new THREE.TextureLoader().load(`${staticFolder}/img/fake_hashtag.png`);
  const fakeHashtagMaterial = new THREE.SpriteMaterial({ map: fakeHashtag });


  const _getNodeMaterial = function (node) {
    const nodeType = node["type"];
    const isAnomaly = node["score"] <= ALPHA_MAX;
    switch (nodeType) {
      case 1:
        if (isAnomaly) {
          return fakeUserMaterial;
        }
        return normalUserMaterial;
      case 2:

        if (isAnomaly) {
          return fakeMessageMaterial;
        }
        return normalMessageMaterial;
      case 3:
        if (isAnomaly) {
          return fakeLinkMaterial;
        }
        return normalLinkMaterial;
      case 4:
        if (isAnomaly) {
          return fakeHashtagMaterial;
        }
        return normalHashtagMaterial;
      default:
        return '';
    }
  }

  const _getNodeImage = function (node) {
    const nodeType = node["type"];
    const isAnomaly = node["score"] <= ALPHA_MAX;
    switch (nodeType) {
      case 1:
        if (isAnomaly) {
          return "fake_user.png";
        }
        return 'normal_user.png';
      case 2:
        if (isAnomaly) {
          return "fake_message.png";
        }
        return 'normal_message.png';
      case 3:
        if (isAnomaly) {
          return "fake_link.png";
        }
        return 'normal_link.png';
      case 4:
        if (isAnomaly) {
          return "fake_hashtag.png";
        }
        return 'normal_hashtag.png';
      default:
        return '';
    }
  }


  const _refreshByInterval = function () {
    interval = setInterval(function () {
      currentSlider = currentSlider + 1;
      if (currentSlider >= limitDateInterval) return;
      dateSlider.noUiSlider.set(currentSlider);
      mainGraph.refresh();
    }, 2000);
  };

  const _loadSlider = function () {
    try {
      if (dateSlider && dateSlider.noUiSlider) dateSlider.noUiSlider.detroy();
    }
    catch {
    }
    //
    dateSlider = document.getElementById('slider-date');
    noUiSlider.create(dateSlider, {
      connect: [true, true],
      range: {
        min: 1,
        max: limitDateInterval - 1
      },
      step: 1,
      start: currentSlider,
      pips: { mode: 'values', values: [1, 3, 5], density: 40 }
    });
    dateSlider.noUiSlider.on('change', function () {
      currentSlider = Math.round(dateSlider.noUiSlider.get());
      mainGraph.refresh();
      clearInterval(interval);
    });
  }
  const _loadMainGraph = function () {
    const elem = document.getElementById('3d-graph');
    elem.innerHTML = "";
    mainGraph = ForceGraph3D()(elem)
      .width(elem.clientWidth + 10)
      .height(elem.clientHeight - 140)
      .nodeRelSize(6)
      .jsonUrl(`${staticFolder}/js/wholegraph.json`) //quick build from DB
      .nodeAutoColorBy('text')
      .showNavInfo(false)
      .nodeVisibility((node) => {
        if(node["score"] < minScore){
          minScore = node["score"];
          selectedNode = node["id"];
        }
        if ((node['interval'] + 1) > currentSlider) {
          return false;
        }
        return true;
      })
      .nodeThreeObject((node) => {
        if ((node['interval'] + 1) > currentSlider) {
          return;
        }
        let imgMaterial = _getNodeMaterial(node);
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(7),
          new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
        );

        // add img sprite as child

        const sprite = new THREE.Sprite(imgMaterial);
        sprite.scale.set(12, 12);
        if (node["id"] == selectedNode) {
          sprite.scale.set(64, 64);
          const glowSize = 40;
          const color = '#a5ff14';
          const geometry = new THREE.SphereGeometry(glowSize);
          const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5
          });
          const glowEffect = new THREE.Mesh(geometry, material);
          glowEffect.name = "glow";
          obj.add(glowEffect);
        }
        obj.add(sprite);
        return obj;
      })
      .linkColor((link) => {
        if (link["score"] <= ALPHA_MAX) {
          return "#FB6464";
        }
        return "#00afee";
      })
      .linkVisibility((link) => {
        if ((link['interval'] + 1) > currentSlider) {
          return false;
        }
        return true;
      })
      .nodeLabel(node => `${node.text}`)
      .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
      .onNodeClick(node => {
        RumourGraph.changeSelectedItem(node["id"]);
      })
      .onEngineStop(() => {
        if (isReloadSetup) return;
        isReloadSetup = true;
        setTimeout(function () {
          _refreshByInterval();
        }, 500);
      });
    x = mainGraph.cameraPosition();
    x.z = 4500;
    mainGraph.cameraPosition(x);
  }
  const _loadNodeDetail = function (node) {
    d3.json("./entity/getEntity?id=" + node["id"], function (error, data) {
      let html = "";
      if (node["id"].indexOf('t') >= 0) {
        html = "<table class='entity-info'>";
        html += "<tr class='row'><td class='label'>Text</td><td class='value'>{text}</td></tr>".replace('{text}', data["comment"])
        html += "<tr class='row'><td class='label'>Date</td><td class='value pointer' onClick=\"Tweets.showHistory('" + node["id"] + "','" + data["date"] + "','created')\">{text}</td></tr>".replace('{text}', `${data["date"]} - Age: ${Utils.datediff(data["date"], new Date())} days`)
        html += "<tr class='row'><td class='label'>Retweets</td><td class='value'>{text}</td></tr>".replace('{text}', data["retweet_count"])
        // html += "<tr class='row'><td class='label'>Favourite</td><td class='value'>{text}</td></tr>".replace('{text}', data["favourite_count"])
        // html += "<tr class='row'><td class='label'>User</td><td class='value'>{text}</td></tr>".replace('{text}', data["user_id"])
        html += "</table>";
      }
      if (node["id"].indexOf('u') >= 0) {
        html = "<table class='entity-info'>";
        html += "<tr class='row'><td class='label'>Name</td><td class='value'>{text}</td></tr>".replace('{text}', data["full_name"])
        html += "<tr class='row'><td class='label'>Created date</td><td class='value pointer' onClick=\"Users.showHistory('" + node["id"] + "','" + data["date"] + "','created')\">{text}</td></tr>".replace('{text}', `${data["date"]} - Age: ${Utils.datediff(data["date"], new Date())} days`)
        html += "<tr class='row'><td class='label'>Followers</td><td class='value pointer' onClick=\"Users.showHistory('" + node["id"] + "','" + data["followers_count"] + "','follower')\">{text}</td></tr>".replace('{text}', data["followers_count"])
        html += "<tr class='row'><td class='label'>Favourites</td><td class='value pointer' onClick=\"Users.showHistory('" + node["id"] + "','" + data["date"] + "','favourite')\">{text}</td></tr>".replace('{text}', data["favourites_count"])
        html += "<tr class='row'><td class='label'>Friends</td><td class='value pointer' onClick=\"Users.showHistory('" + node["id"] + "','" + data["friends_count"] + "','friend')\">{text}</td></tr>".replace('{text}', data["friends_count"])
        html += "</table>";
      }
      if (node["id"].indexOf('h') >= 0) {
        html = "<table class='entity-info'>";
        html += "<tr class='row'><td class='label'>Hashtag</td><td class='value'>{text}</td></tr>".replace('{text}', data["text"])
        html += "<tr class='row'><td class='label'>Usages</td><td class='value pointer'  onClick=\"Hashtag.showHistory('" + node["id"] + "')\">{text}</td></tr>".replace('{text}', data["usages"])
        html += "</table>";
      }
      if (node["id"].indexOf('l') >= 0) {
        html = "<table class='entity-info'>";
        html += "<tr class='row'><td class='label'>Link</td><td class='value'>{text}</td></tr>".replace('{text}', data["text"])
        html += "<tr class='row'><td class='label'>Mentions</td><td class='value pointer'  onClick=\"Link.showHistory('" + node["id"] + "')\">{text}</td></tr>".replace('{text}', data["mentions"])
        html += "</table>";
      }
      $("#node-info").html(html);

      let confirmInfo = '<h5 style="margin-bottom: 2px;">Do you think this entity is rumour-related? </h5>';
      const score = data["score"];
      if (score == 0) {
        confirmInfo += '<button onclick="RumourGraph.updateRumourScore(0);" type="button" class="btn btn-sm btn-primary"  style="line-height: 30px;"> Yes </button>';
      }
      else {
        confirmInfo += '<button onclick="RumourGraph.updateRumourScore(0);" type="button" class="btn btn-sm btn-primary"  style="line-height: 30px;  background-color: grey;"> Yes </button>';
      }
      confirmInfo += " ";
      if (score == 1) {
        confirmInfo += '<button onclick="RumourGraph.updateRumourScore(1);" type="button" class="btn btn-sm btn-primary" style="line-height: 30px;">No</button>';
      }
      else {
        confirmInfo += '<button onclick="RumourGraph.updateRumourScore(1);" type="button" class="btn btn-sm btn-primary" style="line-height: 30px; background-color: grey;">No</button>';
      }
      $("#confirm-info").html(confirmInfo);
    });
  }

  const _loadSubgraph = function (node) {
    const elem1 = document.getElementById('subgraph');
    elem1.innerHTML = "";
    const divDetail = document.getElementById('divSubGraph');
    fetch(`./entity/getClosestAnomalies?id=${node["id"]}&alpha=${ALPHA_MAX}`).then(res => res.json()).then(data => {
      $("#subGraphScore").text(`SCORE: ${data.score.toFixed(3)}`);
      const graphDetail = ForceGraph()(elem1).width(divDetail.clientWidth - 5)
        .height(divDetail.clientHeight - 30)
        //.jsonUrl('./entity/getClosestAnomalies?id=' + node["id"])
        .graphData(data)
        .nodeAutoColorBy('text')
        .backgroundColor('white')
        .nodeCanvasObject((node, ctx, globalScale) => {
          let imgSrc = _getNodeImage(node);
          const label = `(${(node["score"] || 1).toFixed(3)})`;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x, node.y + 10);
          var img = new Image();
          img.src = `${staticFolder}/img/${imgSrc}`;
          ctx.drawImage(img, node.x - 5, node.y - 5, 10, 10);
          // node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        })
        .linkColor((link) => {
          if (link["score"] <= ALPHA_MAX) {
            return "#FB6464";
          }
          return "#00afee";
        })
        .nodeLabel(node => `${node.text}`)
        .onNodeClick(node => _loadNodeDetail(node))
        .onNodeHover(node => elem1.style.cursor = node ? 'pointer' : null);

      graphDetail.zoom(2.5);
    });

  }

  this.changeSelectedItem = (id) => {
    selectedNode = id;
    if (mainGraph)
      mainGraph.refresh();
    const node = { 'id': id };
    _loadSubgraph(node);
    _loadNodeDetail(node);
  }

  this.init = (reload = false) => {
    const node = { 'id': selectedNode };
    currentSlider = limitDateInterval - 1;
    _loadMainGraph();
    if (!reload) {
      _loadSlider();
    }
    else {
      currentSlider = 1;
      dateSlider.noUiSlider.set(1);
      clearInterval(interval);
      isReloadSetup = false;
      _loadSubgraph(node);
      _loadNodeDetail(node);
    }
  }

  this.updateRumourScore = (score) => {
    $.ajax({
      url: "/entity/adjustRumourScore",
      type: "POST",
      data: JSON.stringify({ "id": selectedNode, "score": score }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function () {
        const node = { 'id': selectedNode };
        _loadNodeDetail(node);
        if (selectedNode.indexOf('u') >= 0) {
          Users.reInit();
        } else if (selectedNode.indexOf('t') >= 0) {
          Tweets.reInit();
        }else if (selectedNode.indexOf('h') >= 0) {
          Hashtag.reInit();
        }else if (selectedNode.indexOf('l') >= 0) {
          Link.reInit();
        }
      }
    })
  }
}


$(document).ready(function () {
  RumourGraph.init();
});
