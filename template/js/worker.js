var colorCache = new Map(); //lru cache
var labCache = new Map();
var selectedcolors = [];
var bettercolor = false;

function diff_colors(p1, p2) {
  if (bettercolor) {
    //return deltaE(rgb2lab(p1),rgb2lab(p2))
    p1 = rgb2lab(p1);
    p2 = rgb2lab(p2);
  }

  r = p1[0] - p2[0];
  g = p1[1] - p2[1];
  b = p1[2] - p2[2];
  
  return (r * r) + (g * g) + (b * b);
}

function find_closest(pixel) {
  let val = (pixel[0] << 16) + (pixel[1] << 8) + (pixel[2]);
  if (colorCache.has(val)){
    return colorCache.get(val);
  }else{
    let bestval = 9999999;
    let newpixel = pixel;
  
    selectedcolors.forEach(function(p) {
      let diff = diff_colors(p, pixel);
      if (diff < bestval) {
        bestval = diff;
        newpixel = p;
      }
    });

    colorCache.set(val, newpixel);
    return newpixel;
  }
}

function find_closest_two(pixel) {
  let val = (pixel[0] << 16) + (pixel[1] << 8) + (pixel[2]);
  if (colorCache.has(val)){
    return colorCache.get(val);
  }else{
    let bestval1 = 9999999;
    let bestval2 = 9999999;
    let newpixel1 = pixel;
    let newpixel2 = pixel;
  
    selectedcolors.forEach(function(p) {
      let diff = diff_colors(p, pixel);
      if (diff < bestval1) {
        bestval1 = diff;
        newpixel1 = p;
      }
      if (diff < bestval2 && newpixel1 != p) {
        bestval2 = diff;
        newpixel2 = p;
      }
    });

    if (bestval2 - diff_colors(newpixel1,newpixel2) >= 0){
      newpixel2 = newpixel1;
    }
    let twopixel = [bestval1,bestval2,newpixel1,newpixel2];
    colorCache.set(val, twopixel);
    return twopixel;
  }
}

// rgb2lab conversion based on the one from redstonehelper's program
function rgb2lab(rgb) {
  let val = (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2]);
  if (labCache.has(val))
    return labCache.get(val);

  let r1 = rgb[0] / 255.0,
    g1 = rgb[1] / 255.0,
    b1 = rgb[2] / 255.0;

  r1 = 0.04045 >= r1 ? r1 /= 12.0 : Math.pow((r1 + 0.055) / 1.055, 2.4);
  g1 = 0.04045 >= g1 ? g1 /= 12.0 : Math.pow((g1 + 0.055) / 1.055, 2.4);
  b1 = 0.04045 >= b1 ? b1 /= 12.0 : Math.pow((b1 + 0.055) / 1.055, 2.4);
  let f = (0.43605202 * r1 + 0.3850816 * g1 + 0.14308742 * b1) / 0.964221,
    h = 0.22249159 * r1 + 0.71688604 * g1 + 0.060621485 * b1,
    k = (0.013929122 * r1 + 0.097097 * g1 + 0.7141855 * b1) / 0.825211,
    l = 0.008856452 < h ? Math.pow(h, 1 / 3) : (903.2963 * h + 16.0) / 116.0,
    m = 500.0 * ((0.008856452 < f ? Math.pow(f, 1 / 3) : (903.2963 * f + 16.0) / 116.0) - l),
    n = 200.0 * (l - (0.008856452 < k ? Math.pow(k, 1 / 3) : (903.2963 * k + 16.0) / 116.0));

  rgb = [2.55 * (116.0 * l - 16.0) + 0.5, m + 0.5, n + 0.5];
  labCache.set(val, rgb);
  return rgb;
}

onmessage = function(e) {
  imgData = e.data[0];
  canvasSize = e.data[1];
  ditherIndex = e.data[2];
  areBlocksSelected = e.data[3];
  selectedcolors = e.data[4];
  bettercolor = e.data[5];
  mapsize = e.data[6];
  trans = e.data[7];

  colorCache = new Map(); //reset color cache

  for (var i = 0; i < imgData.data.length; i += 4) {
    //i = r, i+1 = g, i+2 = b, i+3 = a
    if (trans && imgData.data[i + 3] < 128){
      imgData.data[i + 0] = 0;
      imgData.data[i + 1] = 0;
      imgData.data[i + 2] = 0;
      imgData.data[i + 3] = 0;
      continue;
    }
    imgData.data[i + 3] = 255; // remove alpha
    
    let x = (i / 4) % canvasSize[0];
    let y = ((i / 4) - x) / canvasSize[0];
    if (x == 0)
      postMessage(y/canvasSize[1]);
    if (areBlocksSelected){
      switch (ditherIndex) {
        case 0: // no dither
          newpixel = find_closest([imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]])
          imgData.data[i + 0] = newpixel[0];
          imgData.data[i + 1] = newpixel[1];
          imgData.data[i + 2] = newpixel[2];
          break;
        case 2: // Bayer 4x4
        case 3: // Bayer 2x2
        case 4: // Ordered 3x3
          patterns = [
            [[1, 9, 3, 11], [13, 5, 15, 7], [4, 12, 2, 10], [16, 8, 14, 6]],
            [[1, 3], [4,2]],
            [[1,7,4],[5,8,3],[6,2,9]]
          ];
          pat = patterns[ditherIndex-2]
          oldpixel = [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]]; 
          twopixel = find_closest_two(oldpixel); //twopixel = [bestval1,bestval2,newpixel1,newpixel2]
          if ((twopixel[0]*(pat[0].length*pat.length+1)/twopixel[1]) > pat[x%pat[0].length][y%pat.length]){
            newpixel = twopixel[3];
          }else{
            newpixel = twopixel[2];
          }
          imgData.data[i + 0] = newpixel[0];
          imgData.data[i + 1] = newpixel[1];
          imgData.data[i + 2] = newpixel[2];
          break;
		  
		//Error diffusion Algorithms
		case 1: // Floyd
		case 5: // Minimized average error, Jarvis, Judice, Ninke  
		case 6: // Burkes dither
		case 7: // Sierra-Lite
		case 8: // Stucki
		case 9: // Atkinson
		  //Declare default matrix and divisor
		  var matrix=[[0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0,0.0]];
		  var divisor=1.0;
		  
		  switch (ditherIndex){ //Only to select correct Matrix, no fallthrough
			  case 1: // Floyd
				matrix=[[0,0,0,7.0,0],[0,3.0,5.0,1.0,0],[0,0,0,0,0]];
				divisor=16.0;
				break;
			  case 5: // Minimized average error, Jarvis, Judice, Ninke
				matrix=[[0,0,0,7.0,5.0],[3.0,5.0,7.0,5.0,3.0],[1.0,3.0,5.0,3.0,1.0]];
				divisor=48.0;
				break;
			  case 6: // Burkes dither
				matrix=[[0.0,0.0,0.0,8.0,4.0],[2.0,4.0,8.0,4.0,2.0],[0.0,0.0,0.0,0.0,0.0]];
				divisor=32.0;
				break;
			  case 7: //Sierra-Lite
			    matrix=[[0,0,0,2.0,0],[0,1.0,1.0,0,0],[0,0,0,0,0]];
				divisor=4.0;
				break;
			  case 8: //Stucki
			    matrix=[[0,0,0,8.0,4.0],[2.0,4.0,8.0,4.0,2.0],[1.0,2.0,4.0,2.0,1.0]];
				divisor=42.0;
				break;
			  case 9: //Atkinson
			    matrix=[[0,0,0,1.0,1.0],[0,1.0,1.0,1.0,0],[0,0,1.0,0,0]];
				divisor=8.0;
				break;
		  }
		  
		  oldpixel = [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]];
          newpixel = find_closest(oldpixel);
          quant_error = [oldpixel[0] - newpixel[0], oldpixel[1] - newpixel[1], oldpixel[2] - newpixel[2]];
          imgData.data[i + 0] = newpixel[0];
          imgData.data[i + 1] = newpixel[1];
          imgData.data[i + 2] = newpixel[2];
          try {
			
			//matrix [0][0...2] should always be zero, and can thus be skipped
			
			if(x+1<canvasSize[0]){ //Make sure to not carryover Error from one side to the other
				a = matrix[0][3]/divisor; 
				imgData.data[i + 4] += (quant_error[0] * a); //1 right
				imgData.data[i + 5] += (quant_error[1] * a);
				imgData.data[i + 6] += (quant_error[2] * a);
				if(x+2<canvasSize[0]){ //Nested, because it only needds to be checked if the first is true
					a = matrix[0][4]/divisor;
					imgData.data[i + 8] += (quant_error[0] * a); //2 right
					imgData.data[i + 9] += (quant_error[1] * a);
					imgData.data[i + 10] += (quant_error[2] * a);
				}
			}
			//First Row below
			
			if (x>0){ //Order reversed, to allow nesting of IF blocks
				a = matrix[1][1]/divisor;
				imgData.data[i + canvasSize[0] * 4 - 4] += (quant_error[0] * a); //1 down, 1 left
				imgData.data[i + canvasSize[0] * 4 - 3] += (quant_error[1] * a);
				imgData.data[i + canvasSize[0] * 4 - 2] += (quant_error[2] * a);
				if (x>1){ //
					a = matrix[1][0]/divisor;
					imgData.data[i + canvasSize[0] * 4 - 8] += (quant_error[0] * a); //1 down, 2 left
					imgData.data[i + canvasSize[0] * 4 - 7] += (quant_error[1] * a);
					imgData.data[i + canvasSize[0] * 4 - 6] += (quant_error[2] * a);
				}
			}
			
			a = matrix[1][2]/divisor;
            imgData.data[i + canvasSize[0] * 4 + 0] += (quant_error[0] * a);//1 down
            imgData.data[i + canvasSize[0] * 4 + 1] += (quant_error[1] * a);
            imgData.data[i + canvasSize[0] * 4 + 2] += (quant_error[2] * a);
			
			if(x+1<canvasSize[0]){
				a = matrix[1][3]/divisor;
				imgData.data[i + canvasSize[0] * 4 + 4] += (quant_error[0] * a);//1 down, 1 right 
				imgData.data[i + canvasSize[0] * 4 + 5] += (quant_error[1] * a);
				imgData.data[i + canvasSize[0] * 4 + 6] += (quant_error[2] * a);
				if(x+2<canvasSize[0]){
					a = matrix[1][4]/divisor;
					imgData.data[i + canvasSize[0] * 4 + 8] += (quant_error[0] * a);//1 down, 2 right 
					imgData.data[i + canvasSize[0] * 4 + 9] += (quant_error[1] * a);
					imgData.data[i + canvasSize[0] * 4 + 10] += (quant_error[2] * a);
				}
			}
			
			//Second row below
			if(x>0){
				a = matrix[2][1]/divisor;
				imgData.data[i + canvasSize[0] * 8 - 4] += (quant_error[0] * a); //2 down, 1 left
				imgData.data[i + canvasSize[0] * 8 - 3] += (quant_error[1] * a);
				imgData.data[i + canvasSize[0] * 8 - 2] += (quant_error[2] * a);
				if(x>1){
					a = matrix[2][0]/divisor;
					imgData.data[i + canvasSize[0] * 8 - 8] += (quant_error[0] * a); //2 down, 2 left
					imgData.data[i + canvasSize[0] * 8 - 7] += (quant_error[1] * a);
					imgData.data[i + canvasSize[0] * 8 - 6] += (quant_error[2] * a);
				}
			}
			
			a = matrix[2][2]/divisor;
            imgData.data[i + canvasSize[0] * 8 + 0] += (quant_error[0] * a);//2 down
            imgData.data[i + canvasSize[0] * 8 + 1] += (quant_error[1] * a);
            imgData.data[i + canvasSize[0] * 8 + 2] += (quant_error[2] * a);
			
			if(x+1<canvasSize[0]){
				a = matrix[2][3]/divisor;
				imgData.data[i + canvasSize[0] * 8 + 4] += (quant_error[0] * a);//2 down, 1 right 
				imgData.data[i + canvasSize[0] * 8 + 5] += (quant_error[1] * a);
				imgData.data[i + canvasSize[0] * 8 + 6] += (quant_error[2] * a);
				if(x+2<canvasSize[0]){
					a = matrix[2][4]/divisor;
					imgData.data[i + canvasSize[0] * 8 + 8] += (quant_error[0] * a);//2 down, 2 right 
					imgData.data[i + canvasSize[0] * 8 + 9] += (quant_error[1] * a);
					imgData.data[i + canvasSize[0] * 8 + 10] += (quant_error[2] * a);
				}
			}
			
          } catch (e) {
            console.error(e);
          }
		  break;
      }
    }
  }
  postMessage(imgData);
}