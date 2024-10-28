const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');

dotenv.config();

const incomingDir = '/incoming';
const transcriptsDir = '/transcripts';
const archiveDir = '/archive';
const supportedExtensions = ['.wav', '.mp3'];
const apiEndpoint = process.env.API_ENDPOINT;

if (!apiEndpoint) {
  console.error("API endpoint not provided. Set the API_ENDPOINT environment variable.");
  process.exit(1);
}

function moveFileSync(source, destination) {
    try {
        // Copy then delete. A direct "rename" caused issues 
        const data = fs.readFileSync(source);
        fs.writeFileSync(destination, data);
        fs.unlinkSync(source);

        console.log('File moved successfully');
    } catch (err) {
        console.error('Error moving file:', err);
    }
}

function processFile(filePath) {
  console.log(`Checking file: ${filePath}`);
  
  const ext = path.extname(filePath).toLowerCase();
  if (!supportedExtensions.includes(ext)) {
    console.log(`Skipped unsupported extension for file: ${filePath}`);
    return;
  }
  
  const transcriptPath = path.join(transcriptsDir, `${path.basename(filePath, ext)}.txt`);

  // Files that already have a transcript are skipped
  // Future idea: Hash file content and save that to compare, not using the transcript filename.
  if (fs.existsSync(transcriptPath)) {
    console.log(`Transcript already exists: ${transcriptPath}`);
    console.log(`Skipping file: ${filePath}`);
    return;
  }
  
  console.log(`Processing file: ${filePath}`);

  const formData = new FormData();
  formData.append('audio_file', fs.createReadStream(filePath));

  const apiUrl = `${apiEndpoint}/asr?encode=true&task=transcribe&language=en&word_timestamps=false&output=txt`;

  axios
    .post(apiUrl, formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      fs.writeFileSync(transcriptPath, response.data);
      console.log(`Transcript written: ${transcriptPath} (${fs.statSync(transcriptPath).size} bytes)`);
      const archivePath = path.join(archiveDir, path.basename(filePath));
      moveFileSync(filePath, archivePath);
      console.log(`File moved to archive: ${archivePath}`);
    })
    .catch((error) => {
      console.error(`Error processing file ${filePath}:`, error);
      // 10 second retry for general errors, 60 for connection errors.
      setTimeout(() => processFile(filePath), error.response ? 10000 : 60000);
    });
}

console.log('Setting up watcher');

const watcher = chokidar.watch(incomingDir,
    {
        persistent: true,
        disableGlobbing: true,
        usePolling: true, // Not ideal but without this, file watching is not consistent
        awaitWriteFinish: {
            stabilityThreshold: 3000,
            pollInterval: 100
        }
    }
);

console.log('Running watcher');

watcher.on('add', filePath => {
  console.log(`File added: ${filePath}`);
  processFile(filePath);
});

