const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { spawn, execSync } = require('child_process');

async function analyzePosture(videoUrl, io) {
  console.log('Analyzing video:', videoUrl);

  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Created temp directory at:', tempDir);
  }

  const tempPath = path.join(tempDir, 'input.mp4');
  const writer = fs.createWriteStream(tempPath);

  let response;
  try {
    response = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
    });
  } catch (err) {
    console.error('Failed to download video:', err.message);
    throw new Error('Could not download video from Cloudinary');
  }

  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  console.log('Video downloaded to:', tempPath);

  return new Promise((resolve, reject) => {
    try {
      const requirementsPath = path.join(__dirname, 'python_analyzer/requirements.txt');
      console.log('Installing Python dependencies...');
      execSync(`pip install -r ${requirementsPath}`, { stdio: 'inherit' });
      console.log('Python dependencies installed');
    } catch (installErr) {
      console.error('Failed to install Python packages:', installErr.message);
      throw new Error('Python environment not configured on server');
    }
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'python_analyzer/analyze_video.py'),
      tempPath,
    ]);

    let resultData = '';
    pythonProcess.stdout.on('data', (data) => {
      console.log('Python STDOUT:', data.toString());
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      const errorStr = data.toString();
      console.error(`Python STDERR: ${errorStr}`);
    });

    pythonProcess.on('close', (code) => {
      console.log('Python exited with code:', code);
      console.log('Raw Python output:', resultData);

      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
          console.log('Deleted temporary video file:', tempPath);
        }
      } catch (err) {
        console.error('Failed to delete temp file:', err.message);
      }

      if (code !== 0) {
        return reject(new Error(`Python exited with code ${code}`));
      }

      try {
        const jsonStart = resultData.indexOf('[');
        const jsonEnd = resultData.lastIndexOf(']') + 1;
        const jsonString = resultData.slice(jsonStart, jsonEnd);
        const feedback = JSON.parse(jsonString);

        io.emit('postureFeedback', feedback);

        resolve(feedback);
      } catch (err) {
        console.error('Parsing error:', err.message);
        reject(new Error(`Failed to parse feedback: ${err.message}`));
      }

    });
  });
}

module.exports = { analyzePosture };
