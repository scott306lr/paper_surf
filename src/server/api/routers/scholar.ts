import { z } from "zod";
import { fetchPaperbyInput, PostPaper } from "~/server/server_utils/fetchHandler";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lda_abstract } from "~/server/server_utils/lda-topic-model";

export const scholarRouter = createTRPCRouter({
  searchByInput: publicProcedure
    .input(z.object({ input: z.array(z.string()), filter_input: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const search_data = await fetchPaperbyInput(input.input, input.filter_input);
      // const search_id = search_data.map((d: any) => d.paperId)
      // const Recommend_data = await PostRecommendation(search_id);
      // //return search_data concat with recommendation data
      // return search_data.concat(Recommend_data ?? []);
      return search_data;
    }),

  lda: publicProcedure
    .input(z.object({ paperID_array: z.array(z.string()), sweeps: z.number(), stopwords: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const data = await PostPaper(input.paperID_array);
      const result = data && lda_abstract(data, input.sweeps, input.stopwords);
      return result;
    }),
});