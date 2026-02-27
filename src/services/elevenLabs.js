// ElevenLabs Text-to-Speech Service with Female Voice
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Single stable female voice for consistent experience
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - British Female (very natural and stable)

class ElevenLabsService {
  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.currentAudio = null;
    this.isPlaying = false;
  }

  async generateSpeech(text) {
    if (!this.apiKey) {
      console.error('ElevenLabs API key not found');
      throw new Error('ElevenLabs API key not found');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    console.log('🔊 ElevenLabs: Generating female voice audio for:', text.substring(0, 50) + '...');
    console.log('🔊 Voice ID:', VOICE_ID);

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2', // Latest model for clearest, most natural speech
          voice_settings: {
            stability: 0.95,        // Maximum stability for consistent voice tune
            similarity_boost: 0.95, // Maximum consistency for identical voice tune
            style: 0.1,            // Minimal variation to maintain stable tone
            use_speaker_boost: true // Enhanced vocal clarity and presence
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔊 ElevenLabs API Error:', response.status, errorData);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const audioBlob = await response.blob();
      console.log('✅ ElevenLabs: Female voice audio generated successfully');
      return audioBlob;
    } catch (error) {
      console.error('❌ ElevenLabs: Error generating speech:', error);
      throw error;
    }
  }

  async speak(text) {
    try {
      // Stop any currently playing audio
      this.stop();

      // Generate audio from ElevenLabs using single voice
      const audioBlob = await this.generateSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      this.currentAudio = new Audio(audioUrl);
      this.isPlaying = true;
      
      return new Promise((resolve, reject) => {
        this.currentAudio.onended = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(error);
        };

        this.currentAudio.play().catch(reject);
      });
    } catch (error) {
      console.error('Error playing ElevenLabs speech:', error);
      this.isPlaying = false;
      throw error;
    }
  }

  // Browser fallback with female voice preference
  async fallbackSpeak(text) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser speech synthesis not supported'));
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and prefer female voices
      const voices = speechSynthesis.getVoices();
      const femaleVoices = voices.filter(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('victoria')
      );
      
      if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[0];
        console.log('🔊 Using browser female voice:', femaleVoices[0].name);
      } else {
        // Use higher pitch for more feminine sound
        utterance.pitch = 1.3;
        console.log('🔊 Using default browser voice with higher pitch for feminine sound');
      }
      
      utterance.rate = 0.8;
      utterance.volume = 1;

      utterance.onend = () => {
        this.isPlaying = false;
        resolve();
      };
      
      utterance.onerror = (error) => {
        this.isPlaying = false;
        reject(error);
      };

      this.isPlaying = true;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    this.isPlaying = false;
  }

  getPlayingState() {
    return this.isPlaying;
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;
