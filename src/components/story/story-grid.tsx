import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function StoryGrid({ filter }: { filter?: Prisma.StoryWhereInput }) {
  const stories = await prisma.story.findMany({ where: filter });

  return (
    <div className="grid grid-cols-3 gap-4">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col justify-between gap-2 border p-4">
          <div>
            <h3 className="mb-4 text-xl">{story.title}</h3>
            <p className="text-sm text-gray-500">{story.description}</p>
          </div>
          <span className="flex justify-end">
            <Link
              className="flex items-center hover:underline focus:underline"
              href={`/story/${story.id}`}
            >
              Go to story <ChevronRight strokeWidth={2} size={18} />
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
}
