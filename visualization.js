function updateResources() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvasContext.drawImage(video, 0, 0);
  // Other browsers will fall back to image/png
  // img.src = canvas.toDataURL('image/webp');

  const averageRGB = getAverageRGB(canvas.width, canvas.height);
  // const rawData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

  updateVisualizationSize();
  updateRGBFIFO(averageRGB);
  renderRectColor(averageRGB);
}

function updateVisualizationSize() {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  canvasRGB.width = windowWidth;
  canvasRGB.height = windowHeight;
  canvasRGBContext.width = windowWidth;
  canvasRGBContext.height = windowHeight;

  const currentFIFOLength = rGBFIFO.length;
  const newFIFOLength = Math.round(windowWidth / 60 * multiplier);
  if (newFIFOLength > currentFIFOLength) {
    for (let i = 0; i < newFIFOLength - currentFIFOLength; i++) {
      rGBFIFO.unshift(rGBFIFO[0]);
    }
  } else if (currentFIFOLength > newFIFOLength) {
    for (let i = 0; i < currentFIFOLength - newFIFOLength; i++) {
      rGBFIFO.shift();
    }
  }
}

function updateRGBFIFO(RGB) {
  rGBFIFO.push(RGB);
  rGBFIFO.shift();
}

function renderRectColor() {
  const width = canvasRGBContext.width;
  const height = canvasRGBContext.height;

  for (let i = 0; i < rGBFIFO.length; i++) {
    // clear the background
    canvasRGBContext.clearRect(i * width / rGBFIFO.length, 0, width / rGBFIFO.length, height);

    // TOOD: Make the height encoded as the loudness
    const RGB = rGBFIFO[i] || {};
    canvasRGBContext.fillStyle = `rgb(${RGB.r},${RGB.g},${RGB.b})`;

    // draw a bar based on the current volume
    canvasRGBContext.fillRect(i * width / rGBFIFO.length, 0, width / rGBFIFO.length, height);
  }
}

function getAverageRGB(width, height) {
  const blockSize = 5; // only visit every 5 pixels
  let count = 0;
  let i = 0;

  let data = [];
  try {
    data = canvasContext.getImageData(0, 0, width, height);
  } catch (e) {
    /* security error, img on diff domain */
    return defaultRGB;
  }

  let RGB = {
    r: 0,
    g: 0,
    b: 0
  };
  while ((i += blockSize * 4) < data.data.length) {
    ++count;
    RGB.r += data.data[i];
    RGB.g += data.data[i + 1];
    RGB.b += data.data[i + 2];
  }

  // ~~ used to floor values
  RGB.r = ~~(RGB.r / count);
  RGB.g = ~~(RGB.g / count);
  RGB.b = ~~(RGB.b / count);

  return RGB;
}
