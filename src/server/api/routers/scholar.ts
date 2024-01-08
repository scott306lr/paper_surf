import { z } from "zod";
import { fetchPaperByInput, postPaperById, getColor } from "~/server/server_utils/fetchHandler";
import { type TopicInfo } from "~/utils/graph_utils";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lda_abstract } from "~/server/server_utils/lda-topic-model";
import { type Paper, type PaperBrief } from "~/server/server_utils/fetchHandler";
import { type CGraphData } from "~/components/CGraph2D";
import { to_lda } from "~/utils/graph_utils";
import hash from "object-hash";
import TSNE from 'tsne-js';


// replace with redis later
const search_data_cache = new Map<string, PaperBrief[] | void>();
const post_data_cache = new Map<string, Paper[] | void>();
const tsne_cache = new Map<string, number[][]>();
const lda_cache = new Map<string, TopicInfo[]>();

export const scholarRouter = createTRPCRouter({
  searchByInput: publicProcedure
    .input(z.object({ input: z.array(z.string()), filter_input: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const search_data = await fetchPaperByInput(input.input, input.filter_input);
      return search_data;
    }),

  lda: publicProcedure
    .input(z.object({ sweeps: z.number(), stopwords: z.array(z.string()), input: z.array(z.string()), filter_input: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const topic_nodes: CGraphData["nodes"] = []
      const paper_nodes: CGraphData["nodes"] = []
      const links: CGraphData["links"] = []
      

      let start_time = new Date().getTime();
      let search_data: PaperBrief[] | void;
      const search_data_cache_key = hash([input.input, input.filter_input])
      if (!search_data_cache.has(search_data_cache_key)) {
        search_data = await fetchPaperByInput(input.input, input.filter_input);
        search_data_cache.set(search_data_cache_key, search_data)

        //pop search_data_cache
        if (search_data_cache.size > 100) {
          search_data_cache.delete(search_data_cache.keys().next().value as string)
        }
        if (search_data == undefined) return { paper_nodes, links };
      } else {
        search_data = search_data_cache.get(search_data_cache_key)!
      }
      console.log("fetch search_data time", new Date().getTime() - start_time);
      
      
      start_time = new Date().getTime();
      let post_data: Paper[] | void;
      if (!post_data_cache.has(search_data_cache_key)){
        const paperID_array = to_lda(search_data)
        post_data = await postPaperById(paperID_array);
        post_data_cache.set(search_data_cache_key, post_data)

        //pop search_data_cache
        if (post_data_cache.size > 100) {
          post_data_cache.delete(search_data_cache.keys().next().value as string)
        }
        if (post_data == undefined) return { paper_nodes, links };
      } else {
        post_data = post_data_cache.get(search_data_cache_key)!
      }
      console.log("fetch post_data time", new Date().getTime() - start_time);
      
      //sort post_data by citationCount
      // post_data.sort((a, b) => a.citationCount - b.citationCount)
      
      start_time = new Date().getTime();
      let tsne_result: number[][] = [[]];
      if (!tsne_cache.has(search_data_cache_key)){
        const opt = {
          dim: 2,
          perplexity: 50.0,
          earlyExaggeration: 4.0,
          learningRate: 1000.0,
          nIter: 1000,
          metric: 'euclidean'
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const model = new TSNE(opt);
        const embeddings = post_data.map((d: Paper) => d.embedding.vector);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        model.init({
          data: embeddings,
          type: 'dense'
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        model.run();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        tsne_result = model.getOutputScaled() as number[][];
        tsne_cache.set(search_data_cache_key, tsne_result)

        //pop search_data_cache
        if (tsne_cache.size > 100) {
          tsne_cache.delete(search_data_cache.keys().next().value as string)
        }
      } else {
        tsne_result = tsne_cache.get(search_data_cache_key)!
      }
      console.log("tsne time", new Date().getTime() - start_time);


      start_time = new Date().getTime();
      const lda_cache_key = hash([input.input, input.filter_input, input.sweeps, input.stopwords])
      let lda_result: TopicInfo[] | void;
      if (!lda_cache.has(lda_cache_key)){
        lda_result = lda_abstract(post_data, input.sweeps, input.stopwords) as TopicInfo[];
        lda_cache.set(lda_cache_key, lda_result)

        //pop search_data_cache
        if (lda_cache.size > 100) {
          lda_cache.delete(search_data_cache.keys().next().value as string)
        }
      } else {
        lda_result = lda_cache.get(lda_cache_key)!
      }
      console.log("lda time", new Date().getTime() - start_time);


      start_time = new Date().getTime();
      const id_map = new Map<string, {
        id: string,
        title: string,
        year: number,
        embedding: number[],
        size: number
      }
      >()
      post_data.forEach((d: Paper, index) => {
        id_map.set(d.paperId, {
          id: d.paperId,
          title: `${d.authors[0]?.name ?? "Unknown author"}, ${d.year}`,
          year: d.year ?? -1,
          embedding: tsne_result[index]!,
          size: d.citationCount
        })
      })
      const min_year = Math.min(...post_data.map((d: Paper) => d.year ?? 2024))
      const max_year = Math.max(...post_data.map((d: Paper) => d.year ?? 1980))

      const current_node = new Set<string>()
      search_data.map((d: PaperBrief) => {
        if (id_map.has(d.paperId)) {
          const node_link: string[] = [] 
          const node_neighbors: string[] = []
          d.citations.map((c) => c.paperId).filter((c) => id_map.has(c)).forEach((c) => {
            links.push({
              id: `${d.paperId}-${c}`,
              source: d.paperId,
              target: c,
              opacity: 1,
              strength: 0,
              type: "Paper-Paper"
            });
            // citations node
            if (current_node.has(c)) {
              paper_nodes.find((n) => n.id == c)?.neighbors.push(d.paperId)
              paper_nodes.find((n) => n.id == c)?.links.push(`${d.paperId}-${c}`)
            }
            else {
              const new_node = id_map.get(c)!;
              paper_nodes.push({
                id: c,
                label: new_node.title,
                size: Math.sqrt(new_node.size) / 2 + 10,
                level: 0,
                color: getColor(new_node.year, min_year, max_year),
                drawType: "circle",
                myX: new_node.embedding[0]!,
                myY: new_node.embedding[1]!,
                neighbors: [d.paperId],
                links: [`${d.paperId}-${c}`],
                opacity: 1,
                year: new_node.year,
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
              strength: 0,
              type: "Paper-Paper"
            });
            if (current_node.has(r)) {
              paper_nodes.find((n) => n.id == r)?.neighbors.push(d.paperId)
              paper_nodes.find((n) => n.id == r)?.links.push(`${r}-${d.paperId}`)
            }
            else {
              const new_node = id_map.get(r)!;
              paper_nodes.push({
                id: r,
                label: new_node.title,
                size: Math.sqrt(new_node.size) / 2 + 10,
                level: 0,
                color: getColor(new_node.year, min_year, max_year),
                drawType: "circle",
                myX: new_node.embedding[0]!,
                myY: new_node.embedding[1]!,
                neighbors: [d.paperId],
                links: [`${r}-${d.paperId}`],
                opacity: 1,
                year: new_node.year,
              })
              current_node.add(r)
            }
            node_link.push(`${r}-${d.paperId}`);
            node_neighbors.push(r);
          })
          if (current_node.has(d.paperId)) {
            paper_nodes.find((n) => n.id == d.paperId)?.neighbors.push(...node_neighbors)
            paper_nodes.find((n) => n.id == d.paperId)?.links.push(...node_link)
          }
          else {
            const new_node = id_map.get(d.paperId)!;
            paper_nodes.push({
              id: d.paperId,
              label: new_node.title,
              size: Math.sqrt(new_node.size) / 2 + 10,
              level: 0,
              color: getColor(new_node.year, min_year, max_year),
              drawType: "circle",
              myX: new_node.embedding[0]!,
              myY: new_node.embedding[1]!,
              neighbors: node_neighbors,
              links: node_link,
              opacity: 1,
              year: new_node.year,
            })
            current_node.add(d.paperId)
          }
        }
      })

      lda_result.forEach((d) => {
        let x = 0, y = 0;
        let x_score = 0, y_score = 0;
        const node_link: string[] = []
        const node_neighbors: string[] = []
        d.documents.forEach((c) => {
          const new_node = id_map.get(c.id)!;
          const score = c.score * Math.max(Math.sqrt(new_node.size), 1);
          x += new_node.embedding[0]! * score ?? 0;
          y += new_node.embedding[1]! * score ?? 0;
          x_score += score;
          y_score += score;
          node_neighbors.push(c.id);
          node_link.push(`${d.topic}-${c.id}`);
          if (current_node.has(c.id)) {
            paper_nodes.find((n) => n.id == c.id)?.neighbors.push(`${d.topic}`)
            paper_nodes.find((n) => n.id == c.id)?.links.push(`${d.topic}-${c.id}`)
          }
          else {
            paper_nodes.push({
              id: c.id,
              label: new_node.title,
              size: Math.sqrt(new_node.size) / 2 + 10,
              level: 0,
              color: getColor(new_node.year, min_year, max_year),
              drawType: "circle",
              myX: new_node.embedding[0]!,
              myY: new_node.embedding[1]!,
              neighbors: [`${d.topic}`],
              links: [`${d.topic}-${c.id}`],
              opacity: 1,
              year: new_node.year,
            })
            current_node.add(c.id)
          }
          links.push({
            id: `${d.topic}-${c.id}`,
            source: `${d.topic}`,
            target: c.id,
            opacity: 1,
            strength: 0,
            type: "Topic-Paper"
          });
        })
        x /= x_score;
        y /= y_score;

        // nodes.sort((a, b) => b.size - a.size)

        const words = d.documentVocab;
        words.sort((a, b) => b.specificity - a.specificity)

        // LDA node
        topic_nodes.push({
          id: `${d.topic}`,
          label: words.filter((d) => d.word != null && d.specificity > 0.9).map((d) => d.word).slice(0,3).join(", "),
          // label: `${d.documentVocab[0]?.word}, ${d.documentVocab[1]?.word}`,
          size: 32,//0,
          level: 0,
          color: ['#e63946', '#ee6558', '#f3886e', '#f1ab8c', '#b5d5ef', '#e1c1e9', '#c2abd3', '#a496c0', '#0088f1'][+d.topic % 9]!,
          drawType: "text",
          myX: x,
          myY: y,
          neighbors: node_neighbors,
          links: node_link,
          opacity: 1,
          year: -1,
        })
      })
      console.log("graph time", new Date().getTime() - start_time);

      return { 
        // paper_nodes, concat paper_nodes and topic_nodes
        nodes: paper_nodes.concat(topic_nodes),
        links: links
      };
    }),
});