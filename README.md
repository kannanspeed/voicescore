# Voice Score Agent

A web application that allows users to record their voice for speech analysis. The application simulates speech-to-text transcription and provides scores for grammar, fluency, confidence, and pronunciation.

## Features

- Record audio through the browser
- Basic speech analysis (simulation)
- Analysis of speaking skills
- Detailed feedback for improvement

## Installation

1. Clone this repository:
```
git clone https://github.com/yourusername/voice-score-agent.git
cd voice-score-agent
```

2. Install dependencies:
```
npm install
```

3. Start the application:
```
npm start
```

4. Open your browser and navigate to `http://localhost:3002`

## Usage

1. Click "Start Recording" to begin recording your voice
2. Speak clearly into your microphone for up to 30 seconds
3. Click "Stop Recording" when finished
4. Click "Analyze Recording" to process your speech
5. View your transcription and scores for different aspects of your speech
6. Read the feedback to understand how to improve

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Audio Processing: Web Audio API, wavefile
- Speech Recognition: Simulated (for demo purposes)

## Local Implementation

This application uses a simulated speech recognition system for demonstration purposes. In a production environment, you could integrate with:

- Mozilla DeepSpeech - an open-source speech-to-text engine that runs locally
- Vosk - offline speech recognition toolkit that works on devices of any size
- Whisper.cpp - local implementation of OpenAI's Whisper model

All of these options can run locally without API calls or paid subscriptions.

## Future Enhancements

To implement real speech recognition locally:
1. Install one of the above open-source engines
2. Update the `recognizeSpeech` function in server.js to call the local engine
3. Process the audio file with the installed engine

## Limitations

- The current implementation uses simulated speech recognition
- The analysis algorithm is based on basic heuristics and may not be as accurate as professional assessment

## License

This project is licensed under the MIT License. 