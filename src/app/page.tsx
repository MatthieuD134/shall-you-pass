import StoryGameView from '@/components/story/story-game-view';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-between p-8">
      <StoryGameView />
    </main>
  );
}
