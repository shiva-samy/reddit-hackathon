import { Context, Devvit, useState } from '@devvit/public-api';

export const Game: Devvit.CustomPostComponent = (context: Context) => {
  // State variables
  const [track, setTrack] = useState<'left' | 'center' | 'right'>('center'); // Current track
  const [symbol, setSymbol] = useState<'rock' | 'paper' | 'scissors' | null>(null); // User's chosen symbol
  const [score, setScore] = useState<number>(0); // Total score
  const [gameOver, setGameOver] = useState<boolean>(false); // Game over state
  const [lettersCollected, setLettersCollected] = useState<string[]>([]); // Letters collected by the user
  const [obstacles, setObstacles] = useState<{ letter: string; symbol: 'rock' | 'paper' | 'scissors'; position: number; y: number }[]>([]); // Obstacles
  const [speed, setSpeed] = useState<number>(1); // Speed of obstacles

  // Helper function to determine the result of a collision
  const calculatePoints = (userSymbol: 'rock' | 'paper' | 'scissors', obstacleSymbol: 'rock' | 'paper' | 'scissors'): number => {
    // Winning combinations
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };

    if (!symbol) return 0; // No symbol selected
    if (userSymbol === obstacleSymbol) return 1; // Tie
    if (winConditions[userSymbol] === obstacleSymbol) return 2; // Win
    return 0; // Lose
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
  const handleCollision = (obstacle: { letter: string; symbol: 'rock' | 'paper' | 'scissors'; position: number }) => {
    if (!symbol) return;

    const points = calculatePoints(symbol, obstacle.symbol);
    if (points > 0) {
      setScore(score + points);
      setLettersCollected([...lettersCollected, obstacle.letter]);
      setSymbol(getRandomSymbol(symbol)); // Change user's symbol
    } else {
      setGameOver(true); // End the game
    }
  };

  // Helper function to map obstacle.y to a predefined padding value
  function getPadding(y: number): 'small' | 'medium' | 'large' {
    if (y < 33) return 'small';
    if (y < 66) return 'medium';
    return 'large';
  }

  // Generate new obstacles
  const generateObstacle = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const randomPosition = Math.floor(Math.random() * 3); // Random track (0: left, 1: center, 2: right)
  
    console.log('Generating obstacle:', { randomLetter, randomSymbol, randomPosition });
  
    setObstacles((prev) => [
      ...prev,
      {
        letter: randomLetter,
        symbol: randomSymbol,
        position: randomPosition,
        y: 0, // Start at the top of the screen
      },
    ]);
  };

  // Move obstacles downward
  const moveObstacles = () => {
    setObstacles((prev) =>
      prev.map((obstacle) => ({
        ...obstacle,
        y: obstacle.y + speed, // Move obstacle downward
      })).filter((obstacle) => obstacle.y < 100) // Remove obstacles that go off-screen
    );
  };

  // Check for collisions
  const checkCollisions = () => {
    obstacles.forEach((obstacle) => {
      if (obstacle.position === ['left', 'center', 'right'].indexOf(track) && obstacle.y >= 90) {
        handleCollision(obstacle);
      }
    });
  };

  // Use timers to handle obstacle generation and movement
  context.useInterval(() => {
    generateObstacle(); // Generate a new obstacle every interval
  }, 3000); // Generate an obstacle every 3 seconds

  context.useInterval(() => {
    moveObstacles(); // Move obstacles downward every interval
    checkCollisions(); // Check for collisions after moving obstacles
  }, 100); // Move obstacles every 100ms

  // Increase speed progressively
  context.useInterval(() => {
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

        return (
          <vstack
            key={index.toString()}
            height="100%"
            width="33%"
            alignment="top center"
            padding={getPadding(obstacle.y)} // Map obstacle.y to a predefined padding value
          >
            <text size="large">{obstacle.letter}</text>
            <text size="small">{obstacle.symbol}</text>
          </vstack>
        );
      })}
      </hstack>
    </zstack>
  );
};