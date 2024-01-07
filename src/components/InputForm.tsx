"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";

export const inputFormSchema = z.object({
  positive: z.string().min(1),
  negative: z.string(),
  stopwords: z.string(),
  precision: z.number().min(1).max(100),
});

const InputForm: React.FC<{
  onSubmit: (values: z.infer<typeof inputFormSchema>) => void;
}> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof inputFormSchema>>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      positive: "",
      negative: "",
      stopwords: "",
      precision: 1,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-lg border p-6"
      >
        <FormField
          control={form.control}
          name="positive"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Positive Keywords </FormLabel>
              <FormControl>
                <Input placeholder="eat apple, read book, cat" {...field} />
              </FormControl>
              <FormDescription>
                Positive words are words that are useful
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="negative"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Negative Keywords </FormLabel>
              <FormControl>
                <Input placeholder="do homework, play computer" {...field} />
              </FormControl>
              <FormDescription>
                Negative words are words that are not useful
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stopwords"
          render={({ field }) => (
            <FormItem>
              <FormLabel> LDA Stopwords </FormLabel>
              <FormControl>
                <Input placeholder="am, are, is" {...field} />
              </FormControl>
              <FormDescription>
                Stopwords are words that are so common that they are not useful
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="precision"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel> Precision </FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  defaultValue={[value]}
                  onValueChange={(values) => {
                    onChange(values[0]);
                  }}
                  value={[form.getValues("precision")]}
                />
              </FormControl>
              <FormDescription>
                Higher precision gives better results but takes longer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Search</Button>
      </form>
    </Form>
  );
};

export default InputForm;
