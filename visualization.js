function updateResources() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvasContext.drawImage(video, 0, 0);
  // Other browsers will fall back to image/png
  // img.src = canvas.toDataURL('image/webp');

  const averageRGB = getAverageRGB(canvas.width, canvas.height);
  // const rawData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

  updateVisualizationSize();
  updateRGBFIFO(averageRGB, meter.volume);
  renderRectColor(averageRGB);
}

function updateVisualizationSize() {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  canvasRGB.width = windowWidth;
  canvasRGB.height = windowHeight;
  canvasRGBVContext.width = windowWidth;
  canvasRGBVContext.height = windowHeight;

  const currentFIFOLength = rGBFIFO.length;
  const newFIFOLength = Math.floor(windowWidth / 60 * multiplier);
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

function updateRGBFIFO(RGB, volume) {
  rGBFIFO.push({
    r: RGB.r,
    g: RGB.g,
    b: RGB.b,
    volume
  });
  rGBFIFO.shift();
}

function renderRectColor() {
  const width = canvasRGBVContext.width;
  const height = canvasRGBVContext.height;

  // clear the background
  canvasRGBVContext.clearRect(0, 0, width, height);
  for (let i = 0; i < rGBFIFO.length; i++) {

    const RGBV = rGBFIFO[i] || {};
    const barWidth = width / rGBFIFO.length;
    const barX = i * barWidth;
    const barY = height / 2;
    const barHeight = height * RGBV.volume * 1.4;
    canvasRGBVContext.fillStyle = `rgb(${RGBV.r},${RGBV.g},${RGBV.b})`;

    // draw top bar based on the current volume
    canvasRGBVContext.fillRect(barX, barY, barWidth, -barHeight);
    // draw bottom bar based on the current volume
    canvasRGBVContext.fillRect(barX, barY, barWidth, barHeight);
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
