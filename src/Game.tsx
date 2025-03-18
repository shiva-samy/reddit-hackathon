import { Devvit, useState, useInterval } from '@devvit/public-api';

export const Game: Devvit.CustomPostComponent = () => {
  // State variables
  const [track, setTrack] = useState<'left' | 'center' | 'right'>('center'); // Current track
  const [symbol, setSymbol] = useState<'rock' | 'paper' | 'scissors' | null>(null); // User's chosen symbol
  const [score, setScore] = useState<number>(0); // Total score
  const [gameOver, setGameOver] = useState<boolean>(false); // Game over state
  const [lettersCollected, setLettersCollected] = useState<string[]>([]); // Letters collected by the user
  const [lives, setLives] = useState<number>(3); // Lives remaining
  const [obstacles, setObstacles] = useState<
    { letter: string; symbol: 'rock' | 'paper' | 'scissors'; x: number; y: number; targetTrack: number }[]
  >([]); // Obstacles
  const [speed, setSpeed] = useState<number>(1); // Speed of obstacles

  // Helper function to determine the result of a collision
  const calculatePoints = (userSymbol: 'rock' | 'paper' | 'scissors', obstacleSymbol: 'rock' | 'paper' | 'scissors'): number => {
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };

    if (!symbol) return 0; // No symbol selected
    if (userSymbol === obstacleSymbol) return 1; // Tie
    if (winConditions[userSymbol] === obstacleSymbol) return 2; // Win
    return -1; // Lose
  };

  // Handle track change
  const handleTrackChange = (newTrack: 'left' | 'center' | 'right') => {
    setTrack(newTrack);
  };

  // Handle symbol selection
  const handleSymbolSelection = (selectedSymbol: 'rock' | 'paper' | 'scissors') => {
    setSymbol(selectedSymbol);
  };

  // Generate a random symbol (excluding the current symbol)
  const getRandomSymbol = (currentSymbol: 'rock' | 'paper' | 'scissors'): 'rock' | 'paper' | 'scissors' => {
    const symbols: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const filteredSymbols = symbols.filter((s) => s !== currentSymbol);
    return filteredSymbols[Math.floor(Math.random() * filteredSymbols.length)];
  };

  // Handle collision
  const handleCollision = (obstacle: { letter: string; symbol: 'rock' | 'paper' | 'scissors'; x: number; y: number; targetTrack: number }) => {
    if (!symbol) return;

    const points = calculatePoints(symbol, obstacle.symbol);
    if (points > 0) {
      setScore(score + points);
      setLettersCollected([...lettersCollected, obstacle.letter]);
      setSymbol(getRandomSymbol(symbol)); // Change user's symbol
    } else if (points === -1) {
      setLives(lives - 1); // Lose a life
      if (lives - 1 === 0) {
        setGameOver(true); // End the game
      }
    }
  };

  // Generate new obstacles
  const generateObstacle = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const randomTargetTrack = Math.floor(Math.random() * 3); // Random target track (0: left, 1: center, 2: right)

    console.log('Generating obstacle:', { randomLetter, randomSymbol, randomTargetTrack });

    setObstacles((prev) => [
      ...prev,
      {
        letter: randomLetter,
        symbol: randomSymbol,
        x: 50, // Start at the center horizontally
        y: 0, // Start at the top vertically
        targetTrack: randomTargetTrack, // Target track (0: left, 1: center, 2: right)
      },
    ]);
  };

  // Move obstacles downward and toward their target track
  const moveObstacles = () => {
    setObstacles((prev) =>
      prev
        .map((obstacle) => {
          const targetX = (obstacle.targetTrack * 33.33 + 16.67); // Calculate target X position (center of the track)
          const deltaX = (targetX - obstacle.x) * 0.1; // Gradually move toward the target track
          return {
            ...obstacle,
            x: obstacle.x + deltaX, // Move horizontally
            y: obstacle.y + speed, // Move vertically
          };
        })
        .filter((obstacle) => obstacle.y < 100) // Remove obstacles that go off-screen
    );
  };

  // Check for collisions and missed obstacles
  const checkCollisions = () => {
    setObstacles((prev) => {
      return prev.filter((obstacle) => {
        if (obstacle.targetTrack === ['left', 'center', 'right'].indexOf(track) && obstacle.y >= 90) {
          handleCollision(obstacle);
          return false; // Remove the obstacle after handling collision
        }
        if (obstacle.y >= 100) {
          setLives(lives - 1); // Lose a life for missed obstacles
          if (lives - 1 === 0) {
            setGameOver(true); // End the game
          }
          return false; // Remove the obstacle if it goes off-screen
        }
        return true; // Keep the obstacle if no collision or miss
      });
    });
  };

  // Use timers to handle obstacle generation and movement
  useInterval(() => {
    generateObstacle(); // Generate a new obstacle every interval
  }, 3000); // Generate an obstacle every 3 seconds

  useInterval(() => {
    moveObstacles(); // Move obstacles downward every interval
    checkCollisions(); // Check for collisions after moving obstacles
  }, 100); // Move obstacles every 100ms

  // Increase speed progressively
  useInterval(() => {
    setSpeed((prevSpeed) => prevSpeed + 0.1); // Gradually increase speed
  }, 10000); // Increase speed every 10 seconds

  // Game initialization screen
  if (!symbol) {
    return (
      <vstack height="100%" width="100%" alignment="center middle" gap="medium">
        <text size="large">Choose your symbol:</text>
        <hstack gap="medium">
          <button appearance="secondary" onPress={() => handleSymbolSelection('rock')}>
            Rock
          </button>
          <button appearance="secondary" onPress={() => handleSymbolSelection('paper')}>
            Paper
          </button>
          <button appearance="secondary" onPress={() => handleSymbolSelection('scissors')}>
            Scissors
          </button>
        </hstack>
      </vstack>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <vstack height="100%" width="100%" alignment="center middle" gap="medium">
        <text size="large">Game Over!</text>
        <text size="medium">Total Score: {score}</text>
        <text size="medium">Letters Collected: {lettersCollected.join(', ')}</text>
      </vstack>
    );
  }

  // Main game screen
  return (
    <zstack height="100%" width="100%" alignment="center bottom">
      {/* Background Image */}
      <image
        url="road.gif"
        description="main_page"
        imageHeight={256}
        imageWidth={256}
        height="100%"
        width="100%"
        resizeMode="cover"
      />

      {/* Tracks */}
      <hstack height="100%" width="100%" alignment="bottom center" gap="small">
        {[...Array(3)].map((_, index) => {
          const trackPosition = ['left', 'center', 'right'][index];
          return (
            <vstack
              key={trackPosition}
              height="100%"
              width="33%"
              alignment="bottom center"
              onPress={() => handleTrackChange(trackPosition as 'left' | 'center' | 'right')}
            >
              {trackPosition === track && (
                <>
                  {/* Character */}
                  <image
                    url="dragon.gif"
                    description="character"
                    imageHeight={256} // Adjust size
                    imageWidth={256} // Adjust size
                    resizeMode="fit"
                  />
                  {/* Symbol above the character */}
                  <text size="medium">{symbol}</text>
                </>
              )}
            </vstack>
          );
        })}
      </hstack>

      {/* Obstacles */}
      <hstack height="100%" width="100%" alignment="center top" gap="small">
        {obstacles.map((obstacle, index) => {
          console.log('Rendering obstacle:', obstacle);

          // Map x position to alignment
          const horizontalAlignment = obstacle.x < 33 ? 'start' : obstacle.x > 66 ? 'end' : 'center';

          // Map y position to predefined padding classes
          const verticalPaddingClass =
            obstacle.y < 25
              ? 'py-xs'
              : obstacle.y < 50
              ? 'py-sm'
              : obstacle.y < 75
              ? 'py-md'
              : 'py-lg';

          return (
            <vstack
              key={index.toString()}
              height="100%"
              width="33%"
              alignment={`${horizontalAlignment} top`}
              padding='small'
            >
              <text size="large">{obstacle.letter}</text>
              <text size="small">{obstacle.symbol}</text>
            </vstack>
          );
        })}
      </hstack>

      {/* Lives Display */}
      <hstack height="10%" width="100%" alignment="top center" gap="small">
        <text size="medium">Lives: {lives}</text>
      </hstack>
    </zstack>
  );
};