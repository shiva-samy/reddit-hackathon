// Router.tsx
import { Context, Devvit, useState } from '@devvit/public-api';
import { WordGame } from './WordGame.js';
import { Game } from './Game.js';

export const Router: Devvit.CustomPostComponent = (context: Context) => {
  const [page, setPage] = useState<'menu' | 'wordgame' | 'game'>('menu');

  // Define the Menu component
  const Menu = (
    <zstack height="100%" width="100%" alignment="center bottom">
      {/* Background Image */}
      <image
        url="bg_blurred.png" // Replace with your actual image URL
        description="main_page"
        imageHeight={256}
        imageWidth={256}
        height="100%"
        width="100%"
        resizeMode="cover"
      />
      <vstack alignment="center middle" height="100%" width="100%">
        {/* Start Game Button */}
        <hstack onPress={() => setPage('wordgame')} alignment="center middle">
          <image
            url="start_game.png" // Replace with your actual image URL
            description="Start Game"
            imageHeight="200px"
            imageWidth="300px"
            resizeMode="fit"
          />
        </hstack>
        {/* Leaderboard Button */}
        <hstack onPress={() => setPage('game')} alignment="center middle">
          <image
            url="Leaderboard.png" // Replace with your actual image URL
            description="Leaderboard"
            imageHeight="200px"
            imageWidth="300px"
            resizeMode="fit"
          />
        </hstack>
      </vstack>
    </zstack>
  );

  // Define the pages
  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    wordgame: <WordGame {...context} />,
    game: <Game {...context} />,
  };

  // Render the current page or fallback to the Menu
  return pages[page] || Menu;
};