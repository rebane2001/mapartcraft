var mapsize = [1, 1];
var selectedblocks = [];
var selectedcolors = [];
var filename = "mapart";
var img = new Image();
var currentSplit = [-1,-1]
var benchmark;
var renderCallback = function(){};
var firefox = false;
var previewScale = 2;
var devicePixelRatio = window.devicePixelRatio || 1;
var visualStatus = [];
var visualSetup = false;
var splits = [];
var gotMap = false;
// Set to 1 until page has loaded
var mapstatus = 1;
//0 - idle
//1 - doing updateMap
//2 - doing updateMap, but queue another updateMap
//3 - doing a different task
//4 - doing an updateMap for a different task

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
  "1.15.2": [2230,1],
  "1.16.0": [2566,2],
  "1.16.1": [2567,2],
};

var mcversion = "1.12.2";
var dataversion = 1343;
var blockversion = 0;

var displaycanvas;
var offscreen;
var offscreensplit;
var visualrender;
const worker = new Worker("js/worker.js");

var sheet;

function genBlocklist(){
  let colorid = 0;
  let blockseletionhtml = "";
  window.blocklist.forEach(function(i) {
    blockid = 0;
    blockseletionhtml += '<br><div class="colorbox" colors="' + i[0].map(c => cssrgb(c)).join(";") + '"></div><label><input type="radio" name="color' + colorid + '" value="-1" onclick="updateMap()" checked><img src="%%ROOTPATH%%/img/barrier.png" alt="%%NONE%%" data-tooltip title="%%NONE%%"></label>';
    i[1].forEach(function(j) {
      let imgfile = j[4]
      if (j[4] == "")
        imgfile = j[0]
      blockseletionhtml += '<label><input type="radio" name="color' + colorid + '" value="' + blockid + '" onclick="updateMap()"><img src="%%ROOTPATH%%/img/null.png" class="block block-' + imgfile + '" alt="' + j[2] + '" data-tooltip title="' + j[2] + '"></label>';
      blockid++;
    });
    colorid++;
  });
  document.getElementById('blockselection').innerHTML += blockseletionhtml;
}

function initialize() {
	//show warning when using Edge
  if (!(/*@cc_on!@*/false || !!document["documentMode"]) && !!window["StyleMedia"]) {
    alert('%%EDGEWARNING%%');
  }
  //load latest version if no version in cookie
  document.getElementById("version").value = (getCookie("mcversion") != "") ? getCookie("mcversion") : Object.keys(versionindex)[Object.keys(versionindex).length - 1];
  updateVersion();
  displaycanvas = document.getElementById('displaycanvas');
  try{
    offscreen = new OffscreenCanvas(128, 128);
    offscreensplit = new OffscreenCanvas(128, 128);
    sheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [sheet];
  }catch (err){
    //means the user is probably using Firefox, so we're gonna use fixes
    console.log("Falling back to Firefox mode (slower, no loading cursor)");
    firefox = true;
    offscreen = document.createElement('canvas');
    offscreen.width = 128;
    offscreen.height = 128;
    offscreensplit = document.createElement('canvas');
    offscreensplit.width = 128;
    offscreensplit.height = 128;
  }
  try{
    visualrender = new OffscreenCanvas(128, 128);
  }catch (err){
    visualrender = document.createElement('canvas');
    visualrender.width = 128;
    visualrender.height = 128;
  }
  updateStyle();
  document.getElementById('imgupload').addEventListener('change', loadImg);
  checkCookie();
  let urlParams = new URL(window.location).searchParams;
  if (urlParams.has('preset'))
    importPreset(urlParams.get('preset'));
  img.src = "%%ROOTPATH%%/img/upload.png";
  img.onload = function() {
    let dctx = displaycanvas.getContext('2d');
    dctx.drawImage(img, 0, 0);
    mapstatus = 0;
  }
}

function updateStyle() {
  if(document.getElementById("staircasing").selectedIndex > 0) {
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
  switch (mapmode){
    case 0:
      showControl("downloadbtnsection");
      hideControl("downloadmapdatbtnsection");
      showControl("materialsbtnsection");
      showControl("underblockssection");
      hideControl("unobtainiablesection");
      break;
    case 1:
      hideControl("downloadbtnsection");
      hideControl("downloadmapdatbtnsection");
      showControl("materialsbtnsection");
      showControl("underblockssection");
      hideControl("unobtainiablesection");
      break;
    case 2:
      hideControl("downloadbtnsection");
      showControl("downloadmapdatbtnsection");
      hideControl("materialsbtnsection");
      hideControl("underblockssection");
      showControl("unobtainiablesection");
      break;
  }
  updateMap();
}

function showControl(control) {
  document.getElementById(control).style.display = "inline";
}

function hideControl(control) {
  document.getElementById(control).style.display = "none";
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
      if (document.getElementById("staircasing").selectedIndex > 0) {
        selectedcolors.push(window.blocklist[i][0][0]);
        selectedcolors.push(window.blocklist[i][0][2]);
      }
      if (document.getElementById('unobtainiable').checked && document.getElementById("mapmode").selectedIndex == 2) {
        selectedcolors.push(window.blocklist[i][0][3]);
      }
      selectedcolors.push(window.blocklist[i][0][1]);
    }

    updateStyle(); // Updating colorbox colors

    mapsize = [document.getElementById('mapsizex').value, document.getElementById('mapsizey').value];

    let ctx = offscreen.getContext('2d');
    //this part is so that weird displays scale pixels 1 to int(x)
    devicePixelRatio = window.devicePixelRatio || 1;

    ctx.canvas.width = mapsize[0] * 128;
    ctx.canvas.height = mapsize[1] * 128;

    updatePreviewScale(0);

    document.getElementById('mapres').innerHTML = ctx.canvas.width + "x" + ctx.canvas.height;
    document.getElementById('mapreswarning').innerHTML = img.width + "x" + img.height;

    if (img.width / img.height == ctx.canvas.width / ctx.canvas.height) {
      document.getElementById('mapreswarning').style = "color:red; display: none";
    } else {
      document.getElementById('mapreswarning').style = "color:red; display: inline";
      if (document.getElementById('cropimg').checked)
          document.getElementById('mapreswarning').style = "color:orange; display: inline";
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //crop or scale image
    if (document.getElementById('cropimg').checked) {
      let cropdim = cropImg(img.width,img.height);
      ctx.drawImage(img, cropdim[0], cropdim[1], cropdim[2], cropdim[3], 0, 0, ctx.canvas.width, ctx.canvas.height);
    }else{
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    //worker code here
    worker.postMessage([
      imgData,
      [ctx.canvas.width,ctx.canvas.height],
      document.getElementById("dither").selectedIndex,
      (selectedblocks.length != 0),
      selectedcolors,
      document.getElementById('bettercolor').checked,
      mapsize,
      (document.getElementById('trans').checked  && document.getElementById("mapmode").selectedIndex == 2)
      ]);
  }else if(mapstatus == 1){
    mapstatus++;
  }
}

function updateSplit() {
  let ctx = offscreen.getContext('2d');
  let ctxsplt = offscreensplit.getContext('2d');
  ctxsplt.drawImage(offscreen,currentSplit[0]*128,currentSplit[1]*128,128,128,0,0,128,128);
}

worker.onmessage = function(e) { 
  if (!isNaN(e.data)){
    if ((performance.now() - benchmark > 40 && e.data < 0.1) || performance.now() - benchmark > 400)
      document.getElementById('progress').style.display = "block";
    let secondsRemaining = Math.ceil((performance.now() - benchmark)/e.data*(1-e.data)/1000);
    document.getElementById('progresstext').innerHTML = `${Math.floor(e.data*100)}% - ${secondsRemaining} ${(secondsRemaining != 0) ? "%%TIMEREMAINING-SECONDS%%" : "%%TIMEREMAINING-SECOND%%"} %%TIMEREMAINING%%`;
    document.getElementById('progressdiv').style.width = `${Math.floor(e.data*100)}%`;
    return;
  }
  document.getElementById('progress').style.display = "none";

  imgData = e.data;

  let octx = offscreen.getContext('2d');
  let dctx = displaycanvas.getContext('2d');
  displaycanvas.width = octx.canvas.width;
  displaycanvas.height = octx.canvas.height;
  octx.putImageData(imgData, 0, 0);
  dctx.putImageData(imgData, 0, 0);
  document.getElementById('mapres').innerHTML = octx.canvas.width + "x" + octx.canvas.height;
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
    alert("%%SELECTBLOCKSWARNING-DOWNLOAD%%");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 4;

  splits = [];
  console.log("Downloading as 1x1 split");
  for (let x = 0; x < document.getElementById('mapsizex').value; x++){
    for (let y = 0; y < document.getElementById('mapsizey').value; y++){
      console.log("Preparing: " + x + " " + y);
      splits.push([x,y]);
    }
  }
  renderCallback = function(){dlNbtSplit()};
  updateMap();
}

function dlNbtSplit(){ //call getNbtSplit() first!
  if (splits.length > 0){
    currentSplit = splits.shift();
    console.log("Currently downloading: " + currentSplit[0] + " " + currentSplit[1]);
    updateSplit();
    getNbt();
    setTimeout(() => { dlNbtSplit(); }, 1000);
  }else{
    resetCallback();
    console.log("Done, rerendering map");
    mapstatus = 0;
    currentSplit = [-1,-1];
  }
}

function getMap() {
  let ctx;
  if (currentSplit[0] == -1){
    if (!gotMap){
      gotMap = true;
      mapstatus = 4;
      updateMap();
      return;
    }
    gotMap = false;
    ctx = offscreen.getContext('2d');
  } else {
    ctx = offscreensplit.getContext('2d');
  }

  
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
      color = getColor(imgData, ctx, x, y);
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
  let staircasingMode = document.getElementById("staircasing").selectedIndex;
  if (staircasingMode > 0) { // CLASSIC 3D CODE
    for (let x = 0; x < ctx.canvas.width; x++) {
      let base_height = 1001 - staircasingMode;
      let min_height = base_height;
      let localminmax = []; // Initialize the minmax array where we will store each min and max sequentially for future comparison
      let c = -1; // index for the localminmax array
      let dir = 0; // direction of "stairs", 1 = up, -1 = down, 0 = undetermined

      for (let y = 0; y < ctx.canvas.height; y++) {
        let color = getColor(imgData, ctx, x, y);
        let toneid = getTone(nbtblocklist, color)[0];
        if (staircasingMode == 2){
          if (toneid != 0 && toneid != dir){
            if (dir == 1){
              let beginRange;
              for (let y2 = y-1; y2 < ctx.canvas.height; y2--) {
                if (getTone(nbtblocklist, getColor(imgData, ctx, x, y2))[0] == 1){
                  beginRange = y2;
                  break;
                }
              }
              localminmax.push([999-min_height,base_height-min_height-(getTone(nbtblocklist, getColor(imgData, ctx, x, y-1))[0]),beginRange,y-1]);
              base_height = 1000;
              min_height = 1000;
            }
            dir = toneid;
          }
        }
        base_height += toneid;
        min_height = Math.min(min_height, base_height);
      }

      localminmax.push([999-min_height,base_height-min_height,9999,9999]); // Add a final minmax
      localminmax.push([999-min_height,9999,9999,9999]); // Add a final minmax

      //hacky hack
      if (getTone(nbtblocklist, getColor(imgData, ctx, x, 0))[0] == 1 && staircasingMode == 2){
        let hacky = localminmax[0];
        hacky[0]+=1;
        hacky[1]+=1;
        localminmax[0] = hacky;
      }

      let hackNotComplete = true;
      while(staircasingMode == 2 && hackNotComplete){
        hackNotComplete = false;
        for (let i = 0; i < localminmax.length-1; i++) {
            if (localminmax[i][1] == localminmax[i+1][0]){
              localminmax[i][0] += 1;
              localminmax[i][1] += 1;
              hackNotComplete = true;
            }
        }
      }

      base_height = (staircasingMode == 2) ?  localminmax[0][0]+1 : (1000 - min_height);

      dir = 0;
      adj = (staircasingMode == 2) ?  0 : 1;

      if (underblocks > 0)
        adj += ((underblocks > 2) ? 2 : 1);

      for (let y = 0; y < ctx.canvas.height; y++) {
        let color = getColor(imgData, ctx, x, y);
        let [toneid, blockid] = getTone(nbtblocklist, color);
        if (staircasingMode == 2){
          if (toneid != 0 && toneid != dir){
            if (dir == 1){
              base_height = localminmax[++c+1][0]+1;
            }
            dir = toneid;
          }
        }
        //ACTUAL BLOCK
        base_height += toneid;

        if (localminmax[c+1][2] <= y && localminmax[c+1][3] >= y && staircasingMode == 2){
          if (localminmax[c+2][0] > localminmax[c+1][1])
            base_height = localminmax[c+2][0]+1;
        }

        //NOOBLINE
        if (y == 0) {
          blocks.push({
            "pos": [x, ((toneid == 1 && staircasingMode == 2) ? 0 : (base_height - toneid)) + adj, y],
            "state": 0
          });
        }

        blocks.push({
          "pos": [x, base_height + adj, y + 1],
          "state": blockid
        });
        //console.log(base_height + adj);
        //UNDERBLOCKS
        if (underblocks == 2) {
          blocks.push({
            "pos": [x, base_height + adj - 1, y + 1],
            "state": 0
          });
        } else if (underblocks == 3) {
          blocks.push({
            "pos": [x, base_height + adj - 1, y + 1],
            "state": 0
          });
          blocks.push({
            "pos": [x, base_height + adj - 2, y + 1],
            "state": 0
          });
          if( // spaghetti, I need to break up this entire function into proper smaller functions
            indexOfObjOptim({
              "pos": [x, base_height + adj - 1, y + 0],
              "state": 0
            }, blocks) > -1 &&
            indexOfObjOptim({
              "pos": [x, base_height + adj - 1, y - 1],
              "state": 0
            }, blocks) > -1
          ){
            let toRemove = indexOfObjOptim({
              "pos": [x, base_height + adj - 2, y + 0],
              "state": 0
            }, blocks);
            if (toRemove > -1)
              blocks.splice(toRemove,1)
          }
        } else if (underblocks == 4) { //very ugly code, should be made into functions instead
          blocks.push({
            "pos": [x, base_height + adj - 1, y + 1],
            "state": 0
          });
          blocks.push({
            "pos": [x, base_height + adj - 2, y + 1],
            "state": 0
          });
        } else if (underblocks == 1) {
          selectedblocks.forEach(function(b) {
            if (arraysEqual(blocklist[b[0]][0][0], nbtblocklist[blockid]["Colors"][0])) {
              if (blocklist[b[0]][1][b[1]][3])
                blocks.push({
                  "pos": [x, base_height + adj - 1, y + 1],
                  "state": 0
                });
            }
          });
        }

      }
    }
  } else { // 2D CODE
    // Height to start placing blocks at
    let base_height = 0;
    if (underblocks > 0)
      base_height++;
    if (underblocks > 2)
      base_height++;
    for (let x = 0; x < ctx.canvas.width; x++) {
      for (let y = 0; y < ctx.canvas.height; y++) {
        let color = getColor(imgData, ctx, x, y);
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
            "pos": [x, base_height, y],
            "state": 0
          });
        }
        //ACTUAL BLOCK
        blocks.push({
          "pos": [x, base_height, y + 1],
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

function getColor(imgData, ctx, x, y){
  return [imgData.data[x * 4 + y * 4 * ctx.canvas.width], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 1], imgData.data[x * 4 + y * 4 * ctx.canvas.width + 2]];
}
function getColorAlpha(imgData, ctx, x, y){
  return imgData.data[x * 4 + y * 4 * ctx.canvas.width + 3];
}

function getTone(nbtblocklist,color){
  for (let i = 0; i < nbtblocklist.length; i++) {
    if (arraysEqual(nbtblocklist[i]["Colors"][0], color))
      return [-1,i];
    if (arraysEqual(nbtblocklist[i]["Colors"][1], color))
      return [0,i];
    if (arraysEqual(nbtblocklist[i]["Colors"][2], color))
      return [1,i];
  }
  alert("An error has occured! This is most likely because you are using a privacy-enhanced browser (such as Brave). Please turn off protections/shields or use a different browser such as Chrome or Firefox.");
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
  
  let htmlString = '<tbody><tr style="display: table-row;"><th>%%MATERIALS-BLOCK%%</th><th>%%MATERIALS-AMOUNT%%</th></tr>';
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

    let j = [block.Name, "", "%%MATERIALS-PLACEHOLDERBLOCK%%", false, "placeholder"]
    if(block.SelectedBlock[0] != -1)
      j = blocklist[block.SelectedBlock[0]][1][block.SelectedBlock[1]]
    
    let imgfile = j[4]
    if (j[4] == "")
      imgfile = j[0]

    htmlString += '<tr><th><img src="%%ROOTPATH%%/img/' + ((imgfile == "placeholder") ? "placeholder.png" : ('null.png" class="block block-' + imgfile)) + '" alt="' + j[2] + '" data-tooltip title="' + j[2] + '"></th>';
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
    alert("%%SELECTBLOCKSWARNING-DOWNLOAD%%");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 4;

  splits = [];
  console.log("Downloading as 1x1 split");
  for (let x = 0; x < document.getElementById('mapsizex').value; x++){
    for (let y = 0; y < document.getElementById('mapsizey').value; y++){
      console.log("Preparing: " + x + " " + y);
      splits.push([x,y]);
    }
  }
  renderCallback = function(){dlMapDatSplit()};
  updateMap();
}

function dlMapDatSplit(){ //call getMapDatSplit() first!
  
    if (splits.length > 0){
      currentSplit = splits.shift();
      console.log("Currently downloading: " + currentSplit[0] + " " + currentSplit[1]);
      updateSplit();
  
      let ctx = offscreensplit.getContext('2d');
      let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      let colorData = [];
    
      for (let y = 0; y < ctx.canvas.height; y++) {
        for (let x = 0; x < ctx.canvas.width; x++) {
          if (getColorAlpha(imgData, ctx, x, y) == 0){
            colorData.push(0);
            continue;
          }
          color = getColor(imgData, ctx, x, y);
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
        {"name":"","value":{"data":{"type":"compound","value":{"scale":{"type":"byte","value":0},"dimension":{"type":"byte","value":((dataversion > 1343) ? 0 : -128)},"trackingPosition":{"type":"byte","value":0},"locked":{"type":"byte","value":1},"height":{"type":"short","value":128},"width":{"type":"short","value":128},"xCenter":{"type":"int","value":0},"zCenter":{"type":"int","value":0},"colors":{"type":"byteArray","value":colorData}}}}}
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
      setTimeout(() => { dlMapDatSplit(); }, 1000);
    }else{
      resetCallback();
      console.log("Done, rerendering map");
      mapstatus = 0;
      currentSplit = [-1,-1];
    }

}

function getNbt() {
  //if no blocks selected, don't download
  if (selectedblocks.length == 0){
    alert("%%SELECTBLOCKSWARNING-DOWNLOAD%%");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 3;
    
  if (!gotMap && currentSplit[0] == -1){
    renderCallback = function(){resetCallback();getNbt();};
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

//https://codepen.io/techslides/pen/zowLd
function launchVisual(){
  if (!visualSetup)
    setupVisual()
  document.getElementById("visualModal").style.display = "block";
}

function setupVisual(){
  visualSetup = true;

  let canvas = document.getElementById('visualcanvas');

  
  let closebtn = document.getElementsByClassName("close")[0];
  closebtn.onclick = function() {
    let modal = document.getElementById("visualModal");
    modal.style.display = "none";
    history.pushState(null, null, window.location.pathname);
  };



        var ctx = canvas.getContext('2d');
        trackTransforms(ctx);
        resizeVisual();

  let rotatebtn = document.getElementsByClassName("rotate")[0];
  rotatebtn.onclick = function() {
    // rotate 90 degrees
    ctx.rotate(1.5708);
    redraw();
  };

    function redraw(){

          // Clear the entire canvas
          var p1 = ctx.transformedPoint(0,0);
          var p2 = ctx.transformedPoint(canvas.width,canvas.height);
          ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);


          ctx.save();
          ctx.setTransform(1,0,0,1,0,0);
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.restore();

          let matrix = ctx.getTransform();
          ctx.imageSmoothingEnabled = (Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b) < 1);
          let imatrix = matrix.inverse(); 
          let blockX = Math.floor((lastX * imatrix.a + lastY * imatrix.c + imatrix.e)/17);
          let blockZ = Math.floor((lastX * imatrix.b + lastY * imatrix.d + imatrix.f)/17);

          ctx.drawImage(visualrender,0,0);

          ctx.save();
          ctx.setTransform(1,0,0,1,0,0);
          try{
            let i = 1;
            ctx.font = "30px Times New Roman";
            ctx.fillStyle = "black";
            ctx.fillText(`X: ${blockX}`,10,40*++i);
            ctx.fillText(`Z: ${blockZ}`,10,40*++i);
            let status = visualStatus[blockX][blockZ];
            ctx.fillText(`Y: ${status["y"]}`,10,40*++i);
          }catch{}
          ctx.restore();

        }
        redraw();

        function resizeVisual(){
          let canvas = document.getElementById('visualcanvas');
          canvas.width = document.documentElement.clientWidth;
          canvas.height = document.documentElement.clientHeight;
          redraw();
        }
          
//ctx.imageSmoothingEnabled = (factor > 1);
      var lastX=canvas.width/2, lastY=canvas.height/2;

      var dragStart,dragged;

      canvas.addEventListener('mousedown',function(evt){
          document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
          lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
          lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
          dragStart = ctx.transformedPoint(lastX,lastY);
          dragged = false;
      },false);

      canvas.addEventListener('mousemove',function(evt){
          lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
          lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
          dragged = true;
          if (dragStart){
            var pt = ctx.transformedPoint(lastX,lastY);
            ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
                }
                redraw();
      },false);

      canvas.addEventListener('mouseup',function(evt){
          dragStart = null;
          if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
      },false);

      var scaleFactor = 1.1;

      var zoom = function(clicks){
          var pt = ctx.transformedPoint(lastX,lastY);
          ctx.translate(pt.x,pt.y);
          var factor = Math.pow(scaleFactor,clicks);
          ctx.scale(factor,factor);
          ctx.translate(-pt.x,-pt.y);
          redraw();
      }

      var handleScroll = function(evt){
          var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
          if (delta) zoom(delta);
          return evt.preventDefault() && false;
      };
    
      canvas.addEventListener('DOMMouseScroll',handleScroll,{passive: false});
      canvas.addEventListener('mousewheel',handleScroll,{passive: false});
      window.addEventListener("resize", resizeVisual);
}

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function(){ return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function(){
        savedTransforms.push(xform.translate(0,0));
        return save.call(ctx);
    };
  
    var restore = ctx.restore;
    ctx.restore = function(){
      xform = savedTransforms.pop();
      return restore.call(ctx);
        };

    var scale = ctx.scale;
    ctx.scale = function(sx,sy){
      xform = xform.scaleNonUniform(sx,sy);
      return scale.call(ctx,sx,sy);
        };
  
    var rotate = ctx.rotate;
    ctx.rotate = function(radians){
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(ctx,radians);
    };
  
    var translate = ctx.translate;
    ctx.translate = function(dx,dy){
        xform = xform.translate(dx,dy);
        return translate.call(ctx,dx,dy);
    };
  
    var transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
        var m2 = svg.createSVGMatrix();
        m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
        xform = xform.multiply(m2);
        return transform.call(ctx,a,b,c,d,e,f);
    };
  
    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a,b,c,d,e,f){
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx,a,b,c,d,e,f);
    };
  
    var pt  = svg.createSVGPoint();
    ctx.transformedPoint = function(x,y){
        pt.x=x; pt.y=y;
        return pt.matrixTransform(xform.inverse());
    }
}







function getVisuals() {
  //if no blocks selected, don't download
  if (selectedblocks.length == 0){
    alert("%%SELECTBLOCKSWARNING-DOWNLOAD%%");
    return;
  }

  if (mapstatus == 1 || mapstatus == 2)
    return;
  mapstatus = 3;
    
  if (!gotMap && currentSplit[0] == -1){
    renderCallback = function(){resetCallback();getVisuals();};
    getMap();
    return;
  }

  let {blocks, nbtblocklist, width, height} = getMap();

  visualStatus = [];

  for (let i = 0; i < blocks.length; i++) {
    try {
      if (visualStatus[blocks[i]["pos"][0]][blocks[i]["pos"][2]]["y"] < blocks[i]["pos"][1])
        throw 'Old Y is lower than new one';
    } catch {
      try {
        visualStatus[blocks[i]["pos"][0]][blocks[i]["pos"][2]] = {"y":blocks[i]["pos"][1], "state":blocks[i]["state"]};
      } catch {
        visualStatus[blocks[i]["pos"][0]] = [];
        visualStatus[blocks[i]["pos"][0]][blocks[i]["pos"][2]] = {"y":blocks[i]["pos"][1], "state":blocks[i]["state"]}; 
      }
    }
  }
  let blocksimg = document.getElementById('blocksimg');
  let placeholderimg = document.getElementById('placeholderimg');
  let vctx = visualrender.getContext('2d');
  vctx.fillStyle = "#FF8968";
  visualrender.width = width*17+1;
  visualrender.height = height*17+1;
  vctx.fillRect(0, 0, visualrender.width, visualrender.height);
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {
      vctx.fillStyle = "#222";
      vctx.fillRect(1 + x * 17, 1 + z * 17, 16, 16);
      let selectedblock = nbtblocklist[visualStatus[x][z]["state"]]["SelectedBlock"];
      if (selectedblock[0] == -1){
        vctx.drawImage(placeholderimg, 0, 0, 32, 32, 1 + x * 17, 1 + z * 17, 16, 16);
      } else {
        let blockcoords = selectedToCoords(selectedblock);
        vctx.drawImage(blocksimg, blockcoords[0], blockcoords[1], 32, 32, 1 + x * 17, 1 + z * 17, 16, 16);
      }
      try {
        if (visualStatus[x][z]["y"] < visualStatus[x][z-1]["y"]){
          vctx.fillStyle = 'rgba(0,0,32,0.1)';
          for (let i = 0; i < 4; i++) {
            vctx.fillRect(1 + x * 17, 1 + z * 17, 16, 1+i);
          }
        }
      } catch{}
      try {
        if (visualStatus[x][z]["y"] < visualStatus[x][z+1]["y"]){
          vctx.fillStyle = 'rgba(0,0,32,0.1)';
          for (let i = 0; i < 4; i++) {
            vctx.fillRect(1 + x * 17, 1 + z * 17 + 12 + i, 16, 4-i);
          }
        }
      } catch{}
    }
  }

  mapstatus = 0;
  launchVisual();
}

function selectedToCoords(selectedblock){
  let block = window.blocklist[selectedblock[0]][1][selectedblock[1]];
  let blockstyle = getComputedStyle(document.querySelector(`.block-${(block[4] != "") ? block[4] : block[0]}`));
  return [parseFloat(blockstyle.backgroundPositionX)/-100*32,parseFloat(blockstyle.backgroundPositionY)/-100*32];
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
  let presetName = prompt("%%PRESETS-ENTERNAME%%", "");

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
  if (!(/^[0-9A-Za-z]+$/g.test(encodedPreset) || encodedPreset == "")){
    alert("%%PRESETS-CORRUPTED%%");
    return;
  }
  encodedPreset += "_";
  let preset = [];
  let block = [];
  let text = "";
  let state = false;
  for (let i = 0; i < encodedPreset.length; i++) {
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
    alert("%%SELECTBLOCKSWARNING-SHARE%%");
    return;
  }
  prompt("%%PRESETS-SHARELINK%%", exportPreset());
}

function deletePreset(){
  let presets = JSON.parse(getCookie("presets"));
  presets.splice(document.getElementById("presets").selectedIndex-1, 1);
  setCookie("presets", JSON.stringify(presets), 9000);
  loadCookies();
}

function initCookie() {
  setCookie("presets", "[{\"name\":\"%%PRESETS-PRESET-NONE%%\",\"blocks\":[]},{\"name\":\"%%PRESETS-PRESET-EVERYTHING%%\",\"blocks\":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],[21,0],[22,0],[23,0],[24,0],[25,0],[26,0],[27,0],[28,0],[29,0],[30,0],[31,0],[32,0],[33,0],[34,0],[35,0],[36,0],[37,0],[38,0],[39,0],[40,0],[41,0],[42,0],[43,0],[44,0],[45,0],[46,0],[47,0],[48,0],[49,0],[50,0],[51,0],[52,0],[53,0],[54,0],[55,0],[56,0],[57,0]]},{\"name\":\"%%PRESETS-PRESET-CARPETS%%\",\"blocks\":[[13,1],[14,1],[15,1],[16,1],[17,1],[18,1],[19,1],[20,1],[21,1],[22,1],[23,1],[24,1],[25,1],[26,1],[27,1],[28,1]]}]", 9000)
  loadCookies();
}

function loadCookies(){
  if(document.getElementById("fauxpresets")){ //if loading cookie for the first time since refresh
    document.getElementById("fauxpresets").outerHTML = ""; //delete faux button
    document.getElementById("blockselectiontitle").outerHTML = ""; //sketchy workaround - really crappy
    document.getElementById('blockselection').innerHTML = "<h2>%%BLOCKSELECTIONTITLE%%</h2><select id=\"presets\" onchange=\"loadPreset()\"></select><button type=\"button\" onClick=\"deletePreset()\">%%PRESETS-DELETE%%</button><button type=\"button\" onClick=\"savePreset()\">%%PRESETS-SAVE%%</button><button type=\"button\" onClick=\"sharePreset()\" data-tooltip title=\"%%PRESETS-TT-SHARE%%\">%%PRESETS-SHARE%%</button><br>" + document.getElementById('blockselection').innerHTML;
  }
  document.getElementById("presets").innerHTML = "<option>%%PRESETS%%</option>";
  let presets = JSON.parse(getCookie("presets"));
  for (let i = 0; i < presets.length; ++i) {
    document.getElementById("presets").innerHTML += "<option>" + presets[i]["name"] + "</option>"; //possible XSS but it's client-side so it doesn't really matter
  }
}

function checkCookie() {
  (getCookie("presets") != "") ? loadCookies() : initCookie();
}

function applyVersionPatch(version){
  for (let x = 0; x < window.colorlist_patches[version]["patch"].length; ++x) {
    for (let i = 0; i < window.blocklist.length; ++i) {
      if (window.colorlist_patches[version]["patch"][x][0][0] == window.blocklist[i][2]){
        for (let j = 0; j < window.blocklist[i][1].length; ++j) { 
          if (window.colorlist_patches[version]["patch"][x][0][1] == window.blocklist[i][1][j][5]){
            window.blocklist[i][1][j] = window.colorlist_patches[version]["patch"][x][1];
            break;
          }
        }
        break;
      }
    }
  }
  for (let x = 0; x < window.colorlist_patches[version]["add"].length; ++x) {
    for (let i = 0; i < window.blocklist.length; ++i){
      if (window.colorlist_patches[version]["add"][x][0][0] == window.blocklist[i][2])
        window.blocklist[i][1].push(window.colorlist_patches[version]["add"][x][1]);
    }
  }
}


function updateVersion(){
  let tempPreset = exportPreset();
  console.log(tempPreset);
	mcversion = document.getElementById("version").value;
  setCookie("mcversion", mcversion, 9000);
  [dataversion,blockversion] = versionindex[mcversion];
  switch (blockversion) {
        case 0:
          window.blocklist = deepClone(window.colorlist_base);
          break;
        case 1:
          window.blocklist = deepClone(window.colorlist_base);
          applyVersionPatch("1.13");
          break;
        case 2:
          window.blocklist = deepClone(window.colorlist_base);
          applyVersionPatch("1.13");
          applyVersionPatch("1.16");
          break;
  }
  window.blocklist = window.blocklist.filter((el) => { return (el[1].length != 0) });
  document.getElementById('blockselection').innerHTML = document.getElementById('blockselection').innerHTML.split('<br><div class="colorbox"')[0];
  genBlocklist();
  updateStyle();
  importPreset(tempPreset.split("?preset=")[1]);
  // hack to only refresh if not launch or else evil bugs shall occur
  if (displaycanvas instanceof HTMLElement)
    tooltip.refresh();
}

function updatePreviewScale(i) {
  devicePixelRatio = window.devicePixelRatio || 1;
  previewScale = Math.max(previewScale + i,1);

  let ctx = offscreen.getContext('2d');
  displaycanvas.style.width = (ctx.canvas.width * previewScale / devicePixelRatio) + "px";
  displaycanvas.style.height = (ctx.canvas.height * previewScale / devicePixelRatio) + "px";
}

function loadImg(e) {
  img = new Image;
  filename = e.target.files[0].name.replace(/\.[^/.]+$/, "");
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = function() {
    // Auto-set map size if resolution looks nice
    if (img.width % 128 == 0 && img.height % 128 == 0){
      if (img.width / 128 < 5 && img.height / 128 < 5){
        document.getElementById('mapsizex').value = img.width / 128;
        document.getElementById('mapsizey').value = img.height / 128;
      }
    }
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
    alert("%%SELECTBLOCKSWARNING-PALETTE%%");
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
    if (document.getElementById("staircasing").selectedIndex > 0) {
      selectedcolors.push(window.blocklist[i][0][0]);
    }
    selectedcolors.push(window.blocklist[i][0][1]);
    if (document.getElementById("staircasing").selectedIndex > 0) {
      selectedcolors.push(window.blocklist[i][0][2]);
    }
    if (document.getElementById('unobtainiable').checked && document.getElementById("mapmode").selectedIndex == 2) {
      selectedcolors.push(window.blocklist[i][0][3]);
    }
  }
  // generate and dl pdn file
  let paletteText = "; paint.net Palette File\n; Generated by MapartCraft\n; Link to preset: " + exportPreset() + "\n; staircasing: " + ((document.getElementById("staircasing").selectedIndex > 0) ? "enabled" : "disabled") + "\n";
  for (let i = 0; i < selectedcolors.length; i++) {
    let color = selectedcolors[i];
    paletteText += ("FF" + Number(color[0]).toString(16).padStart(2,"0") + Number(color[1]).toString(16).padStart(2,"0") + Number(color[2]).toString(16).padStart(2,"0") + "\n").toUpperCase();
  }
  if (selectedcolors.length > 96)
    alert("%%PDNWARNING1%%" + selectedcolors.length + "%%PDNWARNING2%%")
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

// Reveal contact info
function contactinfo(event) {
  event.preventDefault();
  if (confirm('%%HAVEYOUFAQ%%')){
    alert('%%HELPNOTE%%');
    document.querySelectorAll('.contactinfo').forEach(function(e) {
        e.outerHTML = e.innerHTML;
    });
  }
}

//Thx
//https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
  let c = ca[i];
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

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

// Thx
// https://stackoverflow.com/a/4587130
// https://stackoverflow.com/a/1144249
function indexOfObj(obj, list) { // Index of object in list
  let i;
  for (i = 0; i < list.length; i++) {
    if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
      return i;
    }
  }
  return -1;
}

function indexOfObjOptim(obj, list) { // Index of object in list (optimized, takes only last 10 values)
  let i;
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

function deepClone(target){
  return JSON.parse(JSON.stringify(target));
}