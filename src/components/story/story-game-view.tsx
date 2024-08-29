import prisma from '@/lib/prisma';
import StoryGrid from './story-grid';
import AnswerForm from './answer-form';

export default async function StoryGameView() {
  const story = await prisma.story.findFirst({
    where: {
      id: 'cm0f9cntk000h0djo7n1p3dtv',
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
      <div className="flex flex-col items-center gap-8">
        {story?.startingNode ? (
          <>
            <h1 className="text-3xl">{story.title}</h1>
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
