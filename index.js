const fs = require("fs").promises;
const sharp = require("sharp");
const https = require("https");
const path = require("path");

// You'll need to sign up at remove.bg to get an API key
const REMOVE_BG_API_KEY = "ESJvKrCHDocWkWgYFJxRdfPA";

async function removeBackground(inputPath, outputPath) {
  try {
    // Read the input image
    const inputBuffer = await fs.readFile(inputPath);

    // Prepare the API request
    const options = {
      hostname: "api.remove.bg",
      path: "/v1.0/removebg",
      method: "POST",
      headers: {
        "X-Api-Key": REMOVE_BG_API_KEY,
        "Content-Type": "application/json",
      },
    };

    // Create a promise to handle the API request
    const removeBackgroundPromise = new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(`Request failed with status code ${res.statusCode}`)
          );
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      });

      req.on("error", reject);

      // Send the image data
      const requestData = JSON.stringify({
        image_file_b64: inputBuffer.toString("base64"),
        size: "regular",
        type: "auto",
      });

      req.write(requestData);
      req.end();
    });

    // Get the processed image
    const processedImageBuffer = await removeBackgroundPromise;

    // Save the processed image
    await fs.writeFile(outputPath, processedImageBuffer);

    console.log("Background removed successfully!");
    return outputPath;
  } catch (error) {
    console.error("Error removing background:", error.message);
    throw error;
  }
}

// Example usage
async function main() {
  const inputPath = "./victim.jpg"; // Replace with your input image path
  const outputPath = "./output-no-bg.png"; // Output will be saved as PNG

  try {
    await removeBackground(inputPath, outputPath);
    console.log(`Processed image saved to: ${outputPath}`);
  } catch (error) {
    console.error("Failed to process image:", error);
  }
}

// Run the script
main();
