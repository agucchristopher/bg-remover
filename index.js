const fs = require("fs").promises;
const sharp = require("sharp");
const https = require("https");
const path = require("path");

async function removeBackground(inputPath, outputPath) {
  const apikey = "ESJvKrCHDocWkWgYFJxRdfPA";
  try {
    const inputBuffer = await fs.readFile(inputPath);
    const options = {
      hostname: "api.remove.bg",
      path: "/v1.0/removebg",
      method: "POST",
      headers: {
        "X-Api-Key": apikey,
        "Content-Type": "application/json",
      },
    };
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
      const requestData = JSON.stringify({
        image_file_b64: inputBuffer.toString("base64"),
        size: "regular",
        type: "auto",
      });

      req.write(requestData);
      req.end();
    });
    const processedImageBuffer = await removeBackgroundPromise;
    await fs.writeFile(outputPath, processedImageBuffer);

    console.log("Background removed successfully!");
    return outputPath;
  } catch (error) {
    console.error("Error removing background:", error.message);
    throw error;
  }
}
async function main() {
  const inputPath = "./victim.jpg";
  const outputPath = "./output-no-bg.png";

  try {
    await removeBackground(inputPath, outputPath);
    console.log(`Processed image saved to: ${outputPath}`);
  } catch (error) {
    console.error("Failed to process image:", error);
  }
}
main();
