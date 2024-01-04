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

export const inputFormSchema = z.object({
  positive: z.string(),
  negative: z.string(),
  stopwords: z.string(),
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
    },
  });

  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   // Do something with the form values.
  //   // ✅ This will be type-safe and validated.
  //   console.log(values);
  // }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="positive"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Positive </FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
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
              <FormLabel> Negative </FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
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
              <FormLabel> Stopwords </FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                Stopwords are words that are so common that they are not useful
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
