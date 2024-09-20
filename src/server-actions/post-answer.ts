'use server';

import aiStoryFeed from '@/const/ai-story-feed';
import openAi from '@/const/open-ai';
import prisma from '@/lib/prisma';
import extraTrim from '@/utils/extra-trim';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateResultJson(result: any) {
  if (!(result?.is_game_over === false || result?.is_game_over === true))
    throw new Error('No is_game_over in result');

  if (
    !(
      result?.variant_1 &&
      result?.variant_1?.text &&
      typeof result?.variant_1?.text === 'string' &&
      result?.variant_1?.summary &&
      typeof result?.variant_1?.summary === 'string' &&
      result?.variant_1?.suggestedAnswerOne &&
      typeof result?.variant_1?.suggestedAnswerOne === 'string' &&
      result?.variant_1?.suggestedAnswerTwo &&
      typeof result?.variant_1?.suggestedAnswerTwo === 'string' &&
      result?.variant_1?.suggestedAnswerThree &&
      typeof result?.variant_1?.suggestedAnswerThree === 'string'
    )
  )
    throw new Error('No variant_1 in result');
  if (
    !(
      result?.variant_2 &&
      result?.variant_2?.text &&
      typeof result?.variant_2?.text === 'string' &&
      result?.variant_2?.summary &&
      typeof result?.variant_2?.summary === 'string' &&
      result?.variant_2?.suggestedAnswerOne &&
      typeof result?.variant_2?.suggestedAnswerOne === 'string' &&
      result?.variant_2?.suggestedAnswerTwo &&
      typeof result?.variant_2?.suggestedAnswerTwo === 'string' &&
      result?.variant_2?.suggestedAnswerThree &&
      typeof result?.variant_2?.suggestedAnswerThree === 'string'
    )
  )
    throw new Error('No variant_2 in result');
  if (
    !(
      result?.variant_3 &&
      result?.variant_3?.text &&
      typeof result?.variant_3?.text === 'string' &&
      result?.variant_3?.summary &&
      typeof result?.variant_3?.summary === 'string' &&
      result?.variant_3?.suggestedAnswerOne &&
      typeof result?.variant_3?.suggestedAnswerOne === 'string' &&
      result?.variant_3?.suggestedAnswerTwo &&
      typeof result?.variant_3?.suggestedAnswerTwo === 'string' &&
      result?.variant_3?.suggestedAnswerThree &&
      typeof result?.variant_3?.suggestedAnswerThree === 'string'
    )
  )
    throw new Error('No variant_3 in result');
  if (
    !(
      result?.variant_4 &&
      result?.variant_4?.text &&
      typeof result?.variant_4?.text === 'string' &&
      result?.variant_4?.summary &&
      typeof result?.variant_4?.summary === 'string' &&
      result?.variant_4?.suggestedAnswerOne &&
      typeof result?.variant_4?.suggestedAnswerOne === 'string' &&
      result?.variant_4?.suggestedAnswerTwo &&
      typeof result?.variant_4?.suggestedAnswerTwo === 'string' &&
      result?.variant_4?.suggestedAnswerThree &&
      typeof result?.variant_4?.suggestedAnswerThree === 'string'
    )
  )
    throw new Error('No variant_4 in result');
  if (
    !(
      result?.variant_5 &&
      result?.variant_5?.text &&
      typeof result?.variant_5?.text === 'string' &&
      result?.variant_5?.summary &&
      typeof result?.variant_5?.summary === 'string' &&
      result?.variant_5?.suggestedAnswerOne &&
      typeof result?.variant_5?.suggestedAnswerOne === 'string' &&
      result?.variant_5?.suggestedAnswerTwo &&
      typeof result?.variant_5?.suggestedAnswerTwo === 'string' &&
      result?.variant_5?.suggestedAnswerThree &&
      typeof result?.variant_5?.suggestedAnswerThree === 'string'
    )
  )
    throw new Error('No variant_5 in result');

  return result;
}

export default async function postAnswer(formData: FormData) {
  const answer = extraTrim(formData.get('answer') as string).toLowerCase();
  const parentNodeVariantId = formData.get('parentNodeVariantId') as string;

  // check if answer exists in the database
  const existingAnswer = await prisma.answer.findFirst({
    where: {
      text: answer,
      parentNodeVariantId,
    },
    include: {
      nextNode: {
        include: {
          variants: true,
        },
      },
    },
  });

  // return the answer's next node if it exists
  if (existingAnswer) {
    // add a vote to the answer
    const savedAnswer = await prisma.answer.update({
      where: {
        id: existingAnswer.id,
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    // randomly select a variant from the next node
    const randomVariant =
      existingAnswer.nextNode.variants[
        Math.floor(Math.random() * existingAnswer.nextNode.variants.length)
      ];

    return {
      data: {
        node: existingAnswer.nextNode,
        nodeVariant: randomVariant,
        answer: savedAnswer,
      },
    };
  }

  try {
    // otherwise make a call to the AI to generate a new node
    const nodeVariant = await prisma.nodeVariant.findUniqueOrThrow({
      where: {
        id: parentNodeVariantId,
      },
      include: {
        parentNode: true,
      },
    });

    const completion = await openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: aiStoryFeed.replace('{{summary}}', nodeVariant.storySummary),
        },
        {
          role: 'user',
          content: answer,
        },
      ],
    });

    if (!completion.choices[0].message.content) throw new Error('No content in completion');

    console.log(completion.choices[0].message.content);

    let trimmedContent = extraTrim(
      completion.choices[0].message.content.replace(/(\r\n|\n|\r)/gm, ''),
    );

    // if the content do not start with "{" but has it later, remove the first part, throw an error if cannot find the index of "{"
    if (trimmedContent.indexOf('{') !== 0) {
      const index = trimmedContent.indexOf('{');
      if (index === -1) throw new Error('Response from AI does not contain a valid JSON object');
      trimmedContent = trimmedContent.substring(index);
    }
    // if the content do not end with "}" but has it earlier, remove the last part, throw an error if cannot find the index of "}"
    if (trimmedContent.lastIndexOf('}') !== trimmedContent.length - 1) {
      const index = trimmedContent.lastIndexOf('}');
      if (index === -1) throw new Error('Response from AI does not contain a valid JSON object');
      trimmedContent = trimmedContent.substring(0, index + 1);
    }

    const result = JSON.parse(
      extraTrim(completion.choices[0].message.content.replace(/(\r\n|\n|\r)/gm, '')),
    );

    // run validation on the result
    const validatedResult: {
      is_game_over: boolean;
      variant_1: {
        text: string;
        summary: string;
        suggestedAnswerOne: string;
        suggestedAnswerTwo: string;
        suggestedAnswerThree: string;
      };
      variant_2: {
        text: string;
        summary: string;
        suggestedAnswerOne: string;
        suggestedAnswerTwo: string;
        suggestedAnswerThree: string;
      };
      variant_3: {
        text: string;
        summary: string;
        suggestedAnswerOne: string;
        suggestedAnswerTwo: string;
        suggestedAnswerThree: string;
      };
      variant_4: {
        text: string;
        summary: string;
        suggestedAnswerOne: string;
        suggestedAnswerTwo: string;
        suggestedAnswerThree: string;
      };
      variant_5: {
        text: string;
        summary: string;
        suggestedAnswerOne: string;
        suggestedAnswerTwo: string;
        suggestedAnswerThree: string;
      };
    } = validateResultJson(result);

    // save the next node to the database
    const savedNode = await prisma.node.create({
      include: {
        variants: true,
      },
      data: {
        storyId: nodeVariant.parentNode.storyId,
        isGameOver: validatedResult.is_game_over,
        variants: {
          create: [
            {
              content: validatedResult.variant_1.text,
              storySummary: validatedResult.variant_1.summary,
              suggestedAnswerOne: validatedResult.variant_1.suggestedAnswerOne,
              suggestedAnswerTwo: validatedResult.variant_1.suggestedAnswerTwo,
              suggestedAnswerThree: validatedResult.variant_1.suggestedAnswerThree,
            },
            {
              content: validatedResult.variant_2.text,
              storySummary: validatedResult.variant_2.summary,
              suggestedAnswerOne: validatedResult.variant_2.suggestedAnswerOne,
              suggestedAnswerTwo: validatedResult.variant_2.suggestedAnswerTwo,
              suggestedAnswerThree: validatedResult.variant_2.suggestedAnswerThree,
            },
            {
              content: validatedResult.variant_3.text,
              storySummary: validatedResult.variant_3.summary,
              suggestedAnswerOne: validatedResult.variant_3.suggestedAnswerOne,
              suggestedAnswerTwo: validatedResult.variant_3.suggestedAnswerTwo,
              suggestedAnswerThree: validatedResult.variant_3.suggestedAnswerThree,
            },
            {
              content: validatedResult.variant_4.text,
              storySummary: validatedResult.variant_4.summary,
              suggestedAnswerOne: validatedResult.variant_4.suggestedAnswerOne,
              suggestedAnswerTwo: validatedResult.variant_4.suggestedAnswerTwo,
              suggestedAnswerThree: validatedResult.variant_4.suggestedAnswerThree,
            },
            {
              content: validatedResult.variant_5.text,
              storySummary: validatedResult.variant_5.summary,
              suggestedAnswerOne: validatedResult.variant_5.suggestedAnswerOne,
              suggestedAnswerTwo: validatedResult.variant_5.suggestedAnswerTwo,
              suggestedAnswerThree: validatedResult.variant_5.suggestedAnswerThree,
            },
          ],
        },
      },
    });

    // save the answer to the database
    const savedAnswer = await prisma.answer.create({
      data: {
        text: answer,
        parentNodeVariantId,
        votes: 1,
        nextNodeId: savedNode.id,
      },
    });

    // randomly select a variant from the next node
    const randomVariant = savedNode.variants[Math.floor(Math.random() * savedNode.variants.length)];

    return { data: { node: savedNode, nodeVariant: randomVariant, answer: savedAnswer } };
  } catch (error) {
    console.error('[POST-ANSWER] An error occurred while generating the next node', error);

    return { error: 'An error occurred while generating the next node' };
  }
}
