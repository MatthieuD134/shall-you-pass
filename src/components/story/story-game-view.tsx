import prisma from '@/lib/prisma';
import StoryGrid from './story-grid';
import AnswerForm from './answer-form';

export default async function StoryGameView({ storyId }: { storyId: string }) {
  const story = await prisma.story.findFirst({
    where: {
      id: storyId,
    },
    include: {
      startingNode: {
        include: {
          variants: true,
        },
      },
    },
  });

  return (
    <div className="flex w-full flex-col justify-between gap-32">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8">
        {story?.startingNode ? (
          <>
            <h1 className="text-3xl">{story.title}</h1>
            <span className="h-px w-full bg-slate-300" />
            <AnswerForm node={story.startingNode} />
          </>
        ) : (
          <span>No stories there...</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Discover more stories</h2>
        <StoryGrid filter={story?.id ? { NOT: { id: story.id } } : undefined} />
      </div>
    </div>
  );
}
