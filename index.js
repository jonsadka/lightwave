let img = null;
let video = null;
let canvas = null;
let canvasRGB = null;
let canvasRGBContext = null;
const defaultRGB = {r: 255, g: 255, b: 255};
let rGBFIFO = new Array(10).fill(defaultRGB);
const multiplier = 1;
const fps = 64 * multiplier * 2;

window.onload = () => {
  // Get the canvas context
  canvasRGB = document.querySelector('#screenshot-rgb');
  canvasRGBContext = canvasRGB.getContext('2d');
  canvas = document.querySelector('#screenshot-canvas');
  canvasContext = canvas.getContext('2d');
  img = document.querySelector('#screenshot-img');
  video = document.querySelector('#screenshot-video');

  const streamOptions = {
    audio: false,
    video: {
      facingMode: "user"
    }
  };

  getStream(streamOptions);
}

function getStream(streamOptions) {
  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = (constraints) => {

      // First get ahold of the legacy getUserMedia, if present
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia(streamOptions)
    .then(handleStreamSuccess)
    .catch(handleStreamError);
}

function handleStreamError(err) {
  console.log(err.name + ": " + err.message);
}

function handleStreamSuccess(stream) {
  // Older browsers may not have srcObject
  if ("srcObject" in video) {
    video.srcObject = stream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    video.src = window.URL.createObjectURL(stream);
  }

  setInterval(updateResources, 1000 / fps);
}
