document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const statusIndicator = document.getElementById('status-indicator');
    const timerDisplay = document.getElementById('timer');
    const audioPlayback = document.getElementById('audio-playback');
    const recordedAudio = document.getElementById('recorded-audio');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const transcriptionText = document.getElementById('transcription-text');
    const realtimeTranscription = document.getElementById('realtime-transcription');
    const realtimeText = document.getElementById('realtime-text');
    
    // Score Elements
    const grammarScore = document.getElementById('grammar-score');
    const fluencyScore = document.getElementById('fluency-score');
    const confidenceScore = document.getElementById('confidence-score');
    const pronunciationScore = document.getElementById('pronunciation-score');
    const overallScore = document.getElementById('overall-score');
    const grammarPercentage = document.getElementById('grammar-percentage');
    const fluencyPercentage = document.getElementById('fluency-percentage');
    const confidencePercentage = document.getElementById('confidence-percentage');
    const pronunciationPercentage = document.getElementById('pronunciation-percentage');
    const overallPercentage = document.getElementById('overall-percentage');
    
    // Feedback Elements
    const grammarFeedback = document.getElementById('grammar-feedback');
    const fluencyFeedback = document.getElementById('fluency-feedback');
    const confidenceFeedback = document.getElementById('confidence-feedback');
    const pronunciationFeedback = document.getElementById('pronunciation-feedback');
    const overallFeedback = document.getElementById('overall-feedback');
    
    // Variables
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;
    let startTime;
    let timerInterval;
    let recordingDuration = 30; // 30 seconds max
    let recognition; // Speech recognition object
    let finalTranscript = ''; // Final transcript to submit
    
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasWebSpeechSupport = !!SpeechRecognition;

    // Initialize
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('Media Devices supported');
    } else {
        alert('Your browser does not support audio recording. Please try a different browser.');
        recordBtn.disabled = true;
    }
    
    if (!hasWebSpeechSupport) {
        console.log('Web Speech API not supported');
    }

    // Format time for display (mm:ss)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // Update timer display
    function updateTimer() {
        const currentTime = new Date();
        const elapsedTime = (currentTime - startTime) / 1000;
        const remainingTime = Math.max(0, recordingDuration - elapsedTime);
        
        timerDisplay.textContent = formatTime(remainingTime);
        
        if (remainingTime <= 0) {
            stopRecording();
        }
    }
    
    // Initialize speech recognition
    function initSpeechRecognition() {
        if (!hasWebSpeechSupport) return null;
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Set language to English
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Display real-time transcription
            realtimeText.innerHTML = finalTranscript + 
                '<span style="color: #999;">' + interimTranscript + '</span>';
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
        
        return recognition;
    }

    // Start recording function
    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                finalTranscript = '';
                
                // Show real-time transcription
                realtimeTranscription.classList.remove('hidden');
                realtimeText.textContent = 'Speak into your microphone...';
                
                // Start speech recognition if supported
                if (hasWebSpeechSupport) {
                    recognition = initSpeechRecognition();
                    if (recognition) {
                        recognition.start();
                        console.log('Speech recognition started');
                    }
                }
                
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                    
                    // Use webm format which is more widely supported
                    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    recordedAudio.src = audioUrl;
                    
                    audioPlayback.classList.remove('hidden');
                    statusIndicator.textContent = 'Recording completed';
                    
                    // Stop speech recognition
                    if (recognition) {
                        recognition.stop();
                        console.log('Speech recognition stopped');
                    }
                };
                
                mediaRecorder.start();
                startTime = new Date();
                timerInterval = setInterval(updateTimer, 100);
                
                recordBtn.disabled = true;
                stopBtn.disabled = false;
                recordBtn.classList.add('recording');
                statusIndicator.textContent = 'Recording...';
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                alert('Unable to access the microphone. Please allow microphone access and try again.');
            });
    }

    // Stop recording function
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            clearInterval(timerInterval);
            
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            recordBtn.classList.remove('recording');
        }
    }

    // Submit recording for analysis
    function submitRecording() {
        if (!audioBlob) {
            alert('Please record audio first.');
            return;
        }
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        // If we have a transcript from real-time recognition, include it
        if (finalTranscript && finalTranscript.trim().length > 0) {
            formData.append('transcript', finalTranscript.trim());
        }
        
        audioPlayback.classList.add('hidden');
        realtimeTranscription.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        document.querySelector('#loading p').textContent = 'Transcribing your speech...';
        
        // Send to server for analysis
        fetch('/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.querySelector('#loading p').textContent = 'Analyzing results...';
            setTimeout(() => {
                displayResults(data);
            }, 1000); // Brief delay to show the analyzing message
        })
        .catch(error => {
            console.error('Error analyzing audio:', error);
            alert('There was an error analyzing your recording. Please try again.');
            loadingSection.classList.add('hidden');
            audioPlayback.classList.remove('hidden');
        });
    }

    // Display analysis results
    function displayResults(results) {
        loadingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Display transcription
        transcriptionText.textContent = results.transcription || "No transcription available";
        
        // Animate score bars
        grammarScore.style.width = `${results.grammar}%`;
        fluencyScore.style.width = `${results.fluency}%`;
        confidenceScore.style.width = `${results.confidence}%`;
        pronunciationScore.style.width = `${results.pronunciation}%`;
        overallScore.style.width = `${results.overall}%`;
        
        // Update percentage text
        grammarPercentage.textContent = `${results.grammar}%`;
        fluencyPercentage.textContent = `${results.fluency}%`;
        confidencePercentage.textContent = `${results.confidence}%`;
        pronunciationPercentage.textContent = `${results.pronunciation}%`;
        overallPercentage.textContent = `${results.overall}%`;
        
        // Update feedback
        grammarFeedback.textContent = results.feedback.grammar;
        fluencyFeedback.textContent = results.feedback.fluency;
        confidenceFeedback.textContent = results.feedback.confidence;
        pronunciationFeedback.textContent = results.feedback.pronunciation;
        overallFeedback.textContent = results.feedback.overall;
    }

    // Reset the app
    function resetApp() {
        audioPlayback.classList.add('hidden');
        resultsSection.classList.add('hidden');
        loadingSection.classList.add('hidden');
        realtimeTranscription.classList.add('hidden');
        
        statusIndicator.textContent = 'Ready to record';
        timerDisplay.textContent = '00:00';
        
        // Reset score bars
        grammarScore.style.width = '0';
        fluencyScore.style.width = '0';
        confidenceScore.style.width = '0';
        pronunciationScore.style.width = '0';
        overallScore.style.width = '0';
        
        // Reset feedback
        grammarFeedback.textContent = '';
        fluencyFeedback.textContent = '';
        confidenceFeedback.textContent = '';
        pronunciationFeedback.textContent = '';
        overallFeedback.textContent = '';
        
        // Reset transcription
        transcriptionText.textContent = '';
        realtimeText.textContent = 'Speak into your microphone...';
        
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }

    // Event Listeners
    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    submitBtn.addEventListener('click', submitRecording);
    resetBtn.addEventListener('click', resetApp);
}); 