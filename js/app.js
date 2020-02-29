var mapsize = [1, 1];
var selectedblocks = [];
var selectedcolors = [];
var filename = "mapart";
var img = new Image();
var currentSplit = [-1,-1]
var benchmark;
var renderCallback = function(){};
var firefox = false;
var splits = [];
var gotMap = false;
var mapstatus = 0;
//0 - idle

var mapmode = 0;

var versionindex = {
  "1.12": [1139,0],
  "1.12.1": [1241,0],
  "1.12.2": [1343,0],
  "1.13.0": [1519,1],
  "1.13.1": [1628,1],
  "1.13.2": [1631,1],
  "1.14.0": [1952,1],
  "1.14.1": [1957,1],
  "1.14.2": [1963,1],
  "1.14.3": [1968,1],
  "1.14.4": [1976,1],
  "1.15.0": [2225,1],
  "1.15.1": [2227,1],
};

var mcversion = "1.12.2";
var dataversion = 1343;
var blockversion = 0;

var offscreen;
const worker = new Worker("js/worker.js");

var sheet;

function initialize() {
	//show warning when using Edge
  if (!(/*@cc_on!@*/false || !!document["documentMode"]) && !!window["StyleMedia"]) {
    alert('Note: using Microsoft Edge is unsupported.\nPlease use Chrome (preferred) or Firefox for MapartCraft');
  }
  let colorid = 0;
  //load 1.12 blocklist by default
  window.blocklist = window.colorlist_base;
  window.blocklist.forEach(function(i) {
    blockid = 0;
    document.getElementById('blockselection').innerHTML += '<br><div class="colorbox" colors="' + i[0].map(c => cssrgb(c)).join(";") + '"></div><label><input type="radio" name="color' + colorid + '" value="-1" onclick="updateMap()" checked><img src="img/barrier.png" alt="None" data-tooltip title="None"></label>';
    i[1].forEach(function(j) {
      let imgfile = j[4]
      if (j[4] == "")
        imgfile = j[0]
      document.getElementById('blockselection').innerHTML += '<label><input type="radio" name="color' + colorid + '" value="' + blockid + '" onclick="updateMap()"><img src="img/null.png" class="block block-' + imgfile + '" alt="' + j[2] + '" data-tooltip title="' + j[2] + '"></label>';
      blockid++;
    });
    colorid++;
  });
  try{
    offscreenscale = document.getElementById('displaycanvas').transferControlToOffscreen();
    offscreen = new OffscreenCanvas(128, 128);
    worker.postMessage([offscreenscale,"offscreeninit"],[offscreenscale]);
    sheet = new CSSStyleSheet();
    sheet.replaceSync('* {cursor: progress !important}');
    document.adoptedStyleSheets = [sheet];
  }catch (err){
    //means the user is probably using Firefox, so we're gonna use fixes
    console.log("Falling back to Firefox mode (slower, no loading cursor)");
    firefox = true;
    offscreen = document.createElement('canvas');
    offscreen.width = 128;
    offscreen.height = 128;
  }
  updateStyle();
  //tooltip.refresh();
  document.getElementById('imgupload').addEventListener('change', loadImg);
  checkCookie();
  let urlParams = new URL(window.location).searchParams;
  if (urlParams.has('preset'))
    importPreset(urlParams.get('preset'));
  img.src = "img/upload.png";
  img.onload = function() {
    updateMap();
  }
}

function updateStyle() {
  if(document.getElementById('staircasing').checked) {
    for(let cb of document.getElementsByClassName("colorbox")) {
      let colors = cb.getAttribute("colors").split(";");
      cb.style = `background: linear-gradient(${colors[0]} 33%, ${colors[1]} 33%, ${colors[1]} 66%, ${colors[2]} 66%);`
    }
  } else {
    for(let cb of document.getElementsByClassName("colorbox")) {
      let colors = cb.getAttribute("colors").split(";");
      cb.style = `background: ${colors[1]};`
    }
  }
}

function updateMode() {
  mapmode = document.getElementById("mapmode").selectedIndex;
  if (mapmode == 1){
    document.getElementById("downloadbtnsection").style.display = "none";
  } else {
    document.getElementById("downloadbtnsection").style.display = "inline";
  }
  if (mapmode < 2){
    document.getElementById("underblockssection").style.display = "inline";
    document.getElementById("materialsbtnsection").style.display = "inline";
  } else {
    document.getElementById("underblockssection").style.display = "none";
    document.getElementById("materialsbtnsection").style.display = "none";
  }
}

function updateMap() {
  if (mapstatus == 0 || mapstatus == 4){
    if (mapstatus == 0)
      mapstatus++;
    if (!firefox)
      sheet.replaceSync('* {cursor: progress !important}');
    benchmark = performance.now(); //benchmark updateMap() speed
    selectedblocks = []; //touching this might break presets, so be careful
    selectedcolors = [];
    for (let i = 0; i < window.blocklist.length; i++) {
      blockid = document.querySelector('input[name="color' + i + '"]:checked').value;
      if (blockid == -1) {
        continue
      }
      selectedblocks.push([i, parseInt(blockid)]);
      // gotta add 2D/3D support here
      if (document.getElementById('staircasing').checked) {
        selectedcolors.push(window.blocklist[i][0][0]);
        selectedcolors.push(window.blocklist[i][0][2]);
      }
      selectedcolors.push(window.blocklist[i][0][1]);
    }
    updateStyle(); // Updating colorbox colors
    mapsize = [document.getElementById('mapsizex').value, document.getElementById('mapsizey').value];
    var ctx = offscreen.getContext('2d');
    var dspcvs = document.getElementById('displaycanvas');
    //this part is so that weird displays scale pixels 1 to int(x)
    var dpr = window.devicePixelRatio || 1;
    var sdpr = dpr/Math.floor(dpr);
    ctx.canvas.width = mapsize[0] * 128;
    ctx.canvas.height = mapsize[1] * 128;
    document.getElementById('mapres').innerHTML = ctx.canvas.width + "x" + ctx.canvas.height;
    document.getElementById('mapreswarning').innerHTML = img.width + "x" + img.height;
    if (img.width / img.height == ctx.canvas.width / ctx.canvas.height) {
      document.getElementById('mapreswarning').style = "color:red; display: none";
    } else {
      document.getElementById('mapreswarning').style = "color:red; display: inline";
      if (document.getElementById('cropimg').checked)
          document.getElementById('mapreswarning').style = "color:orange; display: inline";
    }
    if (mapsize[0] < 4 && mapsize[1] < 8) {
      dspcvs.style.width = (ctx.canvas.width * 2 / dpr) + "px";
      dspcvs.style.height = (ctx.canvas.height * 2 / dpr) + "px";
    } else {
      dspcvs.style.width = (ctx.canvas.width / dpr) + "px";
      dspcvs.style.height = (ctx.canvas.height / dpr) + "px";
    }
    //if (document.getElementById('renderpreview').checked) {
    if (true) {
      document.getElementById('mapres').innerHTML = "Rendering...";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
      //crop or scale image
      if (document.getElementById('cropimg').checked) {
        let cropdim = cropImg(img.width,img.height);
        ctx.drawImage(img, cropdim[0], cropdim[1], cropdim[2], cropdim[3], 0, 0, ctx.canvas.width, ctx.canvas.height);
      }else{
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      if (currentSplit[0] != -1){
        mapsize = [1,1];
      }
      if (currentSplit[0] == -1){
        var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      }else{
        var imgData = ctx.getImageData(currentSplit[0]*128, currentSplit[1]*128, (currentSplit[1]+1)*128, (currentSplit[1]+1)*128);
      }
      if (currentSplit[0] != -1){
        ctx.canvas.width = 128;
        ctx.canvas.height = 128;
      }
      //worker code here
      worker.postMessage([
        imgData,
        [ctx.canvas.width,ctx.canvas.height],
        document.getElementById("dither").selectedIndex,
        (selectedblocks.length != 0),
        selectedcolors,
        document.getElementById('bettercolor').checked,
        mapsize,
        ]);
    }
  }else if(mapstatus == 1){
    mapstatus++;
  }
}

worker.onmessage = function(e) { 
  imgData = e.data;
  var ctx = offscreen.getContext('2d');
  ctx.putImageData(imgData, 0, 0);
  if (firefox){
    console.log("starting Firefox drawing at " + (performance.now() - benchmark) + "ms");
    upsctx = document.getElementById('displaycanvas').getContext('2d');
    if (mapsize[0] < 4 && mapsize[1] < 8) {
      upsctx.canvas.width = ctx.canvas.width * 2;
      upsctx.canvas.height = ctx.canvas.height * 2;
    } else {
      upsctx.canvas.width = ctx.canvas.width;
      upsctx.canvas.height = ctx.canvas.height;
    }
    for (var i = 0; i < imgData.data.length; i += 4) {
      let x = (i / 4) % ctx.canvas.width;
      let y = ((i / 4) - x) / ctx.canvas.width;
      upsctx.fillStyle = "rgba(" + imgData.data[i + 0] + "," + imgData.data[i + 1] + "," + imgData.data[i + 2] + "," + 255 + ")";
      if (mapsize[0] < 4 && mapsize[1] < 8) {
        upsctx.fillRect(x * 2, y * 2, 2, 2);
      } else {
        upsctx.fillRect(x, y, 1, 1);
      }
    }
  }
  document.getElementById('mapres').innerHTML = ctx.canvas.width + "x" + ctx.canvas.height;
  console.log("updateMap completed in " + (performance.now() - benchmark) + "ms");
  if (!firefox)
    sheet.replaceSync('* {}');
  mapstatus--;
  if (mapstatus == 1){
    mapstatus = 0;
    updateMap();
  }else if(mapstatus == 3){
    renderCallback();
  }
}

function resetCallback(){
  renderCallback = function(){};
}

//calculates correct sizes for cropping an image
function cropImg(imgWidth,imgHeight){
  //get size of map
  mapsize = [document.getElementById('mapsizex').value, document.getElementById('mapsizey').value];

  //calculate correct crop for current mapsize
  let newWidth = imgWidth;
  let newHeight = Math.round((imgWidth/mapsize[0])*mapsize[1]);

  //if goes out of bounds, calculate the other way
  if(newHeight>imgHeight){
    newWidth = Math.round((imgHeight/mapsize[1])*mapsize[0]);
    if(newWidth>imgWidth)
      newWidth-=2;
    newHeight = imgHeight;
  }

  //return crop values
  return [Math.floor((imgWidth-newWidth)/2),Math.floor((imgHeight-newHeight)/2),newWidth,newHeight];
}

function getNbtSplit(){
  //if no blocks selected, don't download
  if (selectedblocks.length == 0){
    alert("Select blocks before downloading!");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 3;

  splits = [];
  console.log("Downloading as 1x1 split");
  for (let x = 0; x < document.getElementById('mapsizex').value; x++){
    for (let y = 0; y < document.getElementById('mapsizey').value; y++){
      console.log("Preparing: " + x + " " + y);
      splits.push([x,y]);
    }
  }
  dlNbtSplit()
}

function dlNbtSplit(){ //call getNbtSplit() first!
  renderCallback = function(){dlNbtSplit()};
  if (!gotMap){
    if (splits.length > 0){
      currentSplit = splits.shift();
      console.log("Currently downloading: " + currentSplit[0] + " " + currentSplit[1]);
      getMap();
    }else{
      resetCallback();
      console.log("Done, rerendering map");
      mapstatus = 0;
      currentSplit = [-1,-1];
      updateMap();
    }
  }else{
    getNbt();
    dlNbtSplit();
  }
}

function getMap() {
  //force render preview
  //document.getElementById('renderpreview').checked = true;
  if (!gotMap){
    gotMap = true;
    mapstatus = 4;
    updateMap();
    return;
  }
  gotMap = false;

  let ctx = offscreen.getContext('2d');
  let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  let blocks = []
  let nbtblocklist = []
  let underblocks = document.getElementById("underblocks").selectedIndex;
  if (underblocks > 0) {
    let underblock = document.getElementById("underblock").value;
    nbtblocklist.push({
      "Colors": [-255, -255, -255],
      "Name": underblock,
      "SelectedBlock": [-1, -1]
    });
  }
  for (let x = 0; x < ctx.canvas.width; x++) {
    for (let y = 0; y < ctx.canvas.height; y++) {
      color = [imgData.data[x * 4 + y * 4 * ctx.canvas.width], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 1], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 2]];
      selectedblocks.forEach(function(i) {
        if (arraysEqual(blocklist[i[0]][0][0], color) || arraysEqual(blocklist[i[0]][0][1], color) || arraysEqual(blocklist[i[0]][0][2], color)) {
          toPush = {
            "Colors": blocklist[i[0]][0],
            "Name": "minecraft:" + blocklist[i[0]][1][i[1]][0],
            "SelectedBlock": i
          };

          if (blocklist[i[0]][1][i[1]][1] != "")
            toPush["Properties"] = JSON.parse("{ " + blocklist[i[0]][1][i[1]][1].replace(/'/g, "\"") + " }")

          try {
            nbtblocklist.forEach(function(j) { //what the fuck even
              if (arraysEqual(j["Colors"], toPush["Colors"])) {
                toPush = null;
                throw 69;
              }
            });
          } catch (err) {}
          if (toPush != null)
            nbtblocklist.push(toPush);
        }
      });
    }
  }
  if (document.getElementById('staircasing').checked) { // 3D CODE
    for (let x = 0; x < ctx.canvas.width; x++) {

      let hhhh = 1000;
      let minh = 1000;
      let maxh = 1000;
      for (let y = 0; y < ctx.canvas.height; y++) {
        let color = [imgData.data[x * 4 + y * 4 * ctx.canvas.width], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 1], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 2]];
        let toneid = 0;
        for (let i = 0; i < nbtblocklist.length; i++) {
          if (arraysEqual(nbtblocklist[i]["Colors"][0], color)) {
            toneid = -1;
            break;
          }
          if (arraysEqual(nbtblocklist[i]["Colors"][1], color)) {
            toneid = 0;
            break;
          }
          if (arraysEqual(nbtblocklist[i]["Colors"][2], color)) {
            toneid = 1;
            break;
          }

        }
        hhhh += toneid;
        minh = Math.min(minh, hhhh);
        maxh = Math.max(maxh, hhhh);
      }
      hhhh = 1000 - minh;
      hhhh++;
      if (underblocks > 0)
        hhhh++;
      if (underblocks > 2)
        hhhh++;
      for (let y = 0; y < ctx.canvas.height; y++) {
        let color = [imgData.data[x * 4 + y * 4 * ctx.canvas.width], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 1], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 2]];
        let toneid = 0;
        let blockid = 0;
        for (let i = 0; i < nbtblocklist.length; i++) {
          if (arraysEqual(nbtblocklist[i]["Colors"][0], color)) {
            toneid = -1;
            blockid = i;
            break;
          }
          if (arraysEqual(nbtblocklist[i]["Colors"][1], color)) {
            toneid = 0;
            blockid = i;
            break;
          }
          if (arraysEqual(nbtblocklist[i]["Colors"][2], color)) {
            toneid = 1;
            blockid = i;
            break;
          }
        }
        //NOOBLINE
        if (y == 0) {
          blocks.push({
            "pos": [x, hhhh, y],
            "state": 0
          });
        }
        hhhh += toneid;
        blocks.push({
          "pos": [x, hhhh, y + 1],
          "state": blockid
        });
        //UNDERBLOCKS
        if (underblocks == 2) {
          blocks.push({
            "pos": [x, hhhh - 1, y + 1],
            "state": 0
          });
        } else if (underblocks == 3) {
          blocks.push({
            "pos": [x, hhhh - 1, y + 1],
            "state": 0
          });
          blocks.push({
            "pos": [x, hhhh - 2, y + 1],
            "state": 0
          });
          if( // spaghetti, I need to break up this entire function into proper smaller functions
            indexOfObjOptim({
              "pos": [x, hhhh - 1, y + 0],
              "state": 0
            }, blocks) > -1 &&
            indexOfObjOptim({
              "pos": [x, hhhh - 1, y - 1],
              "state": 0
            }, blocks) > -1
          ){
            let toRemove = indexOfObjOptim({
              "pos": [x, hhhh - 2, y + 0],
              "state": 0
            }, blocks);
            if (toRemove > -1)
              blocks.splice(toRemove,1)
          }
        } else if (underblocks == 4) { //very ugly code, should be made into functions instead
          blocks.push({
            "pos": [x, hhhh - 1, y + 1],
            "state": 0
          });
          blocks.push({
            "pos": [x, hhhh - 2, y + 1],
            "state": 0
          });
        } else if (underblocks == 1) {
          selectedblocks.forEach(function(b) {
            if (arraysEqual(blocklist[b[0]][0][0], nbtblocklist[blockid]["Colors"][0])) {
              if (blocklist[b[0]][1][b[1]][3])
                blocks.push({
                  "pos": [x, hhhh - 1, y + 1],
                  "state": 0
                });
            }
          });
        }

      }
    }
  } else { // 2D CODE
    let hhhh = 0;
    if (underblocks > 0)
      hhhh++;
    if (underblocks > 2)
      hhhh++;
    for (let x = 0; x < ctx.canvas.width; x++) {
      for (let y = 0; y < ctx.canvas.height; y++) {
        let color = [imgData.data[x * 4 + y * 4 * ctx.canvas.width], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 1], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 2]];
        let blockid = 0;
        for (let i = 0; i < nbtblocklist.length; i++) {
          if (arraysEqual(nbtblocklist[i]["Colors"][1], color)) {
            blockid = i;
            break;
          }
        }
        //NOOBLINE
        if (y == 0) {
          blocks.push({
            "pos": [x, hhhh, y],
            "state": 0
          });
        }
        blocks.push({
          "pos": [x, hhhh, y + 1],
          "state": blockid
        });
        // UNDERBLOCKS
        if (underblocks == 2) {
          blocks.push({
            "pos": [x, 0, y + 1],
            "state": 0
          });
        } else if (underblocks >= 3) {
          blocks.push({
            "pos": [x, 0, y + 1],
            "state": 0
          });
          blocks.push({
            "pos": [x, 1, y + 1],
            "state": 0
          });
        } else if (underblocks == 1) {
          selectedblocks.forEach(function(b) {
            if (arraysEqual(blocklist[b[0]][0][0], nbtblocklist[blockid]["Colors"][0])) {
              if (blocklist[b[0]][1][b[1]][3])
                blocks.push({
                  "pos": [x, 0, y + 1],
                  "state": 0
                });
            }
          });
        }
      }
    }
  }

  return {
      blocks, 
      nbtblocklist, 
      width: ctx.canvas.width, 
      height: ctx.canvas.height
    };
}

function getMaterials() {
  if (selectedblocks.length == 0){
    alert("Select blocks before asking material list!");
    return;
  }

  document.getElementById("materials").style = "float: left";

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 3;

  if (!gotMap){
    renderCallback = function(){resetCallback();getMaterials();};
    getMap();
    return;
  }
  let {blocks, nbtblocklist} = getMap();
  nbtblocklist.forEach(b => b.count = 0);
  blocks.forEach(b => nbtblocklist[b.state].count++);
  
  let htmlString = '<tbody><tr style="display: table-row;"><th>Block</th><th>Amount</th></tr>';
  nbtblocklist.sort((a, b) => b.count - a.count).forEach(block => {
    let amount = block.count;
    if(amount > 64) {
      let stacks = Math.floor(amount / 64);

      let leftover = amount - 64*stacks;
      if (leftover == 0)
        leftover = "";
      else
        leftover = " + " + leftover;

      if (stacks > 27)
        amount = `${amount.toLocaleString()} (${stacks}x64${leftover}, ${(amount / 64 / 27).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} SB)`
      else
        amount = `${amount.toLocaleString()} (${stacks}x64${leftover})`
    }

    let j = [block.Name, "", "Placeholder Block", false, "placeholder"]
    if(block.SelectedBlock[0] != -1)
      j = blocklist[block.SelectedBlock[0]][1][block.SelectedBlock[1]]
    
    let imgfile = j[4]
    if (j[4] == "")
      imgfile = j[0]

    htmlString += '<tr><th><img src="img/' + ((imgfile == "placeholder") ? "placeholder.png" : ('null.png" class="block block-' + imgfile)) + '" alt="' + j[2] + '" data-tooltip title="' + j[2] + '"></th>';
    htmlString += '<th>' + amount + '</th></tr>'
  });

  htmlString += "</tbody>"
  document.getElementById("materialtable").innerHTML = htmlString;
  tooltip.refresh();
  mapstatus = 0;
}

function getMapDatSplit(){
  //if no blocks selected, don't download
  if (selectedblocks.length == 0){
    alert("Select blocks before downloading!");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 3;

  splits = [];
  console.log("Downloading as 1x1 split");
  for (let x = 0; x < document.getElementById('mapsizex').value; x++){
    for (let y = 0; y < document.getElementById('mapsizey').value; y++){
      console.log("Preparing: " + x + " " + y);
      splits.push([x,y]);
    }
  }
  dlMapDatSplit()
}

function dlMapDatSplit(){ //call getMapDatSplit() first!
  renderCallback = function(){dlMapDatSplit()};
  if (!gotMap){
    if (splits.length > 0){
      currentSplit = splits.shift();
      console.log("Currently downloading: " + currentSplit[0] + " " + currentSplit[1]);
      mapstatus = 4;
      updateMap();
      gotMap = true;
    }else{
      resetCallback();
      console.log("Done, rerendering map");
      mapstatus = 0;
      currentSplit = [-1,-1];
      updateMap();
    }
  }else{
    gotMap = false;

    let ctx = offscreen.getContext('2d');
    let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    let colorData = [];
  
    for (let y = 0; y < ctx.canvas.height; y++) {
      for (let x = 0; x < ctx.canvas.width; x++) {
        color = [imgData.data[x * 4 + y * 4 * ctx.canvas.width], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 1], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 2]];
        selectedblocks.forEach((i) => {
          for (let j of [0,1,2,3]) {
            if (arraysEqual(blocklist[i[0]][0][j], color)) {
              let baseColor = window.mapdatmappings[blocklist[i[0]][2]];
              colorData.push(baseColor*4+j);
            }
          }
        });
      }
    }
  
    nbtData = nbt.writeUncompressed(
      {"name":"","value":{"data":{"type":"compound","value":{"scale":{"type":"byte","value":0},"dimension":{"type":"byte","value":0},"trackingPosition":{"type":"byte","value":0},"locked":{"type":"byte","value":1},"height":{"type":"short","value":128},"width":{"type":"short","value":128},"xCenter":{"type":"int","value":0},"zCenter":{"type":"int","value":0},"colors":{"type":"byteArray","value":colorData}}}}}
    );
    console.log("Gzipping");
    let gzipped = pako.gzip(nbtData);
    console.log("Blobbing");
    let blob = new Blob([gzipped], {
      type: 'application/x-gzip'
    });
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename + "_s_" + currentSplit[0] + "_" + currentSplit[1] + ".dat";
    a.click();
    window.URL.revokeObjectURL(url);

    dlMapDatSplit();
  }
}

// Only works with 1x1 maps, use getMapDatSplit
function getMapDat() {
  //TODO: Change this to the 4-color version instead of selectedblocks?

  mapstatus = 0;
}

function getNbt() {
  //if no blocks selected, don't download
  if (selectedblocks.length == 0){
    alert("Select blocks before downloading!");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 3;
    
  if (!gotMap){
    if (currentSplit[0] == -1){
      renderCallback = function(){resetCallback();getNbt();};
    }
    getMap();
    return;
  }
  let {blocks, nbtblocklist, width, height} = getMap();
  let jsonstring = "{\"name\":\"\",\"value\":{\"blocks\":{\"type\":\"list\",\"value\":{\"type\":\"compound\",\"value\":[";
  blocks.forEach(function(r) {
    jsonstring += "{\"pos\":{\"type\":\"list\",\"value\":{\"type\":\"int\",\"value\":[" + r["pos"][0] + "," + r["pos"][1] + "," + r["pos"][2] + "]}},\"state\":{\"type\":\"int\",\"value\":" + r["state"] + "}},";
  });
  jsonstring = jsonstring.slice(0, -1);
  jsonstring += "]}},\"entities\":{\"type\":\"list\",\"value\":{\"type\":\"compound\",\"value\":[]}},\"palette\":{\"type\":\"list\",\"value\":{\"type\":\"compound\",\"value\":[";
  nbtblocklist.forEach(function(r) {
    if ("Properties" in r) {
      jsonstring += "{\"Properties\":{\"type\":\"compound\",\"value\":{";
      Object.keys(r["Properties"]).forEach(function(t) {
        jsonstring += "\"" + t + "\":{\"type\":\"string\",\"value\":\"" + r["Properties"][t] + "\"},";
      });
      jsonstring = jsonstring.slice(0, -1);
      jsonstring += "}}, \"Name\":{\"type\":\"string\",\"value\":\"" + r["Name"] + "\"}},";
    } else {
      jsonstring += "{\"Name\":{\"type\":\"string\",\"value\":\"" + r["Name"] + "\"}},";
    }
  });
  //Quick bodge, but it works
  let maxheight = 0;
  blocks.forEach(function(r) {
    maxheight = Math.max(r["pos"][1],maxheight);
  });
  maxheight++;
  jsonstring = jsonstring.slice(0, -1) + "]}},\"size\":{\"type\":\"list\",\"value\":{\"type\":\"int\",\"value\":[" + width + "," + maxheight + "," + (height + 1) + "]}},\"author\":{\"type\":\"string\",\"value\":\"rebane2001.com/mapartcraft\"},\"DataVersion\":{\"type\":\"int\",\"value\":" + dataversion + "}}}";
  //download
  console.log("Parsing JSON and converting to NBT");
  let nbtdata = nbt.writeUncompressed(JSON.parse(jsonstring));
  console.log("Gzipping");
  let gzipped = pako.gzip(nbtdata);
  console.log("Blobbing");
  let blob = new Blob([gzipped], {
    type: 'application/x-minecraft-level'
  });
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  url = window.URL.createObjectURL(blob);
  a.href = url;
  if (currentSplit[0] == -1){
    a.download = filename + ".nbt";
  }else{
    a.download = filename + "_s_" + currentSplit[0] + "_" + currentSplit[1] + ".nbt";
  }
  a.click();
  window.URL.revokeObjectURL(url);
  if (currentSplit[0] == -1){
    mapstatus = 0;
  }
}

function loadPreset(){
  if (document.getElementById("presets").selectedIndex > 0){
    let preset = JSON.parse(getCookie("presets"))[document.getElementById("presets").selectedIndex-1]["blocks"];
    loadPresetArray(preset);
  }
  
}

function loadPresetArray(preset){
  for (let i = 0; i < window.blocklist.length; i++) { 
    document.querySelector('input[name="color' + i + '"]:checked').checked = false;
    document.querySelector('input[name="color' + i + '"][value="-1"]').checked = true;
  }
  preset.forEach(function(b) {
    for (let i = 0; i < window.blocklist.length; ++i) { 
      if (b[0] == window.blocklist[i][2]){
        for (let j = 0; j < window.blocklist[i][1].length; ++j) { 
          if (b[1] == window.blocklist[i][1][j][5]){
            document.querySelector('input[name="color' + i + '"]:checked').checked = false;
            document.querySelector('input[name="color' + i + '"][value="' + j + '"]').checked = true;
          }
        }
        break;
      }
    }
  });
  updateMap();
}

function savePreset(){
  let presetName = prompt("Enter a name for your preset:", "");

  if (presetName != null) {
    let presets = JSON.parse(getCookie("presets"));
    for (let i = 0; i < presets.length; ++i) {
      if (presets[i]["name"] == presetName){
        presets.splice(i, 1);
        break;
      }
    }
    let presetblocks = []
    for (let i = 0; i < selectedblocks.length; ++i) {
      let sb = selectedblocks[i];
      presetblocks.push([
        window.blocklist[sb[0]][2],
        window.blocklist[sb[0]][1][sb[1]][5]
      ]);
    }
    presets.push({"name":presetName,"blocks":presetblocks});
    setCookie("presets", JSON.stringify(presets), 9000);
  }
  loadCookies();
  document.getElementById("presets").selectedIndex = document.getElementById("presets").options.length-1;
}

// Import preset from a link
function importPreset(encodedPreset){
  if (encodedPreset == "dQw4w9WgXcQ"){
    document.location = "https://www.youtube.com/watch?v=cZ5wOPinZd4";
    return;
  }
  if (!/^[0-9A-Za-z]+$/g.test(encodedPreset)){
    alert("Preset link is corrupted");
    return;
  }
  encodedPreset += "_";
  let preset = [];
  let block = [];
  let text = "";
  let state = false;
  for (var i = 0; i < encodedPreset.length; i++) {
    let char = encodedPreset.charAt(i);
    let small = /^[0-9a-z_]+$/g.test(char);
    if (small && state){
      state = false;
      block.push(parseInt(text, 26));
      text = "";
      preset.push(block);
      block = [];
    }else if(!small && !state){
      state = true;
      block.push(parseInt(text, 36));
      text = "";
    }
    
    text += (state) ? char.toLowerCase().replace(/[qrstuvwxyz]/g, (m) => {return {'q':'0','r':'1','s':'2','t':'3','u':'4','v':'5','w':'6','x':'7','y':'8','z':'9'}[m];}) : char;
  }
  loadPresetArray(preset);
}

// Export preset to a link
function exportPreset(){
  let presetblocks = []
  for (let i = 0; i < selectedblocks.length; ++i) {
    let sb = selectedblocks[i];
    presetblocks.push([
      window.blocklist[sb[0]][2],
      window.blocklist[sb[0]][1][sb[1]][5]
    ]);
  }
  let presetstr = ""
  for (let i = 0; i < presetblocks.length; ++i) {
    presetstr += (presetblocks[i][0]).toString(36) + (presetblocks[i][1]).toString(26).replace(/[0123456789]/g, (m) => {return {'0':'q','1':'r','2':'s','3':'t','4':'u','5':'v','6':'w','7':'x','8':'y','9':'z'}[m];}).toUpperCase();
  }
  return "https://rebane2001.com/mapartcraft/?preset=" + presetstr;
}


// Share preset link
function sharePreset(){
  if (selectedblocks.length == 0){
    alert("Select blocks before sharing them!");
    return;
  }
  prompt("Share this link to share your currently selected blocks", exportPreset());
}

function deletePreset(){
  let presets = JSON.parse(getCookie("presets"));
  presets.splice(document.getElementById("presets").selectedIndex-1, 1);
  setCookie("presets", JSON.stringify(presets), 9000);
  loadCookies();
}

function initCookie() {
  if(confirm("To use presets, we need to use cookies. Are you okay with that?")){
    setCookie("presets", "[{\"name\":\"None\",\"blocks\":[]},{\"name\":\"Everything\",\"blocks\":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],[21,0],[22,0],[23,0],[24,0],[25,0],[26,0],[27,0],[28,0],[29,0],[30,0],[31,0],[32,0],[33,0],[34,0],[35,0],[36,0],[37,0],[38,0],[39,0],[40,0],[41,0],[42,0],[43,0],[44,0],[45,0],[46,0],[47,0],[48,0],[49,0],[50,0]]},{\"name\":\"Carpets\",\"blocks\":[[13,1],[14,1],[15,1],[16,1],[17,1],[18,1],[19,1],[20,1],[21,1],[22,1],[23,1],[24,1],[25,1],[26,1],[27,1],[28,1]]}]", 9000)
    loadCookies();
    tooltip.refresh();
  }
}

function loadCookies(){
  if(document.getElementById("fauxpresets")){ //if loading cookie for the first time since refresh
    document.getElementById("fauxpresets").outerHTML = ""; //delete faux button
    document.getElementById("blockselectiontitle").outerHTML = ""; //sketchy workaround - really crappy
    document.getElementById('blockselection').innerHTML = "<h2>Block selection</h2><select id=\"presets\" onchange=\"loadPreset()\"></select><button type=\"button\" onClick=\"deletePreset()\">Delete</button><button type=\"button\" onClick=\"savePreset()\">Save</button><button type=\"button\" onClick=\"sharePreset()\" data-tooltip title=\"Shares the blocks you have currently selected as a link\">Share</button><br>" + document.getElementById('blockselection').innerHTML;
  }
  document.getElementById("presets").innerHTML = "<option>Presets</option>";
  let presets = JSON.parse(getCookie("presets"));
  for (let i = 0; i < presets.length; ++i) {
    document.getElementById("presets").innerHTML += "<option>" + presets[i]["name"] + "</option>"; //possible XSS but it's client-side so it doesn't really matter
  }
}

function checkCookie() {
  if (getCookie("presets") != "")
    loadCookies();
}

function updateVersion(){
	mcversion = document.getElementById("version").value;
  [dataversion,blockversion] = versionindex[mcversion];
  switch (blockversion) {
        case 0:
          window.blocklist = window.colorlist_base;
          break;
        case 1:
          window.blocklist = window.colorlist_base;
          for (let x = 0; x < window.colorlist_patches["1.13"].length; ++x) {
            for (let i = 0; i < window.blocklist.length; ++i) { 
              if (window.colorlist_patches["1.13"][x][0][0] == window.blocklist[i][2]){
                for (let j = 0; j < window.blocklist[i][1].length; ++j) { 
                  if (window.colorlist_patches["1.13"][x][0][1] == window.blocklist[i][1][j][5]){
                    window.blocklist[i][1][j] = window.colorlist_patches["1.13"][x][1];
                    break;
                  }
                }
                break;
              }
            }
          }
          break;
  }
}


function loadImg(e) {
  img = new Image;
  filename = e.target.files[0].name.replace(/\.[^/.]+$/, "");
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = function() {
    updateMap();
  }
}

function chooseFile() {
  document.getElementById("imgupload").click();
}

function findCorners(x,y){
  let raw = [(x+64)/128,(y+64)/128]
  return {
    "topleft": [Math.floor(raw[0])*128-64,Math.floor(raw[1])*128-64],
    "topright": [Math.ceil(raw[0])*128-64,Math.floor(raw[1])*128-64],
    "bottomleft": [Math.floor(raw[0])*128-64,Math.ceil(raw[1])*128-64],
    "bottomright": [Math.ceil(raw[0])*128-64,Math.ceil(raw[1])*128-64],
  }
}

function getPdnPalette() {
  if (selectedblocks.length == 0){
    alert("Select blocks before downloading palette!");
    return;
  }
  // refresh selectedcolors
  selectedblocks = []; //touching this might break presets, so be careful
  selectedcolors = [];
  for (let i = 0; i < window.blocklist.length; i++) {
    blockid = document.querySelector('input[name="color' + i + '"]:checked').value;
    if (blockid == -1) {
      continue
    }
    selectedblocks.push([i, parseInt(blockid)]);
    // gotta add 2D/3D support here
    if (document.getElementById('staircasing').checked) {
      selectedcolors.push(window.blocklist[i][0][0]);
    }
    selectedcolors.push(window.blocklist[i][0][1]);
    if (document.getElementById('staircasing').checked) {
      selectedcolors.push(window.blocklist[i][0][2]);
    }
  }
  // generate and dl pdn file
  let paletteText = "; paint.net Palette File\n; Generated by MapartCraft\n; Link to preset: " + exportPreset() + "\n; staircasing: " + ((document.getElementById('staircasing').checked) ? "enabled" : "disabled") + "\n";
  for (let i = 0; i < selectedcolors.length; i++) {
    let color = selectedcolors[i];
    paletteText += ("FF" + Number(color[0]).toString(16).padStart(2,"0") + Number(color[1]).toString(16).padStart(2,"0") + Number(color[2]).toString(16).padStart(2,"0") + "\n").toUpperCase();
  }
  if (selectedcolors.length > 96)
    alert("Warning, your palette has " + selectedcolors.length + " colors, while the maximum in Paint.net is 96\nSome colors will be unavailable in Paint.net")
  console.log("Downloading PDN palette");
  let blob = new Blob([paletteText], {
    type: 'text/plain'
  });
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = filename + ".txt";
  a.click();
  window.URL.revokeObjectURL(url);
}

//Thx
//https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
  var c = ca[i];
  while (c.charAt(0) == ' ') {
    c = c.substring(1);
  }
  if (c.indexOf(name) == 0) {
    return c.substring(name.length, c.length);
  }
  }
  return "";
}

// Thx
// https://stackoverflow.com/a/16436975
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

// Thx
// https://stackoverflow.com/a/4587130
// https://stackoverflow.com/a/1144249
function indexOfObj(obj, list) { // Index of object in list
  var i;
  for (i = 0; i < list.length; i++) {
    if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
      return i;
    }
  }
  return -1;
}

function indexOfObjOptim(obj, list) { // Index of object in list (optimized, takes only last 10 values)
  var i;
  for (i = list.length - 10; i < list.length; i++) {
    if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
      return i;
    }
  }
  return -1;
}

// Thx Alexander O'Mara
// https://stackoverflow.com/a/41310924
function cssrgb(values) {
  return 'rgb(' + values.join(', ') + ')';
}

document.addEventListener("DOMContentLoaded", function() {
  initialize();
});
