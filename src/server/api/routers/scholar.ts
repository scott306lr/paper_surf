import { z } from "zod";
import { fetchPaperbyInput, PostPaper } from "~/server/server_utils/fetchHandler";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lda_abstract } from "~/server/server_utils/lda-topic-model";

export const scholarRouter = createTRPCRouter({
  searchByInput: publicProcedure
    .input(z.object({ input: z.string() }))
    .query(async ({ input }) => fetchPaperbyInput(input.input)),

  lda: publicProcedure
    .input(z.object({ paperID_array: z.array(z.string()) }))
    .query(async ({ input }) => {
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