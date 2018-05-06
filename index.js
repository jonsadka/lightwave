let img = null;
let video = null;
let canvas = null;
let canvasRGB = null;
let canvasRGBContext = null;
let audioContext = null;
let mediaStreamSource = null;
const defaultRGB = {r: 255, g: 255, b: 255};
let rGBFIFO = new Array(10).fill(defaultRGB);
const multiplier = 1;
const fps = 64 * multiplier * 2;

window.onload = () => {
  // Get the contexts
  audioContext = new(window.AudioContext || window.webkitAudioContext)();
  canvasRGB = document.querySelector('#screenshot-rgb');
  canvasRGBContext = canvasRGB.getContext('2d');
  canvas = document.querySelector('#screenshot-canvas');
  canvasContext = canvas.getContext('2d');
  img = document.querySelector('#screenshot-img');
  video = document.querySelector('#screenshot-video');

  // After giving permission and refreshing the page, some
  // browsers will require user interaction to enable this restart
  // the audio recording
  if (audioContext.state === 'suspended') {
    document.querySelector('#resume-button').style.display = 'inherit';
  }

  const streamOptions = {
    audio: true,
    video: {
      facingMode: "environment"
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
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

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

// https: //developer.mozilla.org/en-US/docs/Web/API/MediaStream
function handleStreamSuccess(mediaStream) {
  //
  //////// VIDEO
  //
  // Older browsers may not have srcObject
  if ("srcObject" in video) {
    video.srcObject = mediaStream;
  } else {
    // Avoid using this in new browsers, as it is going away.
    video.src = window.URL.createObjectURL(mediaStream);
  }

  //
  //////// AUDIO
  //
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);

  setInterval(updateResources, 1000 / fps);
}

function resumeAudio() {
  document.querySelector('#resume-button').style.display = 'none';
  audioContext.resume();
}
