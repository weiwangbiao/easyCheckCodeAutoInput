//init.js
var img;
var WIDTH;
var HEIGHT;

var logArea = document.getElementsByName("UserCheckCode")[0];

var canvas1 = document.createElement("canvas");
//canvas1.style.display = "none";
canvas1.style.backgroundColor = "white";
var ctx1 = canvas1.getContext("2d");

var canvas2 = document.createElement("canvas");
//canvas2.style.display = "none";
canvas2.style.backgroundColor = "blue";
var ctx2 = canvas2.getContext("2d");

var canvas3 = document.createElement("canvas");
//canvas3.style.display = "none";
canvas3.style.backgroundColor = "red";
var ctx3 = canvas3.getContext("2d");

document.getElementsByTagName("body")[0].appendChild(canvas1);
document.getElementsByTagName("body")[0].appendChild(canvas2);
document.getElementsByTagName("body")[0].appendChild(canvas3);

function initAll(){
    img = document.getElementById("img");
    if(!img){
        img = document.getElementsByTagName("img")[0];
    }
    WIDTH = img.clientWidth;
    HEIGHT = img.clientHeight;
    canvas1.width = WIDTH;
    canvas1.height = HEIGHT;
    canvas2.width = WIDTH;
    canvas2.height = HEIGHT;
    canvas3.width = WIDTH;
    canvas3.height = HEIGHT;
}//初始化尺寸

//canvas.js
function toHex(fromImgData){//二值化图像
    var fromPixelData = fromImgData.data;
    var greyAve = 0;
    for(var j=0;j<WIDTH*HEIGHT;j++){
        var r = fromPixelData[4*j];
        var g = fromPixelData[4*j+1];
        var b = fromPixelData[4*j+2];

        greyAve += r*0.3 + g*0.59 + b*0.11;
    }
    greyAve /= WIDTH*HEIGHT;//计算平均灰度值。
    for(j=0;j<WIDTH*HEIGHT;j++){
        r = fromPixelData[4*j];
        g = fromPixelData[4*j+1];
        b = fromPixelData[4*j+2];
        var grey = r*0.333 + g*0.333 + b*0.333;//取平均值。
        if(grey > greyAve)
            grey = 255;
        else
            grey = 0;

        fromPixelData[4*j] = grey;
        fromPixelData[4*j+1] = grey;
        fromPixelData[4*j+2] = grey;
    }
    return fromImgData;
}//二值化图像

function corrode(fromArray){
    for(var j=1;j<fromArray.length-1;j++){
        for(var k=1;k<fromArray[j].length-1;k++){
            if(fromArray[j][k]==1&&fromArray[j-1][k]+fromArray[j+1][k]+fromArray[j][k-1]+fromArray[j][k+1]==0){
                fromArray[j][k] = 0;
            }
        }
    }
    return fromArray;
}//腐蚀（简单）

function expand(fromArray){
    for(var j=1;j<fromArray.length-1;j++){
        for(var k=1;k<fromArray[j].length-1;k++){
            if(fromArray[j][k]==0&&fromArray[j-1][k]+fromArray[j+1][k]+fromArray[j][k-1]+fromArray[j][k+1]==4){
                fromArray[j][k] = 1;
            }
        }
    }
    return fromArray;
}//膨胀（简单）

function split(fromArray,count){
    var numNow = 0;
    var status = false;

    var w = fromArray[0].length;
    for(var k=0;k<w;k++) {//遍历图像
        var sumUp = 0;
        for (var j=0;j<fromArray.length;j++) {//检测整列是否有图像
            sumUp += fromArray[j][k];
        }
        if(sumUp == 0){//切割
            for (j=0;j<fromArray.length-1;j++) {
                fromArray[j] = removeFromArray(fromArray[j],k);
            }
            w --;
            k --;
            status = false;
            continue;
        }
        else{//切换状态
            if(!status){
                numNow ++;
            }
            status = true;
        }
        if(numNow!=count){//不是想要的数字
            for (j=0;j<fromArray.length-1;j++) {
                fromArray[j] = removeFromArray(fromArray[j],k);
            }
            w --;
            k --;
        }
    }
    return fromArray;
}//切割，获取特定数字

function trimUpDown(fromArray){
    var h = fromArray.length;
    for(var j=0;j<h;j++) {
        var sumUp = 0;
        for (var k=0;k<fromArray[j].length-1;k++) {
            sumUp += fromArray[j][k];
        }
        if(sumUp===0){//清除
            fromArray = removeFromArray(fromArray,j);
            h --;
            j --;
        }
    }
    return fromArray;
}//清除上下的空白

function zoomToFit(fromArray){
    var imgD = fromXY(fromArray);
    var w = lastWidth;
    var h = lastHeight;
    var tempc1 = document.createElement("canvas");
    var tempc2 = document.createElement("canvas");
    if(!fromArray[0]){
        window.location.reload();
    }
    tempc1.width = fromArray[0].length;
    tempc1.height = fromArray.length;
    tempc2.width = w;
    tempc2.height = h;
    var tempt1 = tempc1.getContext("2d");
    var tempt2 = tempc2.getContext("2d");
    tempt1.putImageData(imgD,0,0,0,0,tempc1.width,tempc1.height);
    tempt2.drawImage(tempc1,0,0,w,h);
    var returnImageD = tempt2.getImageData(0,0,WIDTH,HEIGHT);
    fromArray = toXY(returnImageD);
    fromArray.length = h;
    for(var i=0;i<h;i++){
        fromArray[i].length = w;
    }
    return fromArray;
}//尺寸归一化

function getCode(fromArray){
    var result = '';
    for(var j=0;j<fromArray.length;j++){
        for(var k=0;k<fromArray[j].length;k++){
            result += (""+fromArray[j][k]);
        }
        result += ";";
    }
    return result;
}//生成特征码


//output.js
function drawThis(toCtx,fromImg){
    toCtx.drawImage(fromImg,0,0,fromImg.width,fromImg.height);
}

function drawArray(toCtx,fromArray){
    var fromImageData = fromXY(fromArray);
    toCtx.putImageData(fromImageData,0,0,0,0,WIDTH,HEIGHT);
}

function logXY(fromArray){
    logArea.innerHTML = '';
    for(var k=0;k<fromArray.length;k++){
        for(var j=0;j<fromArray[k].length;j++){
            var str = '';
            if(fromArray[k][j]===0){
                str = '&nbsp;'
            }
            else if(fromArray[k][j]===1){
                str = '.'
            }
            else if(fromArray[k][j]===-1){
                str = ','
            }
            logArea.innerHTML += str;
        }
        logArea.innerHTML += '<br>';
    }
}

//tools.js
var lastWidth = 20;
var lastHeight = 20;
var numsCount = 4;
var numsArray;

function getData(){
    var code = '';
    code += readNum(numsArray[0]);
    code += readNum(numsArray[1]);
    code += readNum(numsArray[2]);
    code += readNum(numsArray[3]);
    return code;
}//根据特征码识别
function removeFromArray(fromArray,obj){
    for(var i =0;i <fromArray.length;i++){
        var temp = fromArray[i];
        if(!isNaN(obj)){
            temp=i;
        }
        if(temp == obj){
            for(var j = i;j <fromArray.length;j++){
                fromArray[j]=fromArray[j+1];
            }
            fromArray.length = fromArray.length-1;
        }
    }
    return fromArray;
}//移除数组中元素

function toXY(fromImgData){
    var result = new Array(HEIGHT);
    var fromPixelData = fromImgData.data;
    for(var j=0;j<HEIGHT;j++){
        result[j] = new Array(WIDTH);
        for(var k=0;k<WIDTH;k++){
            var r = fromPixelData[4*(j*WIDTH+k)];
            var g = fromPixelData[4*(j*WIDTH+k)+1];
            var b = fromPixelData[4*(j*WIDTH+k)+2];

            result[j][k] = (r+g+b)>500?0:1;//赋值0、1给内部数组
        }
    }
    return result;
}//图像转数组

function fromXY(fromArray){
    var fromImgData = ctx1.createImageData(WIDTH,HEIGHT);
    var fromPixelData = fromImgData.data;
    for(var j=0;j<fromArray.length;j++){
        for(var k=0;k<fromArray[j].length;k++){
            var innergrey = (fromArray[j][k]==1?0:255);
            fromPixelData[4*(j*WIDTH+k)] = innergrey;
            fromPixelData[4*(j*WIDTH+k)+1] = innergrey;
            fromPixelData[4*(j*WIDTH+k)+2] = innergrey;
            fromPixelData[4*(j*WIDTH+k)+3] = 255;
        }
    }
    return fromImgData;
}//数组转图像

function dealWithSingle(fromPixelArray,num){
    var arrayCopy = new Array(fromPixelArray.length);
    for(var i=0;i<fromPixelArray.length;i++){
        arrayCopy[i] = new Array(fromPixelArray[i].length);
        for(var j=0;j<fromPixelArray[i].length;j++){
            arrayCopy[i][j] = fromPixelArray[i][j]+0;
        }
    }
    arrayCopy = split(arrayCopy,num);//切割
    arrayCopy = trimUpDown(arrayCopy);//去上下空白
    drawArray(ctx3,arrayCopy);//画出单一图像
    arrayCopy = zoomToFit(arrayCopy,15,15);
    arrayCopy = corrode(arrayCopy);//腐蚀
    arrayCopy = expand(arrayCopy);//膨胀
    arrayCopy = trimUpDown(arrayCopy);//去上下空白
    drawArray(ctx3,arrayCopy);//画出缩放图像
    var getCode_arrayCopy = getCode(arrayCopy);//生成特征码
    console.log(getCode_arrayCopy);
    return getCode_arrayCopy;
}

function readNum(str){
    var tempSimilar = 0;
    var tempFeature = '';
    var tempNum = 0;
    str = str.split('');
    for(var i=0;i<numkeys.length;i++){
        var thisFeature = numkeys[i][1];
        var thisNum = numkeys[i][0];
        var thisSimilar = 0;
        thisFeature = thisFeature.split('');
        for(var j=0;j<thisFeature.length;j++){
            if(thisFeature[j]==str[j]){
                thisSimilar++;
            }
        }
        if(thisSimilar>tempSimilar){
            tempFeature = thisFeature;
            tempNum = thisNum;
            tempSimilar = thisSimilar;
        }
    }
    return tempNum;
}

//work.js
function dudeImHere() {
    initAll();//初始化
    drawThis(ctx1, img);//画出原图
    var imgData = ctx1.getImageData(0, 0, WIDTH, HEIGHT);//读取图像数据
    imgData = toHex(imgData);//二值化图像数据
    ctx2.putImageData(imgData, 0, 0, 0, 0, WIDTH, HEIGHT);//画出二值化图
    var pixelArray = toXY(imgData);//将图片数据转化为数组
    pixelArray = corrode(pixelArray);//腐蚀
    pixelArray = expand(pixelArray);//膨胀
    numsArray = new Array(numsCount);//分割、处理并保存
    for (var c = 0; c < numsCount; c++) {
        numsArray[c] = dealWithSingle(pixelArray, c + 1);
    }
    try {
        logArea.value = getData();
        //alert(getData());
    }
    catch (e) {
        //window.location.reload();
        alert(e);
    }
}


setTimeout(dudeImHere,1500);
logArea.addEventListener("focus", todo);
function todo(e){
  dudeImHere();
}
