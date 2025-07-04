import { withCtx } from "vue";

export const dataUrlToFile = (
  dataUrl: string,
  filename: string = "file"
): File => {
  const dataArr: any[] = dataUrl.split(",");
  const mime = dataArr[0].match(/:(.*);/)[1];
  const originStr = atob(dataArr[1]);
  let n = originStr.length;
  const u8Arr = new Uint8Array(n);
  while (n--) {
    u8Arr[n] = originStr.charCodeAt(n);
  }
  return new File([u8Arr], filename, { type: mime });
};

export const fileToDataUrl = (file) => {
  return new Promise((reslove, reject) => {
    var reader = new FileReader();
    reader.onload = function (e) {
      // target.result 该属性表示目标对象的DataURL
      reslove(e.target?.result);
    };
    // 传入一个参数对象即可得到基于该参数对象的文本内容
    reader.readAsDataURL(file);
  });
};

export const dataUrlToBlob = (dataUrl) => {
  let arr = dataUrl.split(",");
  let data = window.atob(arr[1]);
  let mime = arr[0].match(/:(.*?);/)[1];
  let ia = new Uint8Array(data.length);
  for (var i = 0; i < data.length; i++) {
    ia[i] = data.charCodeAt(i);
  }
  let blob = new Blob([ia], { type: mime });
  return URL.createObjectURL(blob);
};

export const getPixelRatio = (context) => {
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

// 压缩图片

export const pressImg = (url, width = 720, quality = 1) => {
  return new Promise((reslove, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anymouse";
    img.src = url;
    
    img.onload = () => {
      // console.log(img.width,img.height);
      // / 获得长宽比例
      var scale = img.width / img.height;
      console.log(scale, "scale");
      //创建一个canvas
      var canvas = document.createElement("canvas");
      //获取上下文
      var context = canvas.getContext("2d");
      let ratio = 2;
      //获取压缩后的图片宽度,如果width为-1，默认原图宽度
      const cw = width == -1 ? img.width : width;
      //获取压缩后的图片高度,如果width为-1，默认原图高度
      const ch = width == -1 ? img.height : Math.floor(width / scale);

      console.log(cw,ch);
      
      canvas.style.transform = `scale(0.5,0.5)`;
      canvas.style.transformOrigin = "0 0";
      canvas.style.width = cw + "px";
      canvas.style.height = ch + "px";
      canvas.width = cw * ratio;
      canvas.height = ch * ratio;
      console.log(canvas);
      
      //把图片绘制到canvas上面
      context?.drawImage(img, 0, 0, canvas.width, canvas.height);
      //压缩图片，获取到新的base64Url
      var newImageData = canvas.toDataURL("image/png", quality);
      console.log(newImageData);
      reslove(newImageData);
    };
  });
};

// 压缩图片 通过高度

export const pressImgByHeight = (url, height = 450, quality = 1) => {
  return new Promise((reslove, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anymouse";
    img.src = url;
    img.onload = () => {
      // / 获得长宽比例
      var scale = img.height / img.width;
      console.log(scale);
      //创建一个canvas
      var canvas = document.createElement("canvas");
      //获取上下文
      var context = canvas.getContext("2d");
      let ratio = getPixelRatio(context);
      //获取压缩后的图片宽度,如果width为-1，默认原图宽度
      canvas.width = height == -1 ? img.height : Math.floor(height / scale);
      if (canvas.width < 375) {
      }

      //获取压缩后的图片高度,如果width为-1，默认原图高度
      canvas.height = height == -1 ? img.height : height;
      console.log(canvas.width, canvas.height, "canvas");

      //把图片绘制到canvas上面
      context?.drawImage(img, 0, 0, canvas.width, canvas.height);
      //压缩图片，获取到新的base64Url
      var newImageData = canvas.toDataURL("image/png", quality);
      console.log(newImageData);
      reslove(newImageData);
    };
  });
};

export const getBase64Image = (img) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  const ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
  const dataURL = canvas.toDataURL("image/" + ext);
  return dataURL;
};

// 高斯模糊算法

const gaussBlur = function (imgData, radius) {
  radius *= 3; //不知为什么,我的模糊半径是 css中 filter:bulr 值的三倍时效果才一致。

  //Copy图片内容
  let pixes = new Uint8ClampedArray(imgData.data);
  const width = imgData.width;
  const height = imgData.height;
  let gaussMatrix: number[] = [],
    gaussSum,
    x,
    y,
    r,
    g,
    b,
    a,
    i,
    j,
    k,
    w;

  radius = Math.floor(radius);
  const sigma = radius / 3;

  a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  b = -1 / (2 * sigma * sigma);

  //生成高斯矩阵
  for (i = -radius; i <= radius; i++) {
    gaussMatrix.push(a * Math.exp(b * i * i));
  }

  //x 方向一维高斯运算
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      r = g = b = a = gaussSum = 0;
      for (j = -radius; j <= radius; j++) {
        k = x + j;
        if (k >= 0 && k < width) {
          i = (y * width + k) * 4;
          w = gaussMatrix[j + radius];

          r += pixes[i] * w;
          g += pixes[i + 1] * w;
          b += pixes[i + 2] * w;
          a += pixes[i + 3] * w;

          gaussSum += w;
        }
      }

      i = (y * width + x) * 4;
      //计算加权均值
      imgData.data.set(
        [r, g, b, a].map((v) => v / gaussSum),
        i
      );
    }
  }

  pixes.set(imgData.data);

  //y 方向一维高斯运算
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      r = g = b = a = gaussSum = 0;
      for (j = -radius; j <= radius; j++) {
        k = y + j;

        if (k >= 0 && k < height) {
          i = (k * width + x) * 4;
          w = gaussMatrix[j + radius];

          r += pixes[i] * w;
          g += pixes[i + 1] * w;
          b += pixes[i + 2] * w;
          a += pixes[i + 3] * w;

          gaussSum += w;
        }
      }
      i = (y * width + x) * 4;
      imgData.data.set(
        [r, g, b, a].map((v) => v / gaussSum),
        i
      );
    }
  }

  return imgData;
};

export const getBlurImg = async (url, r = 10, shrink = 1) => {
  return new Promise((resolve, reject) => {
    const IMG: any = new Image();
    IMG.crossOrigin = "Anonymous"; //需要图片跨域支持
    IMG.onload = function () {
      const Canvas: any = document.createElement("CANVAS"); //大量使用可考虑只创建一次
      let w = IMG.width,
        h = IMG.height;
      //缩小比例不为1时 , 重新计算宽高比
      // if (shrink !== 1) {
      //     w = Math.ceil(w / shrink);
      //     h = Math.ceil(h / shrink);
      //     r = Math.ceil(r / shrink);
      // }

      try {
        //设置Canvas宽高,获取上下文
        Canvas.width = w;
        Canvas.height = h;
        let ctx = Canvas.getContext("2d");
        ctx.filter = `blur(${r}px)`;
        ctx.drawImage(IMG, 0, 0, w, h);
        resolve(Canvas.toDataURL());
      } catch (e) {
        reject(e);
      }
    };
    IMG.src = url;
  });
};
