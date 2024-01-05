import { z } from "zod";
import { fetchPaperbyInput, PostPaper, getColor } from "~/server/server_utils/fetchHandler";

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
        year: number,
        embedding: number[],
        size: number
      }>()

      for (let i = 0; i < (data == undefined ? 0 : data?.length); i++)
        id_map.set(data[i].paperId, {
          id: data[i].paperId,
          title: `${data[i].authors[0]?.name ?? "Unknown"}, ${data[i].year}`,
          year: data[i].year,
          embedding: output[i],
          size: data[i].citationCount
        })

      const current_node = new Set<string>()
      search_data?.map((d: PaperBrief) => {
        if (id_map.has(d.paperId)) {
          const node_link = [] as string[]
          const node_neighbors = [] as string[]
          d.citations.map((c) => c.paperId).filter((c) => id_map.has(c)).forEach((c) => {
            links.push({
              id: `${d.paperId}-${c}`,
              source: d.paperId,
              target: c,
              opacity: 1,
              strength: 0
            });
            // citations node
            if (current_node.has(c)) {
              nodes.find((n) => n.id == c)?.neighbors.push(d.paperId)
              nodes.find((n) => n.id == c)?.links.push(`${d.paperId}-${c}`)
            }
            else {
              console.log(getColor(id_map.get(c)?.year ?? 1980))
              nodes.push({
                id: c,
                label: id_map.get(c)?.title ?? "",
                size: Math.sqrt(id_map.get(c)?.size ?? 0) / 2 + 10,
                level: 0,
                color: getColor(id_map.get(c)?.year ?? 1980),
                drawType: "circle",
                myX: id_map.get(c)?.embedding[0] ?? 0,
                myY: id_map.get(c)?.embedding[1] ?? 0,
                neighbors: [d.paperId],
                links: [`${d.paperId}-${c}`],
                opacity: 1,
                year: id_map.get(c)?.year ?? 1980,
              })
              current_node.add(c)
            }
            node_link.push(`${d.paperId}-${c}`);
            node_neighbors.push(c);
          })
          // references node
          d.references.map((c) => c.paperId).filter((c) => id_map.has(c)).forEach((r) => {
            links.push({
              id: `${r}-${d.paperId}`,
              source: r,
              target: d.paperId,
              opacity: 1,
              strength: 0
            });
            if (current_node.has(r)) {
              nodes.find((n) => n.id == r)?.neighbors.push(d.paperId)
              nodes.find((n) => n.id == r)?.links.push(`${r}-${d.paperId}`)
            }
            else {
              nodes.push({
                id: r,
                label: id_map.get(r)?.title ?? "",
                size: Math.sqrt(id_map.get(r)?.size ?? 0) / 2 + 10,
                level: 0,
                color: getColor(id_map.get(r)?.year ?? 1980),
                drawType: "circle",
                myX: id_map.get(r)?.embedding[0] ?? 0,
                myY: id_map.get(r)?.embedding[1] ?? 0,
                neighbors: [d.paperId],
                links: [`${r}-${d.paperId}`],
                opacity: 1,
                year: id_map.get(r)?.year ?? 1980,
              })
              current_node.add(r)
            }
            node_link.push(`${r}-${d.paperId}`);
            node_neighbors.push(r);
          })
          if (current_node.has(d.paperId)) {
            nodes.find((n) => n.id == d.paperId)?.neighbors.push(...node_neighbors)
            nodes.find((n) => n.id == d.paperId)?.links.push(...node_link)
          }
          else {
            nodes.push({
              id: d.paperId,
              label: id_map.get(d.paperId)?.title ?? "",
              size: Math.sqrt(id_map.get(d.paperId)?.size ?? 0) / 2 + 10,
              level: 0,
              color: getColor(id_map.get(d.paperId)?.year ?? 1980),
              drawType: "circle",
              myX: id_map.get(d.paperId)?.embedding[0] ?? 0,
              myY: id_map.get(d.paperId)?.embedding[1] ?? 0,
              neighbors: node_neighbors,
              links: node_link,
              opacity: 1,
              year: id_map.get(d.paperId)?.year ?? 1980,
            })
            current_node.add(d.paperId)
          }
        }
      })

      const result = data && lda_abstract(data, input.sweeps, input.stopwords);

      result?.forEach((d) => {
        let x = 0, y = 0;
        let x_score = 0, y_score = 0;
        const node_link = [] as string[]
        const node_neighbors = [] as string[]
        d.documents.forEach((c) => {
          x += id_map.get(c.id)?.embedding[0] * c.score ?? 0;
          y += id_map.get(c.id)?.embedding[1] * c.score ?? 0;
          x_score += c.score ?? 0;
          y_score += c.score ?? 0;
          node_neighbors.push(c.id);
          node_link.push(`${d.topic}-${c.id}`);
          if (current_node.has(c.id)) {
            nodes.find((n) => n.id == c.id)?.neighbors.push(`${d.topic}`)
            nodes.find((n) => n.id == c.id)?.links.push(`${d.topic}-${c.id}`)
          }
          else {
            nodes.push({
              id: c.id,
              label: id_map.get(c.id)?.title ?? "",
              size: Math.sqrt(id_map.get(c.id)?.size ?? 0) / 2 + 10,
              level: 0,
              color: getColor(id_map.get(c.id)?.year ?? 1980),
              drawType: "circle",
              myX: id_map.get(c.id)?.embedding[0] ?? 0,
              myY: id_map.get(c.id)?.embedding[1] ?? 0,
              neighbors: [`${d.topic}`],
              links: [`${d.topic}-${c.id}`],
              opacity: 1,
              year: id_map.get(c.id)?.year ?? 1980,
            })
            current_node.add(c.id)
          }
          links.push({
            id: `${d.topic}-${c.id}`,
            source: `${d.topic}`,
            target: c.id,
            opacity: 1,
            strength: 0
          });
        })
        x /= x_score;
        y /= y_score;
        nodes.push({
          id: `${d.topic}`,
          label: d.documentVocab[0].word,
          size: 24,//0,
          level: 0,
          color: "black",//"red",
          drawType: "text",
          myX: x,
          myY: y,
          neighbors: node_neighbors,
          links: node_link,
          opacity: 1,
          year: -1,
        })
      })

      return { nodes, links };
    }),
});