'use client';

import { useSpeechToText } from './SpeechInput';
import { MicrophoneButton } from './MicrophoneButton';

interface MicButtonProps {
  onTranscript: (text: string) => void;
}

/**
 * Speech-to-text mic button.
 * Sits absolute bottom-right inside a position:relative container.
 */
export function MicButton({ onTranscript }: MicButtonProps) {
  const { state, start, stop } = useSpeechToText({
    onCapture: (data) => onTranscript(data.text),
  });

  const listening = state === 'listening';

  return (
    <div style={{ position: 'absolute', bottom: 6, right: 6 }}>
      <MicrophoneButton
        onClick={listening ? stop : start}
        size="sm"
      />
    </div>
  );
}
