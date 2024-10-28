# Transcriber

Monitors the `/incoming` folder of the container for audio file (.wav and mp3) and then sends them to an API to transcribe. Then it moves the audio file to `/archive` and saves teh trascribed text in `/transcripts`.

This can infinite loop on connection errors, so be warned of that. All is given as is, use at your own risk.

## Requirements

- Docker
- Have the [Whisper ASR Webservice](https://ahmetoner.com/whisper-asr-webservice/) container running and provide the endpoint to this application

## Usage

1. **Build the Docker Image:**

```bash
docker build -t transcriber .
```

2. **Environment Variables:**3

Make sure the Whisper ASR Webservice container is running  and point the env variable to the container.

API_ENDPOINT: The base URL of the API endpoint. Example: http://192.168.1.142:9000

3. **Run the Container:**

```bash
docker run -v /path/to/incoming:/incoming -v /path/to/transcripts:/transcripts -v /path/to/archive:/archive -e API_ENDPOINT="http://127.0.0.1:9000" transcriber
```

Replace /path/to/incoming, /path/to/transcripts, and /path/to/archive with the actual paths where you want to mount the respective directories.

4. **Log Output:**

The application logs details of the file processing steps to stdout and errors to stderr.


## Optional docker compose file

Once the container is built, you can also optionally use the docker compose file which will run the wishper asr service for you and the transcriber in one go.
