let canvas;
let canvas_size = 600;
let gridSize = 30;
let pixel_size = canvas_size / gridSize;
let pixels = [];
let grid = false;
let bg_color = [0, 0, 0];
let draw_color = 255;
let font_size = 1;

function setup() {
  canvas = createCanvas(canvas_size, canvas_size);
  for (let i = 0; i < gridSize; i += 1) {
    for (let j = 0; j < gridSize; j += 1) {
      pixels.push(new Pixel(i * pixel_size, j * pixel_size, bg_color));
    }
  }
  let buttonsArea = createDiv();
  let predictionArea = createDiv();
  let sliderDiv = createDiv();
  buttonsArea.class('buttonsArea');
  predictionArea.class('predictionArea');
  sliderDiv.class('sliderDiv');
  buttonsArea.parent(document.body);
  sliderDiv.parent(document.body);
  predictionArea.parent(document.body);
  buttonsArea.html(
    '<button id="clearButton">Clear</button>' +
    '<button id="predictButton">Predict</button>' +
    '<div class="slidecontainer">' +
    '<input type="range" min="1" max="3" value="1" class="slider" id="font_size_slider">' +
    '<span style="font-weight:bold;"></span>' +
    '</div>'
  );
  predictionArea.html('<h2></h2>');
  let slider = select('#font_size_slider');
  setSliderText(slider.value());
  font_size = slider.value();

  slider.input(function () {
    setSliderText(slider.value());
    font_size = slider.value();
  });
  document.getElementById('clearButton').addEventListener('click', clearCanvas);
  document.getElementById('predictButton').addEventListener('click', predict);
}

function setSliderText(value) {
  let span = select('.slidecontainer span');
  if (value == 1) {
    span.html('Small');
  }
  else if (value == 2) {
    span.html('Medium');
  }
  else {
    span.html('Large');
  }
}
function draw() {
  background(bg_color);
  pixels.forEach(pixel => {
    stroke(draw_color)
    strokeWeight(weight = grid ? 0.1 : 0)
    fill(pixel.color[0], pixel.color[1], pixel.color[2])
    rect(pixel.x, pixel.y, pixel_size, pixel_size);
  })
}
function mouseDragged() {
  sketch();
} function mouseClicked() {
  sketch();
}
function sketch() {
  let pos = { x: mouseX, y: mouseY };
  if (pos.x < 0 || pos.x > canvas_size || pos.y < 0 || pos.y > canvas_size) {
    return;
  }
  let pixelIndexX = Math.floor(pos.x / pixel_size);
  let pixelIndexY = Math.floor(pos.y / pixel_size);
  let totalIndex = (gridSize * pixelIndexX) + pixelIndexY
  let pixel = pixels[totalIndex];
  pixel.color = [draw_color, draw_color, draw_color];
  let outers = getOuterPixels(totalIndex, checkBoundary(pixelIndexX, pixelIndexY));
  adjustColor(outers)
}
function clearCanvas() {
  pixels.forEach(p => p.color = bg_color);
}
function adjustColor(outers) {
  let factor = matrices[[font_size === 1 ? "small" : font_size === 2 ? "med" : "large"]]
  outers.plusPixels.forEach(p => {
    let pix = pixels[p];
    pix.color = pix.color.map(c => Math.min(Math.max(c + factor.values[0], 0), 255));
  });
  outers.diagonalPixels.forEach(p => {
    let pix = pixels[p];
    pix.color = pix.color.map(c => Math.min(Math.max(c + factor.values[1], 0), 255));
  });
}
function checkBoundary(pixelIndexX, pixelIndexY) {
  if (pixelIndexX === 0) {
    if (pixelIndexY === 0) {
      return "top-left";
    } else if (pixelIndexY === gridSize - 1) {
      return "bottom-left";
    } else {
      return "left";
    }
  } else if (pixelIndexX === gridSize - 1) {
    if (pixelIndexY === 0) {
      return "top-right";
    } else if (pixelIndexY === gridSize - 1) {
      return "bottom-right";
    } else {
      return "right";
    }
  } else if (pixelIndexY === 0) {
    return "top";
  } else if (pixelIndexY === gridSize - 1) {
    return "bottom";
  } else {
    return "inside";
  }
}

function getOuterPixels(totalIndex, boundary) {
  switch (boundary) {
    case "top":
      return {
        diagonalPixels: [totalIndex - gridSize + 1, totalIndex + gridSize + 1],
        plusPixels: [totalIndex - gridSize, totalIndex + gridSize, totalIndex + 1]
      };
    case "bottom":
      return {
        diagonalPixels: [totalIndex + gridSize - 1, totalIndex - gridSize - 1],
        plusPixels: [totalIndex - gridSize, totalIndex + gridSize, totalIndex - 1]
      };
    case "left":
      return {
        diagonalPixels: [totalIndex + gridSize - 1, totalIndex + gridSize + 1],
        plusPixels: [totalIndex + 1, totalIndex - 1, totalIndex + gridSize]
      };
    case "right":
      return {
        diagonalPixels: [totalIndex - gridSize - 1, totalIndex - gridSize + 1],
        plusPixels: [totalIndex + 1, totalIndex - 1, totalIndex - gridSize]
      };
    case "top-left":
      return {
        diagonalPixels: [totalIndex + gridSize + 1],
        plusPixels: [totalIndex + 1, totalIndex + gridSize]
      };
    case "top-right":
      return {
        diagonalPixels: [totalIndex - gridSize + 1],
        plusPixels: [totalIndex + 1, totalIndex - gridSize]
      };
    case "bottom-left":
      return {
        diagonalPixels: [totalIndex + gridSize - 1],
        plusPixels: [totalIndex - 1, totalIndex + gridSize]
      };
    case "bottom-right":
      return {
        diagonalPixels: [totalIndex - gridSize - 1],
        plusPixels: [totalIndex - 1, totalIndex - gridSize]
      };
    default:
      return {
        diagonalPixels: [
          totalIndex - gridSize - 1,
          totalIndex - gridSize + 1,
          totalIndex + gridSize - 1,
          totalIndex + gridSize + 1
        ],
        plusPixels: [
          totalIndex - 1,
          totalIndex + 1,
          totalIndex - gridSize,
          totalIndex + gridSize
        ]
      };
  }
}

function predict() {
  // first resize the image to 28x28, then save as base64
  let resizedImage = canvas.elt.toDataURL('image/jpeg');
  let img = new Image();
  img.src = resizedImage;
  img.onload = function () {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 28;
    canvas.height = 28;
    ctx.drawImage(img, 0, 0, 28, 28);
    let resizedImage = canvas.toDataURL('image/jpeg');
    let data = { image: resizedImage };
    console.log(data)
    url4 = "https://digit-recognizer-server.onrender.com/predict_chars";
    fetch(url4, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        animatedPredictionText(data.prediction);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}


function animatedPredictionText(prediction) {
  let predictionText = select('.predictionArea h2');
  let text = "Prediction is " + prediction;
  for (let i = 0; i < text.length; i++) {
    setTimeout(() => {
      predictionText.html(text.slice(0, i + 1));
    }, i * 50);
  }
}