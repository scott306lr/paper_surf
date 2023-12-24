import { z } from "zod";
import { fetchPaperbyInput } from "~/server/server_utils/fetchHandler";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const scholarRouter = createTRPCRouter({
  searchByInput: publicProcedure
  .input(z.object({ input: z.string() }))
  .query(async ({ input }) => fetchPaperbyInput(input.input)),
  // getData: publicProcedure
  // .input(z.object({ key: z.string()}))
  // .query(async ({ input }) => {
  //   const ID = await getPaper(input.key);
  //   const data = PostPaper(ID, true);
  //   return data;
  // }),

  // PostData: publicProcedure
  // .input(z.object({ key: z.array(z.string()), citations: z.boolean()}))
  // .query(async ({ input }) => {
  //   const data = PostPaper(input.key, input.citations);
  //   return data;
  // }),

  // TestData: publicProcedure
  // .input(z.object({ key: z.string()}))
  // .query(async ({ input }) => {
  //   return getTest(input.key);
  // }),
});

// const getPaper = async (key: string) => {
//   const response = await fetch(search_url + key + "&limit=1", {
//       method: "GET",
//       headers: {
//           "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
//       }
//   })
//       .then((response) => response.json())
//       .then((data) => data.data)
//       .catch((error) => { console.log(error) });
//   const paperIdList = response.map((paper: any) => paper.paperId);
//   return paperIdList;
// };

// const getTest = async (key: string) => {
//   const response = await fetch(search_url + key + "&limit=10&fields=paperId,embedding,abstract,tldr", {
//       method: "GET",
//       headers: {
//           "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
//       }
//   })
//       .then((response) => response.json())
//       .then((data) => data.data)
//       .then((data) => 
//         data.map((d : any) => ({
//             paperId: d.paperId as string,
//             embedding: d.embedding as Array<number>,
//             abstract: d.abstract as string,
//             tldr: d.tldr == null ? null : d.tldr.text as string,
//           })))
//       .catch((error) => { console.log(error) });
//   return response
// }

// const PostPaper = async (data: any, citations: boolean) => {
//   var fields = [];
//   if(citations)
//     fields = ["paperId", "title", "abstract", "tldr", "authors", "citations"]
//   else
//     fields = ["paperId", "title", "abstract", "tldr", "authors"]
//   const fieldsString = fields.join();
//   const response = await fetch(batch_url + fieldsString, {
//       method: "POST",
//       headers: {
//           "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
//       },
//       body: JSON.stringify({ "ids": data })
//   })
//       .then((response) => response.json())
//       .then((data) => 
//           data.map((paper: any) => {
//             if(citations)
//               return {
//                 paper_id: paper.paperId as string,
//                 title: paper.title as string,
//                 abstract: paper.abstract as string,
//                 tldr: paper.tldr == null ? null : paper.tldr.text as string,
//                 authors: paper.authors as Array<object>,
//                 citations: paper.citations.filter((d:any) => d.paperId != null) as Array<object>,
//               }
//             else
//               return {
//                 paper_id: paper.paperId as string,
//                 title: paper.title as string,
//                 abstract: paper.abstract as string,
//                 tldr: paper.tldr == null ? null : paper.tldr.text as string,
//                 authors: paper.authors as Array<object>,
//               }
//           })
//        )
//       .catch((error) => { console.log(error) });

//   return response;
// }