import StoryGrid from '@/components/story/story-grid';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-between p-8">
      <StoryGrid />
    </main>
  );
}
