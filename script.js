// script.js
let model;
let video;
let predictions = [];
let classNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space'];

async function init() {
  try {
    // PERBAIKAN 1: Ganti loadGraphModel dengan loadLayersModel
    model = await tf.loadLayersModel('https://erdt17.github.io/nusasign-final/model/model.json');
    console.log("Model loaded successfully");
    
    // PERBAIKAN 2: Validasi model
    model.summary();
    
    // Setup webcam
    video = document.getElementById('webcam');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.play();
          predict();
        })
        .catch(err => {
          console.error("Error accessing webcam: ", err);
        });
    }
  } catch (err) {
    console.error("Error during initialization: ", err);
  }
}

async function predict() {
  if (!model) return;

  // Capture frame from webcam
  const tensor = tf.browser.fromPixels(video)
    .resizeNearestNeighbor([224, 224]) // Pastikan sesuai ukuran input model
    .toFloat()
    .div(255.0) // Normalisasi [0-255] → [0-1]
    .expandDims();

  // Predict
  const prediction = await model.predict(tensor).data();
  const topPrediction = getTopPrediction(prediction);

  // PERBAIKAN 3: Format output sebagai array objek
  predictions = [{
    className: topPrediction.className,
    probability: topPrediction.probability,
    timestamp: Date.now()
  }];
  
  updatePredictions();
  
  // Cleanup
  tensor.dispose();
  
  // Repeat
  requestAnimationFrame(predict);
}

function getTopPrediction(predictionsArray) {
  let maxIndex = 0;
  let maxValue = predictionsArray[0];
  for (let i = 1; i < predictionsArray.length; i++) {
    if (predictionsArray[i] > maxValue) {
      maxValue = predictionsArray[i];
      maxIndex = i;
    }
  }
  return {
    className: classNames[maxIndex],
    probability: maxValue
  };
}

function updatePredictions() {
  const predictionElement = document.getElementById('prediction');
  
  // PERBAIKAN 4: Pastikan menggunakan struktur array
  if (predictions.length > 0) {
    const latest = predictions[0];
    predictionElement.innerText = 
      `Prediction: ${latest.className} (${Math.round(latest.probability * 100)}%)`;
  }
}

// PERBAIKAN 5: Inisialisasi saat halaman dimuat
window.onload = init;
