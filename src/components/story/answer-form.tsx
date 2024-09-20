'use client';

import postAnswer from '@/server-actions/post-answer';
import { Input } from '../ui/input';
import { useMemo, useState } from 'react';
import SubmitFormButton from './submit-form-button';
import { Node, NodeVariant, Prisma } from '@prisma/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem } from '../ui/form';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const FormSchema = z.object({
  answer: z
    .string()
    .min(2, {
      message: 'Your Answer is too short, please provide a longer answer',
    })
    .max(100, {
      message: 'Your Answer is too long, please provide a shorter answer',
    }),
});

type NodeWithVariants = Prisma.NodeGetPayload<{
  include: {
    variants: true;
  };
}>;

export default function AnswerForm({ node }: { node: NodeWithVariants }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      answer: '',
    },
  });

  const [currentNodeVariant, setCurrentNodeVariant] = useState<NodeVariant>(node.variants[0]);
  const [currentNode, setCurrentNode] = useState<Node>(node);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // add break lines when encountering "\n"
  const contentParagraphs = useMemo(() => {
    return currentNodeVariant.content.split('\\n').map((line, index) => <p key={index}>{line}</p>);
  }, [currentNodeVariant.content]);

  const submitFormWithValue = (value: string) => {
    form.setValue('answer', value);
  };

  return (
    <Form {...form}>
      <form
        action={async (formData) => {
          // submit form to server action
          formData.set('parentNodeVariantId', currentNodeVariant.id);
          const { error, data } = await postAnswer(formData);

          if (error || !data?.nodeVariant || !data?.node) {
            toast({
              title: 'Uh oh! Something went wrong...',
              description: error || 'No data returned from server',
              variant: 'destructive',
            });
            return;
          }

          // reset form
          form.reset();

          // update current node variant
          setCurrentNode(data.node);
          setCurrentNodeVariant(data?.nodeVariant);
        }}
        className="flex w-full flex-col items-center gap-2"
      >
        <div className="flex flex-col gap-4">{contentParagraphs}</div>
        {currentNode.isGameOver ? (
          <>
            <h3 className="my-8 text-3xl font-bold">Game Over</h3>
            <Button
              onClick={() => {
                setCurrentNode(node);
                setCurrentNodeVariant(node.variants[0]);
              }}
            >
              Restart
            </Button>
          </>
        ) : (
          <>
            <FormField
              name="answer"
              control={form.control}
              render={({ field }) => (
                <FormItem className="mt-4 w-full">
                  <Input placeholder="Enter your answer..." {...field} />
                </FormItem>
              )}
            />
            <Accordion
              type="single"
              collapsible
              className="w-full"
              onValueChange={() => setShowSuggestions((previous) => !previous)}
            >
              <AccordionItem value="show_suggestions">
                <AccordionTrigger className="flex items-center justify-start">
                  {showSuggestions ? (
                    <>
                      <Eye className="mr-2 size-4" />
                      Hide suggestions
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 size-4" />
                      Show suggestions
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => submitFormWithValue(currentNodeVariant.suggestedAnswerOne)}
                    >
                      {currentNodeVariant.suggestedAnswerOne}
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => submitFormWithValue(currentNodeVariant.suggestedAnswerTwo)}
                    >
                      {currentNodeVariant.suggestedAnswerTwo}
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => submitFormWithValue(currentNodeVariant.suggestedAnswerThree)}
                    >
                      {currentNodeVariant.suggestedAnswerThree}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex gap-2">
              <Button disabled variant="outline">
                Back
              </Button>
              <SubmitFormButton />
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
