import { Router } from './Router.js';
import { Devvit } from '@devvit/public-api';

// Configure Devvit with HTTP enabled
Devvit.configure({
  redditAPI: true,
  http: true, // Enable HTTP requests
});

// Add a menu item to the subreddit menu for creating a new post
Devvit.addMenuItem({
  label: 'Chase-2.7-test',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion, you'll navigate there.");

    try {
      const subreddit = await reddit.getCurrentSubreddit();
      const post = await reddit.submitPost({
        title: 'Chasenphrase',
        subredditName: subreddit.name,
        preview: (
          <vstack height="100%" width="100%" alignment="middle center">
            <text size="large">Loading ...</text>
          </vstack>
        ),
      });
      ui.navigateTo(post);
    } catch (error) {
      console.error('Error submitting post:', error);
      ui.showToast('Failed to submit post. Please try again.');
    }
  },
});

// Register the custom post type
Devvit.addCustomPostType({
  name: 'game',
  height: 'tall',
  render: Router,
});

export default Devvit;