import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export default async function StoryGrid({ filter }: { filter?: Prisma.StoryWhereInput }) {
  const stories = await prisma.story.findMany({ where: filter });

  return (
    <div className="grid grid-cols-3 gap-4">
      {stories.map((story) => (
        <div key={story.id} className="border p-4">
          <h3 className="text-xl">{story.title}</h3>
          <p className="text-gray-500">{story.description}</p>
        </div>
      ))}
    </div>
  );
}
