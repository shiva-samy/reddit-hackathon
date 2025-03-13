import { Context, Devvit, useState } from '@devvit/public-api';

function getRemainingTime(startTime: number, duration: number): string {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = Math.max(duration - elapsed, 0);
  const seconds = String(remaining % 60).padStart(2, '0');
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export const WordGame: Devvit.CustomPostComponent = (context: Context) => {
  const [letters, setLetters] = useState<(string | null)[]>([]);
  const [clickedLetters, setClickedLetters] = useState<string[]>([]);
  const [formedWords, setFormedWords] = useState<{ word: string; points: number }[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerDuration = 60;

  const buttonSize = '40px';

  // Function to validate words using the API
  const isValidWord = async (word: string): Promise<boolean> => {
    try {
      const response = await fetch('https://word-validator-api.onrender.com/is-valid-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Error validating word:', error);
      return false; // Default to false on error
    }
  };

  // Function to check if a word contains any bad word using the API
  const containsBadWord = async (word: string): Promise<boolean> => {
    try {
      const response = await fetch('https://word-validator-api.onrender.com/contains-bad-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.containsBadWord;
    } catch (error) {
      console.error('Error checking bad word:', error);
      return false; // Default to false on error
    }
  };

  const getRandomItems = (arr: string[], count: number): string[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generateLetters = (): void => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = letters.sort(() => 0.5 - Math.random()).slice(0, 25);
    setLetters(shuffled);
    setStartTime(Date.now());
    setPoints(0);
    setFormedWords([]);
  };

  if (!startTime && letters.length === 0) {
    generateLetters();
  }

  const timer: string = startTime !== null ? getRemainingTime(startTime, timerDuration) : '--:--';
  const tick = (): void => {
    if (startTime && Date.now() - startTime >= timerDuration * 1000) {
      setStartTime(null); // End the game
    }
  };
  context.useInterval(tick, 1000).start();

  const handleLetterClick = (letter: string, index: number): void => {
    setClickedLetters(prev => [...prev, letter]);
    setLetters(prev => {
      const newLetters = [...prev];
      newLetters[index] = null;
      return newLetters;
    });
  };

  const handleSubmitWord = async (): Promise<void> => {
    if (clickedLetters.length > 0) {
      const word = clickedLetters.join('');

      // Check if the word contains any bad word
      const hasBadWord = await containsBadWord(word);
      if (hasBadWord) {
        context.ui.showToast("Invalid word! Contains inappropriate content.");
        handleBackspaceAll(); // Backspace all letters
        return;
      }

      // Single letter handling (A and I)
      if (word.length === 1 && ['A', 'I'].includes(word)) {
        setPoints(prevPoints => prevPoints + 1);
        setFormedWords(prev => [...prev, { word, points: 1 }]);
      } else {
        // Multi-letter word validation
        const valid = await isValidWord(word);
        if (valid) {
          const wordPoints = word.length;
          setPoints(prevPoints => prevPoints + wordPoints);
          setFormedWords(prev => [...prev, { word, points: wordPoints }]);
        } else {
          context.ui.showToast("Invalid word!");
          handleBackspaceAll(); // Backspace all letters
          return;
        }
      }

      setClickedLetters([]);
    }
  };

  const handleBackspace = (): void => {
    if (clickedLetters.length > 0) {
      const lastLetter = clickedLetters[clickedLetters.length - 1];
      setClickedLetters(prev => prev.slice(0, -1));

      setLetters(prev => {
        const firstEmptyIndex = prev.indexOf(null);
        if (firstEmptyIndex !== -1 && lastLetter) {
          const newLetters = [...prev];
          newLetters[firstEmptyIndex] = lastLetter;
          return newLetters;
        }
        return prev;
      });
    }
  };

  const handleBackspaceAll = (): void => {
    if (clickedLetters.length > 0) {
      setLetters(prev => {
        const newLetters = [...prev];
        clickedLetters.forEach(letter => {
          const emptyIndex = newLetters.indexOf(null);
          if (emptyIndex !== -1) {
            newLetters[emptyIndex] = letter;
          }
        });
        return newLetters;
      });
      setClickedLetters([]);
    }
  };

  return (
    <zstack height="100%" width="100%" alignment="center middle">
      <image
        url="bg_blurred.png" // Replace with your actual image URL
        description="main_page"
        imageHeight={256}
        imageWidth={256}
        height="100%"
        width="100%"
        resizeMode="cover"
      />
      <vstack 
        height="100%" 
        width="100%" 
        gap="medium" 
        alignment="center middle" 
        padding="small"
        maxWidth={'500px'}
      >
        {/* Main Content with Left and Right Alignment */}
        <hstack 
          width="100%" 
          gap="medium" 
          alignment="center middle"
        >
          {/* Left Side: Display letters in 5x5 grid */}
          {startTime && (
            <vstack
              gap="small" 
              alignment="center middle" 
            >
              {[...Array(5)].map((_, rowIndex) => (
                <hstack 
                  key={rowIndex.toString()} 
                  gap="small" 
                  alignment="center middle"
                >
                  {letters.slice(rowIndex * 5, rowIndex * 5 + 5).map((letter, index) => (
                    letter ? (
                      <button
                        key={(rowIndex * 5 + index).toString()}
                        appearance="media"
                        height={buttonSize}
                        width={buttonSize}
                        onPress={() => handleLetterClick(letter, rowIndex * 5 + index)}
                      >
                        {letter}
                      </button>
                    ) : (
                      <text
                        key={(rowIndex * 5 + index).toString()}
                        height={buttonSize}
                        width={buttonSize}
                      >
                        {' '}
                      </text>
                    )
                  ))}
                </hstack>
              ))}
            </vstack>
          )}
      
          {/* Right Side: Display current word and buttons */}
          <vstack 
            gap="medium" 
            alignment="center middle"
          >
            {/* Display current word */}
            <hstack 
              gap="large" 
              width="100%" 
              alignment="center middle"
              height="40px"
            >
              <text color="black" size="xlarge">
                {clickedLetters.join('')}
              </text>
            </hstack>
      
            {/* Buttons for actions */}
            {startTime && (
              <hstack gap="medium" alignment="center middle">
                <button 
                  appearance="secondary" 
                  onPress={handleBackspace}
                >
                  Backspace
                </button>
                <button 
                  appearance="primary" 
                  onPress={handleSubmitWord}
                >
                  Submit Word
                </button>
              </hstack>
            )}
          </vstack>
        </hstack>
      
        {/* Timer and Points Display */}
        {startTime && (
          <hstack width="100%" padding="small" alignment="center middle">
            <text color="white" size="medium">
              Time: {timer}
            </text>
            <text color="white" size="medium">
              Points: {points.toString()}
            </text>
          </hstack>
        )}
      
        {/* Display all formed words after the game ends */}
        {startTime === null && (
          <vstack 
            gap="small" 
            alignment="center middle" 
            width="100%" 
            maxHeight="150px" 
          >
            <text color="white" size="xlarge">
              Game Over! You got {points.toString()} points!
            </text>
            {formedWords.length > 0 ? (
              formedWords.map((entry, index) => (
                <text 
                  key={index.toString()} 
                  color="white" 
                  size="large"
                >
                  {entry.word} ({entry.points} points)
                </text>
              ))
            ) : (
              <text color="white" size="large">
                No valid words formed.
              </text>
            )}
          </vstack>
        )}
      </vstack>
    </zstack>
  );
};