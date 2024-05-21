//nav
const body = document.querySelector("body"),
  nav = document.querySelector("nav"),
  modeToggle = document.querySelector(".dark-light"),
  searchToggle = document.querySelector(".searchToggle"),
  sidebarOpen = document.querySelector(".sidebarOpen"),
  siderbarClose = document.querySelector(".siderbarClose");

let getMode = localStorage.getItem("mode");
if (getMode && getMode === "dark-mode") {
  body.classList.add("dark");
}

modeToggle.addEventListener("click", () => {
  modeToggle.classList.toggle("active");
  body.classList.toggle("dark");

  if (!body.classList.contains("dark")) {
    localStorage.setItem("mode", "light-mode");
  } else {
    localStorage.setItem("mode", "dark-mode");
  }
});

// js code to toggle search box
searchToggle.addEventListener("click", () => {
  searchToggle.classList.toggle("active");
});

//   js code to toggle sidebar
sidebarOpen.addEventListener("click", () => {
  nav.classList.add("active");
});

body.addEventListener("click", (e) => {
  let clickedElm = e.target;

  if (
    !clickedElm.classList.contains("sidebarOpen") &&
    !clickedElm.classList.contains("menu")
  ) {
    nav.classList.remove("active");
  }
});

//body
document
  .getElementById("applyWatermark")
  .addEventListener("click", function () {
    const fileInput = document.getElementById("upload");
    const watermarkText = document.getElementById("watermarkText").value;
    const binaryWatermark = textToBinary(watermarkText);
    localStorage.setItem("watermarkLength", binaryWatermark.length.toString()); // Simpan panjang watermark
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    if (fileInput.files.length === 0) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const maxWidth = 500;
        const maxHeight = 350;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Encode watermark text into the image data
        for (let i = 0; i < binaryWatermark.length; i++) {
          data[i * 4] = (data[i * 4] & 254) | parseInt(binaryWatermark[i], 2);
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.style.display = "block";

        // Create download link
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.download = "watermarked_image.png";

        // Ensure download link is only visible and clickable in the watermark section
        if (
          document.getElementById("watermarkSection").style.display !== "none"
        ) {
          downloadLink.style.display = "none"; // Make sure the link is visible
          downloadLink.click();
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  });

document
  .getElementById("extractWatermark")
  .addEventListener("click", function () {
    document.querySelector(".container").style.marginTop = "180px";
    const fileInput = document.getElementById("uploadExtract");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    if (fileInput.files.length === 0) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let binaryWatermark = "";
        let watermarkLength =
          parseInt(localStorage.getItem("watermarkLength"), 10) || 256; // Gunakan panjang yang sama saat ekstraksi
        for (let i = 0; i < watermarkLength; i++) {
          binaryWatermark += (data[i * 4] & 1).toString();
        }
        const extractedText = binaryToText(binaryWatermark);
        document.getElementById("extractedText").textContent = extractedText;
        canvas.style.display = "block";
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  });

document.getElementById("toggleSection").addEventListener("click", function () {
  const watermarkSection = document.getElementById("watermarkSection");
  const extractSection = document.getElementById("extractSection");
  const toggleButton = document.getElementById("toggleSection");
  const downloadLink = document.getElementById("downloadLink"); // Dapatkan referensi ke tombol download

  downloadLink.style.display = "none"; // Pastikan link download selalu tersembunyi

  if (watermarkSection.style.display === "none") {
    watermarkSection.style.display = "block";
    extractSection.style.display = "none";
    toggleButton.textContent = "Switch to Extract Watermark";
  } else {
    watermarkSection.style.display = "none";
    extractSection.style.display = "block";
    toggleButton.textContent = "Switch to Apply Watermark";
  }

  // Hide canvas and extracted text when switching sections
  document.getElementById("canvas").style.display = "none";
  document.getElementById("extractedText").textContent = "";
});

function textToBinary(text) {
  return text
    .split("")
    .map((char) => {
      return char.charCodeAt(0).toString(2).padStart(8, "0");
    })
    .join("");
}

function binaryToText(binary) {
  let text = "";
  for (let i = 0; i < binary.length; i += 8) {
    const charCode = parseInt(binary.slice(i, i + 8), 2);
    if (charCode > 0 && charCode < 128) {
      // ASCII valid range
      text += String.fromCharCode(charCode);
    }
  }
  return text;
}

function cleanInput(input) {
  // Menggunakan regex untuk menghapus karakter non-ASCII dan non-printable
  return input.replace(/[^ -~]+/g, "");
}

document.getElementById("inputField").addEventListener("input", function () {
  const originalInput = this.value;
  const cleanedInput = cleanInput(originalInput);
  this.value = cleanedInput;
});
