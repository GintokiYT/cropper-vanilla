const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const zoomSlider = document.getElementById("zoomSlider");
const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");
const saveButton = document.getElementById("saveButton");

let img = new Image();
let imageLoaded = false;
let scale = 1;
let posX = 0;
let posY = 0;
let startX = 0;
let startY = 0;
let dragging = false;
let prevScale = 1;

// Crear el fondo de cuadros blanco y negro (simulando transparencia)
function drawBackgroundPattern() {
  const patternSize = 20;
  for (let x = 0; x < canvas.width; x += patternSize) {
    for (let y = 0; y < canvas.height; y += patternSize) {
      ctx.fillStyle =
        (x / patternSize + y / patternSize) % 2 === 0 ? "#eee" : "#ccc";
      ctx.fillRect(x, y, patternSize, patternSize);
    }
  }
}

// Agregar eventos de arrastrar y soltar
dropZone.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZone.classList.add("hover");
});

dropZone.addEventListener("dragleave", function () {
  dropZone.classList.remove("hover");
});

dropZone.addEventListener("drop", function (e) {
  e.preventDefault();
  dropZone.classList.remove("hover");

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    loadImage(file);
  }
});

// Hacer clic para abrir el explorador de archivos
dropZone.addEventListener("click", function () {
  imageInput.click();
});

// Cargar imagen seleccionada desde el input
imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    loadImage(file);
  }
});

// Función para cargar y dibujar la imagen
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      imageLoaded = true;

      // Calcular la escala inicial para ajustar la imagen al tamaño del canvas
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      scale = Math.min(scaleX, scaleY); // Mantener la proporción

      // Centrar la imagen
      posX = (canvas.width - img.width * scale) / 2;
      posY = (canvas.height - img.height * scale) / 2;

      prevScale = scale;
      zoomSlider.value = scale.toFixed(2); // Ajustar el slider
      drawImage();
    };
  };
  reader.readAsDataURL(file);
}

// Función para dibujar la imagen en el canvas
function drawImage() {
  if (imageLoaded) {
    // Dibujar el fondo de cuadros
    drawBackgroundPattern();

    ctx.save();
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
}

// Movimiento con mouse
canvas.addEventListener("mousedown", function (e) {
  startX = e.clientX - posX;
  startY = e.clientY - posY;
  dragging = true;
});

canvas.addEventListener("mousemove", function (e) {
  if (dragging) {
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    drawImage();
  }
});

canvas.addEventListener("mouseup", function () {
  dragging = false;
});

// Desactivar el zoom con la rueda del mouse
canvas.addEventListener("wheel", function (e) {
  e.preventDefault(); // Evita el zoom con el scroll del ratón
});

// Actualizar el zoom con el slider
zoomSlider.addEventListener("input", function () {
  updateZoom(parseFloat(zoomSlider.value));
});

// Zoom con botones (+) y (−)
zoomInButton.addEventListener("click", function () {
  if (scale < 3) {
    scale += 0.1;
    scale = Math.min(scale, 3); // Limitar a un máximo de 3
    updateZoom(scale);
  }
});

zoomOutButton.addEventListener("click", function () {
  if (scale > 0.1) {
    scale -= 0.1;
    scale = Math.max(scale, 0.1); // Limitar a un mínimo de 0.1 (10%)
    updateZoom(scale);
  }
});

// Función para actualizar el zoom en el canvas y hacer zoom desde el centro de la imagen
function updateZoom(newScale) {
  const deltaScale = newScale / prevScale;

  // Calcular el centro actual de la imagen visible
  const centerX = (canvas.width / 2 - posX) / prevScale;
  const centerY = (canvas.height / 2 - posY) / prevScale;

  // Actualizar las posiciones de la imagen para que el zoom sea desde el centro visible
  posX = canvas.width / 2 - centerX * newScale;
  posY = canvas.height / 2 - centerY * newScale;

  prevScale = newScale;
  scale = newScale;
  zoomSlider.value = scale.toFixed(2); // Actualizar el slider
  drawImage();
}

const imagenTest = document.querySelector("#imagenTest");
let savedBlob = null;

// Guardar la imagen recortada/modificada sin el fondo de cuadros
saveButton.addEventListener("click", function () {
  // Crear un canvas temporal del mismo tamaño que el área visible en el canvas principal
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Ajustar el tamaño del canvas temporal para que coincida con el área visible
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  // Calcular las coordenadas correctas para el recorte teniendo en cuenta el desplazamiento y el zoom
  const sourceX = Math.max(0, -posX / scale);
  const sourceY = Math.max(0, -posY / scale);
  const sourceWidth = Math.min(img.width, canvas.width / scale);
  const sourceHeight = Math.min(img.height, canvas.height / scale);

  // Dibujar solo la parte visible en el canvas temporal
  tempCtx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  // Convertir el contenido del canvas temporal a Blob (sin los cuadros)
  tempCanvas.toBlob(function (blob) {
    // Guardar el blob en memoria
    savedBlob = blob;
    console.log("Blob guardado en memoria:", savedBlob);

    // Crear una URL para el blob y mostrarlo en la etiqueta <img>
    const imgURL = URL.createObjectURL(savedBlob);
    imagenTest.src = imgURL;
  }, "image/png");
});
