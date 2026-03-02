import React, { useState, useEffect } from 'react';
import elevenLabsService from '../services/elevenLabs';

const SpeakerButton = ({ text, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clean up on unmount and check playback state
  useEffect(() => {
    const interval = setInterval(() => {
      const currentlyPlaying = elevenLabsService.getPlayingState();
      setIsSpeaking(currentlyPlaying);
    }, 500);

    return () => {
      clearInterval(interval);
      elevenLabsService.stop();
    };
  }, []);

  const handleSpeak = async () => {
    // If currently speaking, stop
    if (isSpeaking) {
      elevenLabsService.stop();
      setIsSpeaking(false);
      return;
    }

    // Clear previous error
    setError(null);
    setIsLoading(true);

    try {
      // Try ElevenLabs female voice first
      console.log('🔊 Attempting ElevenLabs female voice...');
      setIsSpeaking(true);
      await elevenLabsService.speak(text);
      console.log('✅ ElevenLabs female voice completed successfully');
    } catch (elevenLabsError) {
      console.warn('❌ ElevenLabs TTS failed, falling back to browser TTS:', elevenLabsError);
      
      // Fallback to browser speech synthesis with female voice
      try {
        setIsSpeaking(true);
        await elevenLabsService.fallbackSpeak(text);
        console.log('✅ Browser fallback voice completed');
      } catch (fallbackError) {
        console.error('❌ All TTS methods failed:', fallbackError);
        setError('Text-to-speech is not available');
        setIsSpeaking(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonIcon = () => {
    // Always show speaker icon, animation handled by CSS
    return '🔊';
  };

  const getButtonTitle = () => {
    if (isLoading) return 'Loading female AI voice...';
    if (error) return `Error: ${error}`;
    if (isSpeaking) return 'Stop reading';
    return 'Read aloud (Female AI Voice)';
  };

  return (
    <button
      className={`speaker-button ${isSpeaking ? 'speaking' : ''} ${isLoading ? 'loading' : ''} ${error ? 'error' : ''} ${className}`}
      onClick={handleSpeak}
      title={getButtonTitle()}
      aria-label={getButtonTitle()}
      disabled={isLoading}
    >
      {getButtonIcon()}
    </button>
  );
};

export default SpeakerButton;