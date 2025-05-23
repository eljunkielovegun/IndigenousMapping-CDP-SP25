import {
  assert,
  isBrowser
} from "./chunk-FD5OM2JI.js";

// node_modules/@loaders.gl/images/dist/lib/utils/version.js
var VERSION = true ? "4.3.2" : "latest";

// node_modules/@loaders.gl/images/dist/lib/category-api/image-type.js
var _a;
var parseImageNode = (_a = globalThis.loaders) == null ? void 0 : _a.parseImageNode;
var IMAGE_SUPPORTED = typeof Image !== "undefined";
var IMAGE_BITMAP_SUPPORTED = typeof ImageBitmap !== "undefined";
var NODE_IMAGE_SUPPORTED = Boolean(parseImageNode);
var DATA_SUPPORTED = isBrowser ? true : NODE_IMAGE_SUPPORTED;
function isImageTypeSupported(type) {
  switch (type) {
    case "auto":
      return IMAGE_BITMAP_SUPPORTED || IMAGE_SUPPORTED || DATA_SUPPORTED;
    case "imagebitmap":
      return IMAGE_BITMAP_SUPPORTED;
    case "image":
      return IMAGE_SUPPORTED;
    case "data":
      return DATA_SUPPORTED;
    default:
      throw new Error(`@loaders.gl/images: image ${type} not supported in this environment`);
  }
}
function getDefaultImageType() {
  if (IMAGE_BITMAP_SUPPORTED) {
    return "imagebitmap";
  }
  if (IMAGE_SUPPORTED) {
    return "image";
  }
  if (DATA_SUPPORTED) {
    return "data";
  }
  throw new Error("Install '@loaders.gl/polyfills' to parse images under Node.js");
}

// node_modules/@loaders.gl/images/dist/lib/category-api/parsed-image-api.js
function isImage(image) {
  return Boolean(getImageTypeOrNull(image));
}
function getImageType(image) {
  const format = getImageTypeOrNull(image);
  if (!format) {
    throw new Error("Not an image");
  }
  return format;
}
function getImageSize(image) {
  return getImageData(image);
}
function getImageData(image) {
  switch (getImageType(image)) {
    case "data":
      return image;
    case "image":
    case "imagebitmap":
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("getImageData");
      }
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height);
    default:
      throw new Error("getImageData");
  }
}
function getImageTypeOrNull(image) {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return "imagebitmap";
  }
  if (typeof Image !== "undefined" && image instanceof Image) {
    return "image";
  }
  if (image && typeof image === "object" && image.data && image.width && image.height) {
    return "data";
  }
  return null;
}

// node_modules/@loaders.gl/images/dist/lib/parsers/svg-utils.js
var SVG_DATA_URL_PATTERN = /^data:image\/svg\+xml/;
var SVG_URL_PATTERN = /\.svg((\?|#).*)?$/;
function isSVG(url) {
  return url && (SVG_DATA_URL_PATTERN.test(url) || SVG_URL_PATTERN.test(url));
}
function getBlobOrSVGDataUrl(arrayBuffer, url) {
  if (isSVG(url)) {
    const textDecoder = new TextDecoder();
    let xmlText = textDecoder.decode(arrayBuffer);
    try {
      if (typeof unescape === "function" && typeof encodeURIComponent === "function") {
        xmlText = unescape(encodeURIComponent(xmlText));
      }
    } catch (error) {
      throw new Error(error.message);
    }
    const src = `data:image/svg+xml;base64,${btoa(xmlText)}`;
    return src;
  }
  return getBlob(arrayBuffer, url);
}
function getBlob(arrayBuffer, url) {
  if (isSVG(url)) {
    throw new Error("SVG cannot be parsed directly to imagebitmap");
  }
  return new Blob([new Uint8Array(arrayBuffer)]);
}

// node_modules/@loaders.gl/images/dist/lib/parsers/parse-to-image.js
async function parseToImage(arrayBuffer, options, url) {
  const blobOrDataUrl = getBlobOrSVGDataUrl(arrayBuffer, url);
  const URL = self.URL || self.webkitURL;
  const objectUrl = typeof blobOrDataUrl !== "string" && URL.createObjectURL(blobOrDataUrl);
  try {
    return await loadToImage(objectUrl || blobOrDataUrl, options);
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
async function loadToImage(url, options) {
  const image = new Image();
  image.src = url;
  if (options.image && options.image.decode && image.decode) {
    await image.decode();
    return image;
  }
  return await new Promise((resolve, reject) => {
    try {
      image.onload = () => resolve(image);
      image.onerror = (error) => {
        const message = error instanceof Error ? error.message : "error";
        reject(new Error(message));
      };
    } catch (error) {
      reject(error);
    }
  });
}

// node_modules/@loaders.gl/images/dist/lib/parsers/parse-to-image-bitmap.js
var EMPTY_OBJECT = {};
var imagebitmapOptionsSupported = true;
async function parseToImageBitmap(arrayBuffer, options, url) {
  let blob;
  if (isSVG(url)) {
    const image = await parseToImage(arrayBuffer, options, url);
    blob = image;
  } else {
    blob = getBlob(arrayBuffer, url);
  }
  const imagebitmapOptions = options && options.imagebitmap;
  return await safeCreateImageBitmap(blob, imagebitmapOptions);
}
async function safeCreateImageBitmap(blob, imagebitmapOptions = null) {
  if (isEmptyObject(imagebitmapOptions) || !imagebitmapOptionsSupported) {
    imagebitmapOptions = null;
  }
  if (imagebitmapOptions) {
    try {
      return await createImageBitmap(blob, imagebitmapOptions);
    } catch (error) {
      console.warn(error);
      imagebitmapOptionsSupported = false;
    }
  }
  return await createImageBitmap(blob);
}
function isEmptyObject(object) {
  for (const key in object || EMPTY_OBJECT) {
    return false;
  }
  return true;
}

// node_modules/@loaders.gl/images/dist/lib/category-api/parse-isobmff-binary.js
function getISOBMFFMediaType(buffer) {
  if (!checkString(buffer, "ftyp", 4)) {
    return null;
  }
  if ((buffer[8] & 96) === 0) {
    return null;
  }
  return decodeMajorBrand(buffer);
}
function decodeMajorBrand(buffer) {
  const brandMajor = getUTF8String(buffer, 8, 12).replace("\0", " ").trim();
  switch (brandMajor) {
    case "avif":
    case "avis":
      return { extension: "avif", mimeType: "image/avif" };
    default:
      return null;
  }
}
function getUTF8String(array, start, end) {
  return String.fromCharCode(...array.slice(start, end));
}
function stringToBytes(string) {
  return [...string].map((character) => character.charCodeAt(0));
}
function checkString(buffer, header, offset = 0) {
  const headerBytes = stringToBytes(header);
  for (let i = 0; i < headerBytes.length; ++i) {
    if (headerBytes[i] !== buffer[i + offset]) {
      return false;
    }
  }
  return true;
}

// node_modules/@loaders.gl/images/dist/lib/category-api/binary-image-api.js
var BIG_ENDIAN = false;
var LITTLE_ENDIAN = true;
function getBinaryImageMetadata(binaryData) {
  const dataView = toDataView(binaryData);
  return getPngMetadata(dataView) || getJpegMetadata(dataView) || getGifMetadata(dataView) || getBmpMetadata(dataView) || getISOBMFFMetadata(dataView);
}
function getISOBMFFMetadata(binaryData) {
  const buffer = new Uint8Array(binaryData instanceof DataView ? binaryData.buffer : binaryData);
  const mediaType = getISOBMFFMediaType(buffer);
  if (!mediaType) {
    return null;
  }
  return {
    mimeType: mediaType.mimeType,
    // TODO - decode width and height
    width: 0,
    height: 0
  };
}
function getPngMetadata(binaryData) {
  const dataView = toDataView(binaryData);
  const isPng = dataView.byteLength >= 24 && dataView.getUint32(0, BIG_ENDIAN) === 2303741511;
  if (!isPng) {
    return null;
  }
  return {
    mimeType: "image/png",
    width: dataView.getUint32(16, BIG_ENDIAN),
    height: dataView.getUint32(20, BIG_ENDIAN)
  };
}
function getGifMetadata(binaryData) {
  const dataView = toDataView(binaryData);
  const isGif = dataView.byteLength >= 10 && dataView.getUint32(0, BIG_ENDIAN) === 1195984440;
  if (!isGif) {
    return null;
  }
  return {
    mimeType: "image/gif",
    width: dataView.getUint16(6, LITTLE_ENDIAN),
    height: dataView.getUint16(8, LITTLE_ENDIAN)
  };
}
function getBmpMetadata(binaryData) {
  const dataView = toDataView(binaryData);
  const isBmp = dataView.byteLength >= 14 && dataView.getUint16(0, BIG_ENDIAN) === 16973 && dataView.getUint32(2, LITTLE_ENDIAN) === dataView.byteLength;
  if (!isBmp) {
    return null;
  }
  return {
    mimeType: "image/bmp",
    width: dataView.getUint32(18, LITTLE_ENDIAN),
    height: dataView.getUint32(22, LITTLE_ENDIAN)
  };
}
function getJpegMetadata(binaryData) {
  const dataView = toDataView(binaryData);
  const isJpeg = dataView.byteLength >= 3 && dataView.getUint16(0, BIG_ENDIAN) === 65496 && dataView.getUint8(2) === 255;
  if (!isJpeg) {
    return null;
  }
  const { tableMarkers, sofMarkers } = getJpegMarkers();
  let i = 2;
  while (i + 9 < dataView.byteLength) {
    const marker = dataView.getUint16(i, BIG_ENDIAN);
    if (sofMarkers.has(marker)) {
      return {
        mimeType: "image/jpeg",
        height: dataView.getUint16(i + 5, BIG_ENDIAN),
        // Number of lines
        width: dataView.getUint16(i + 7, BIG_ENDIAN)
        // Number of pixels per line
      };
    }
    if (!tableMarkers.has(marker)) {
      return null;
    }
    i += 2;
    i += dataView.getUint16(i, BIG_ENDIAN);
  }
  return null;
}
function getJpegMarkers() {
  const tableMarkers = /* @__PURE__ */ new Set([65499, 65476, 65484, 65501, 65534]);
  for (let i = 65504; i < 65520; ++i) {
    tableMarkers.add(i);
  }
  const sofMarkers = /* @__PURE__ */ new Set([
    65472,
    65473,
    65474,
    65475,
    65477,
    65478,
    65479,
    65481,
    65482,
    65483,
    65485,
    65486,
    65487,
    65502
  ]);
  return { tableMarkers, sofMarkers };
}
function toDataView(data) {
  if (data instanceof DataView) {
    return data;
  }
  if (ArrayBuffer.isView(data)) {
    return new DataView(data.buffer);
  }
  if (data instanceof ArrayBuffer) {
    return new DataView(data);
  }
  throw new Error("toDataView");
}

// node_modules/@loaders.gl/images/dist/lib/parsers/parse-to-node-image.js
async function parseToNodeImage(arrayBuffer, options) {
  var _a3;
  const { mimeType } = getBinaryImageMetadata(arrayBuffer) || {};
  const parseImageNode2 = (_a3 = globalThis.loaders) == null ? void 0 : _a3.parseImageNode;
  assert(parseImageNode2);
  return await parseImageNode2(arrayBuffer, mimeType);
}

// node_modules/@loaders.gl/images/dist/lib/parsers/parse-image.js
async function parseImage(arrayBuffer, options, context) {
  options = options || {};
  const imageOptions = options.image || {};
  const imageType = imageOptions.type || "auto";
  const { url } = context || {};
  const loadType = getLoadableImageType(imageType);
  let image;
  switch (loadType) {
    case "imagebitmap":
      image = await parseToImageBitmap(arrayBuffer, options, url);
      break;
    case "image":
      image = await parseToImage(arrayBuffer, options, url);
      break;
    case "data":
      image = await parseToNodeImage(arrayBuffer, options);
      break;
    default:
      assert(false);
  }
  if (imageType === "data") {
    image = getImageData(image);
  }
  return image;
}
function getLoadableImageType(type) {
  switch (type) {
    case "auto":
    case "data":
      return getDefaultImageType();
    default:
      isImageTypeSupported(type);
      return type;
  }
}

// node_modules/@loaders.gl/images/dist/image-loader.js
var EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "svg", "avif"];
var MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
  "image/vnd.microsoft.icon",
  "image/svg+xml"
];
var DEFAULT_IMAGE_LOADER_OPTIONS = {
  image: {
    type: "auto",
    decode: true
    // if format is HTML
  }
  // imagebitmap: {} - passes (platform dependent) parameters to ImageBitmap constructor
};
var ImageLoader = {
  dataType: null,
  batchType: null,
  id: "image",
  module: "images",
  name: "Images",
  version: VERSION,
  mimeTypes: MIME_TYPES,
  extensions: EXTENSIONS,
  parse: parseImage,
  // TODO: byteOffset, byteLength;
  tests: [(arrayBuffer) => Boolean(getBinaryImageMetadata(new DataView(arrayBuffer)))],
  options: DEFAULT_IMAGE_LOADER_OPTIONS
};

// node_modules/@loaders.gl/images/dist/lib/encoders/encode-image.js
var _a2;
var encodeImageNode = (_a2 = globalThis.loaders) == null ? void 0 : _a2.encodeImageNode;
async function encodeImage(image, options) {
  options = options || {};
  options.image = options.image || {};
  return encodeImageNode ? encodeImageNode(image, { type: options.image.mimeType }) : encodeImageInBrowser(image, options);
}
var qualityParamSupported = true;
async function encodeImageInBrowser(image, options) {
  const { mimeType, jpegQuality } = options.image;
  const { width, height } = getImageSize(image);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  drawImageToCanvas(image, canvas);
  const blob = await new Promise((resolve) => {
    if (jpegQuality && qualityParamSupported) {
      try {
        canvas.toBlob(resolve, mimeType, jpegQuality);
        return;
      } catch (error) {
        qualityParamSupported = false;
      }
    }
    canvas.toBlob(resolve, mimeType);
  });
  if (!blob) {
    throw new Error("image encoding failed");
  }
  return await blob.arrayBuffer();
}
function drawImageToCanvas(image, canvas, x = 0, y = 0) {
  if (x === 0 && y === 0 && typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    const context2 = canvas.getContext("bitmaprenderer");
    if (context2) {
      context2.transferFromImageBitmap(image);
      return canvas;
    }
  }
  const context = canvas.getContext("2d");
  if (image.data) {
    const clampedArray = new Uint8ClampedArray(image.data);
    const imageData = new ImageData(clampedArray, image.width, image.height);
    context.putImageData(imageData, 0, 0);
    return canvas;
  }
  context.drawImage(image, 0, 0);
  return canvas;
}

// node_modules/@loaders.gl/images/dist/image-writer.js
var ImageWriter = {
  name: "Images",
  id: "image",
  module: "images",
  version: VERSION,
  extensions: ["jpeg"],
  options: {
    image: {
      mimeType: "image/png",
      jpegQuality: null
    }
  },
  encode: encodeImage
};

// node_modules/@loaders.gl/images/dist/lib/category-api/image-format.js
var MIME_TYPES2 = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/tiff",
  // TODO - what is the correct type for SVG
  "image/svg",
  "image/svg+xml",
  "image/bmp",
  "image/vnd.microsoft.icon"
];
var mimeTypeSupportedPromise = null;
async function getSupportedImageFormats() {
  if (mimeTypeSupportedPromise) {
    return await mimeTypeSupportedPromise;
  }
  const supportedMimeTypes = /* @__PURE__ */ new Set();
  for (const mimeType of MIME_TYPES2) {
    const supported = isBrowser ? await checkBrowserImageFormatSupportAsync(mimeType) : checkNodeImageFormatSupport(mimeType);
    if (supported) {
      supportedMimeTypes.add(mimeType);
    }
  }
  return supportedMimeTypes;
}
var mimeTypeSupportedSync = {};
function isImageFormatSupported(mimeType) {
  if (mimeTypeSupportedSync[mimeType] === void 0) {
    const supported = isBrowser ? checkBrowserImageFormatSupport(mimeType) : checkNodeImageFormatSupport(mimeType);
    mimeTypeSupportedSync[mimeType] = supported;
  }
  return mimeTypeSupportedSync[mimeType];
}
function checkNodeImageFormatSupport(mimeType) {
  var _a3, _b;
  const NODE_FORMAT_SUPPORT = ["image/png", "image/jpeg", "image/gif"];
  const imageFormatsNode = ((_a3 = globalThis.loaders) == null ? void 0 : _a3.imageFormatsNode) || NODE_FORMAT_SUPPORT;
  const parseImageNode2 = (_b = globalThis.loaders) == null ? void 0 : _b.parseImageNode;
  return Boolean(parseImageNode2) && imageFormatsNode.includes(mimeType);
}
function checkBrowserImageFormatSupport(mimeType) {
  switch (mimeType) {
    case "image/avif":
    case "image/webp":
      return testBrowserImageFormatSupport(mimeType);
    default:
      return true;
  }
}
var TEST_IMAGE = {
  "image/avif": "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=",
  // Lossy test image. Support for lossy images doesn't guarantee support for all WebP images.
  "image/webp": "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"
};
async function checkBrowserImageFormatSupportAsync(mimeType) {
  const dataURL = TEST_IMAGE[mimeType];
  return dataURL ? await testBrowserImageFormatSupportAsync(dataURL) : true;
}
function testBrowserImageFormatSupport(mimeType) {
  try {
    const element = document.createElement("canvas");
    const dataURL = element.toDataURL(mimeType);
    return dataURL.indexOf(`data:${mimeType}`) === 0;
  } catch {
    return false;
  }
}
async function testBrowserImageFormatSupportAsync(testImageDataURL) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = testImageDataURL;
    image.onload = () => resolve(image.height > 0);
    image.onerror = () => resolve(false);
  });
}

// node_modules/@loaders.gl/images/dist/index.js
function loadImage() {
  throw new Error("loadImage has moved to @loaders.gl/textures");
}

export {
  isImageTypeSupported,
  getDefaultImageType,
  isImage,
  getImageType,
  getImageSize,
  getImageData,
  getBinaryImageMetadata,
  ImageLoader,
  ImageWriter,
  getSupportedImageFormats,
  isImageFormatSupported,
  loadImage
};
//# sourceMappingURL=chunk-ZWAWRCH2.js.map
