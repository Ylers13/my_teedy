console.log('Image editor initialized');

// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Drawing state
let isDrawing = false;
let lastX = 0, lastY = 0;

// Path storage
const paths = [];
let currentPath = [];

// Text elements
const texts = [];
let selectedText = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Rotation control
let rotationAngle = 0;
const rotationStep = Math.PI / 12; // 15 degrees
const rotationDisplay = document.createElement('div');

// Initialize rotation display
function initRotationDisplay() {
  rotationDisplay.style.position = 'fixed';
  rotationDisplay.style.right = '10px';
  rotationDisplay.style.bottom = '10px';
  rotationDisplay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  rotationDisplay.style.color = 'white';
  rotationDisplay.style.padding = '5px 10px';
  rotationDisplay.style.borderRadius = '3px';
  rotationDisplay.style.fontFamily = 'Arial, sans-serif';
  document.body.appendChild(rotationDisplay);
  updateRotationDisplay();
}

// Update rotation display
function updateRotationDisplay() {
  let degrees = (rotationAngle * 180 / Math.PI) % 360;
  degrees = (degrees + 360) % 360; // Normalize
  if (360 - degrees < 0.0001) degrees = 0; // Fix floating point precision
  rotationDisplay.textContent = `Rotation: ${degrees.toFixed(1)}°`;
}

// Get file ID from URL
const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get('fileId');

if (!fileId) {
  throw new Error('fileId is required');
}

// Load image
const img = new Image();
img.crossOrigin = 'Anonymous';
img.src = `../../../api/file/${fileId}/data`;

img.onload = function() {
  canvas.width = img.width;
  canvas.height = img.height;
  initRotationDisplay();
  redraw();
};

img.onerror = function() {
  alert('Image load failed');
};

// Check if not rotated
function isNotRotated() {
  const degrees = parseFloat((rotationAngle * 180 / Math.PI).toFixed(1));
  const normalized = (degrees % 360 + 360) % 360;
  return Math.abs(normalized) < 0.1 || Math.abs(normalized - 360) < 0.1;
}

// Convert coordinates accounting for rotation
function getCorrectCanvasCoordinates(x, y) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const relX = x - centerX;
  const relY = y - centerY;

  const cos = Math.cos(-rotationAngle);
  const sin = Math.sin(-rotationAngle);
  return {
    x: (relX * cos - relY * sin) + centerX,
    y: (relX * sin + relY * cos) + centerY
  };
}

// Drawing event handlers
canvas.addEventListener('mousedown', function(e) {
  if (isNotRotated()) {
    const rect = canvas.getBoundingClientRect();
    const {x, y} = getCorrectCanvasCoordinates(e.clientX - rect.left, e.clientY - rect.top);

    // Check text click
    for (let i = texts.length - 1; i >= 0; i--) {
      const textObj = texts[i];
      ctx.font = `${textObj.fontSize}px ${textObj.fontFamily}`;
      const metrics = ctx.measureText(textObj.text);
      const height = textObj.fontSize;

      if (isPointInText(x, y, textObj, metrics, height)) {
        selectedText = textObj;
        dragOffsetX = x - textObj.x;
        dragOffsetY = y - textObj.y;
        return;
      }
    }

    // Start drawing
    isDrawing = true;
    lastX = x;
    lastY = y;
    currentPath = [{x, y}];

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.restore();
  }
});

canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  const {x, y} = getCorrectCanvasCoordinates(e.clientX - rect.left, e.clientY - rect.top);

  if (selectedText && isNotRotated()) {
    selectedText.x = x - dragOffsetX;
    selectedText.y = y - dragOffsetY;
    redraw();
  } else if (isDrawing && isNotRotated()) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    currentPath.push({x, y});
    lastX = x;
    lastY = y;
  }
});

function endDrawing() {
  if (isDrawing && currentPath.length > 0) {
    paths.push(currentPath);
  }
  isDrawing = false;
  selectedText = null;
}

canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseout', endDrawing);

// Rotation controls
document.getElementById('rotate-left-button').onclick = function() {
  rotationAngle -= rotationStep;
  updateRotationDisplay();
  redraw();
};

document.getElementById('rotate-right-button').onclick = function() {
  rotationAngle += rotationStep;
  updateRotationDisplay();
  redraw();
};

// Redraw canvas
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Apply rotation
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotationAngle);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Draw image
  if (img.complete) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // Draw paths
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  paths.forEach(path => {
    if (path.length > 0) {
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
    }
  });
  ctx.stroke();

  // Draw current path
  if (isDrawing && currentPath.length > 0) {
    ctx.beginPath();
    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    ctx.stroke();
  }

  // Draw text
  texts.forEach(textObj => {
    ctx.font = `${textObj.fontSize}px ${textObj.fontFamily}`;
    ctx.fillStyle = textObj.color;
    ctx.fillText(textObj.text, textObj.x, textObj.y);
  });

  ctx.restore();
}

// Check if point is inside text
function isPointInText(x, y, textObj, metrics, height) {
  const textBox = {
    x: textObj.x,
    y: textObj.y - height,
    width: metrics.width,
    height: height
  };
  return x >= textBox.x && x <= textBox.x + textBox.width &&
         y >= textBox.y && y <= textBox.y + textBox.height;
}

// Button functions
document.getElementById('add-text-button').onclick = function() {
  const text = prompt('Enter text:');
  if (text) {
    texts.push({
      text: text,
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize: 30,
      fontFamily: 'Arial',
      color: 'red'
    });
    redraw();
  }
};

document.getElementById('save-button').onclick = function() {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `edited-${fileId || 'image'}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

document.getElementById('cancel-button').onclick = function() {
  if (confirm('Discard all changes?')) {
    window.history.back();
  }
};

document.getElementById('reset-button').onclick = function() {
  if (confirm('Reset all changes?')) {
    texts.length = 0;
    paths.length = 0;
    rotationAngle = 0;
    updateRotationDisplay();
    redraw();
  }
};