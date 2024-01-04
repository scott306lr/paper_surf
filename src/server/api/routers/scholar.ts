import { z } from "zod";
import { fetchPaperbyInput, PostPaper } from "~/server/server_utils/fetchHandler";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lda_abstract } from "~/server/server_utils/lda-topic-model";
import { type Paper, type PaperBrief } from "~/server/server_utils/fetchHandler";
import { type CGraphData } from "~/components/CGraph2D";
import { to_lda } from "~/utils/graph_utils";
import TSNE from 'tsne-js';

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
    .input(z.object({ sweeps: z.number(), stopwords: z.array(z.string()), input: z.array(z.string()), filter_input: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const nodes: CGraphData["nodes"] = []
      const links: CGraphData["links"] = []
      const search_data = await fetchPaperbyInput(input.input, input.filter_input);
      const paperID_array = to_lda(search_data ?? [])

      let model = new TSNE({
        dim: 2,
        perplexity: 30.0,
        earlyExaggeration: 4.0,
        learningRate: 100.0,
        nIter: 1000,
        metric: 'euclidean'
      });
      const data = await PostPaper(paperID_array);
      const embeddings = data?.map((d: Paper) => d.embedding?.vector);
      model.init({
        data: embeddings,
        type: 'dense'
      });
      model.run();
      const output = model.getOutputScaled();

      const id_map = new Map<string, {
        id: string,
        title: string,
        embedding: number[],
        size: number
      }>()

      for (let i = 0; i < (data == undefined ? 0 : data?.length); i++)
        id_map.set(data[i].paperId, {
          id: data[i].paperId,
          title: data[i].title,
          embedding: output[i],
          size: data[i].citationCount
        })

      const citation_map = new Map<string, string[]>()
      const reference_map = new Map<string, string[]>()
      const current_node = new Set<string>()
      search_data?.map((d: PaperBrief) => {
        if (id_map.has(d.paperId)) {
          const node_link = [] as string[]
          const node_neighbors = [] as string[]
          d.citations.map((c) => c.paperId).filter((c) => id_map.has(c)).map((c) => {
            links.push({
              id: `${d.paperId}-${c}`,
              source: d.paperId,
              target: c,
              opacity: 1,
              strength: 0
            });
            if (citation_map.has(c))
              citation_map.set(c, citation_map.get(c).concat([d.paperId]))
            else
              citation_map.set(c, [d.paperId])
            node_link.push(`${d.paperId}-${c}`);
            node_neighbors.push(c);
          })
          d.references.map((c) => c.paperId).filter((c) => id_map.has(c)).map((c) => {
            links.push({
              id: `${c}-${d.paperId}`,
              source: c,
              target: d.paperId,
              opacity: 1,
              strength: 0
            });
            if (reference_map.has(c))
              reference_map.set(c, reference_map.get(c).concat([d.paperId]))
            else
              reference_map.set(c, [d.paperId])
            node_link.push(`${c}-${d.paperId}`);
            node_neighbors.push(c);
          })
          if (!current_node.has(d.paperId)) {
            current_node.add(d.paperId)
            nodes.push({
              id: d.paperId,
              label: id_map.get(d.paperId)?.title ?? "",
              size: 10,//id_map.get(d.paperId)?.size ?? 0,
              level: 0,
              color: "red",
              drawType: "circle",
              myX: id_map.get(d.paperId)?.embedding[0] ?? 0,
              myY: id_map.get(d.paperId)?.embedding[1] ?? 0,
              neighbors: node_neighbors,
              links: node_link,
              opacity: 1,
            })
          }
        }
      })


      search_data?.map((d: PaperBrief) => {
        d.citations.map((c) => c.paperId).filter((c) => id_map.has(c)).map((c) => {
          const citation_links = [] as string[]
          citation_map.get(c)?.forEach((n) => {
            citation_links.push(`${n}-${c}`)
          })
          if (!current_node.has(c)) {
            nodes.push({
              id: c,
              label: id_map.get(c)?.title ?? "",
              size: id_map.get(c)?.size ?? 0,
              level: 0,
              color: "red",
              drawType: "circle",
              myX: id_map.get(c)?.embedding[0] ?? 0,
              myY: id_map.get(c)?.embedding[1] ?? 0,
              neighbors: citation_map.get(c) ?? [],
              links: citation_links,
              opacity: 1,
            })
          }
        })
        d.references.map((c) => c.paperId).filter((c) => id_map.has(c)).map((c) => {
          const reference_links = [] as string[]
          reference_map.get(c)?.forEach((n) => {
            reference_links.push(`${n}-${c}`)
          })
          if (!current_node.has(c)) {
            nodes.push({
              id: c,
              label: id_map.get(c)?.title ?? "",
              size: 10,//id_map.get(c)?.size ?? 0,
              level: 0,
              color: "red",
              drawType: "circle",
              myX: id_map.get(c)?.embedding[0] ?? 0,
              myY: id_map.get(c)?.embedding[1] ?? 0,
              neighbors: reference_map.get(c) ?? [],
              links: reference_links,
              opacity: 1,
            })
          }
        })
      })
      const result = data && lda_abstract(data, input.sweeps, input.stopwords);

      result?.forEach((d) => {
        let x = 0, y = 0;
        const node_link = [] as string[]
        const node_neighbors = [] as string[]
        d.documents.forEach((c) => {
          x += id_map.get(c.id)?.embedding[0] ?? 0;
          y += id_map.get(c.id)?.embedding[1] ?? 0;
          node_neighbors.push(c.id);
          node_link.push(`${d.topic}-${c.id}`);
          nodes.find((n) => n.id == c.id)?.neighbors.push(`${d.topic}`)
          nodes.find((n) => n.id == c.id)?.links.push(`${c.id}-${d.topic}`)
          links.push({
            id: `${d.topic}-${c.id}`,
            source: `${d.topic}`,
            target: c.id,
            opacity: 1,
            strength: 0
          });
        })
        x /= d.documents.length;
        y /= d.documents.length;
        nodes.push({
          id: `${d.topic}`,
          label: d.documentVocab[0].word,
          size: 10,//0,
          level: 0,
          color: "red",
          drawType: "text",
          myX: x,
          myY: y,
          neighbors: node_neighbors,
          links: node_link,
          opacity: 1,
        })
      })

      return { nodes, links };
    }),
});