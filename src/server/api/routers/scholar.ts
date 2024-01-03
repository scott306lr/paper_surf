import { z } from "zod";
import { fetchPaperbyInput, Paper, PostPaper, PostRecommendation } from "~/server/server_utils/fetchHandler";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lda_abstract } from "~/server/server_utils/lda-topic-model";

export const scholarRouter = createTRPCRouter({
  searchByInput: publicProcedure
    .input(z.object({ input: z.array(z.string()), filter_input: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const search_data = await fetchPaperbyInput(input.input, input.filter_input);
      while (search_data == undefined) { }
      const search_id = search_data.map((d: any) => d.paperId)
      const Recommend_data = await PostRecommendation(search_id);
      // //return search_data concat with recommendation data
      return search_data.concat(Recommend_data ?? []);
    }),

  lda: publicProcedure
    .input(z.object({ paperID_array: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const data = await PostPaper(input.paperID_array);
      const result = data && lda_abstract(data);
      return result;
    }),

  // getData: publicProcedure
  // .input(z.object({ key: z.string()}))
  // .query(async ({ input }) => {
  //   const IDs = await getPaperIDs(input.key);
  //   const data = await PostPaper(IDs, true);
  //   const citation_ids = data.map((d:any) => d.citations.map((c : any) => c.paperId))
  //   console.log(citation_ids)
  //   const citation_ids_flat_set = new Set(citation_ids.flat())
  //   const citation_data = await Promise.all(
  //     citation_ids.map(async (element:any) => {
  //       const data = await PostPaper(element, false);
  //       return data;
  //     })
  //   )

  //   console.log(citation_data)
  //   return [data, citation_data];

  //   // const IDs = await getPaperIDs(input.key);
  //   // const data = await PostPaper(IDs, true);
  // }),

  // PostData: publicProcedure
  // .input(z.object({ key: z.array(z.string()), citations: z.boolean()}))
  // .query(async ({ input }) => {
  //   const data = PostPaper(input.key, input.citations);
  //   return data;
  // }),

});