import { type Paper } from "~/server/server_utils/fetchHandler";
// export const data_to_graph = (data: Paper[]) => {
//     const nodes: any[] = []
//     const id_map = new Map()
//     data.map((d: any) => {
//         if (!id_map.has(d.paperId)) {
//             id_map.set(d.paperId, d.title)
//             return {
//                 id: d.paperId,
//                 title: d.title
//             }
//         }
//     }).forEach((d: any) => nodes.push(d))

//     data.map((d: any) => d.citations.map((c: any) => {
//         if (!id_map.has(c.paperId)) {
//             id_map.set(c.paperId, c.title)
//             return {
//                 id: c.paperId,
//                 title: c.title
//             }
//         }
//     })).flat().filter((d: any) => d != undefined).forEach((d: any) => nodes.push(d))

//     const links: any[] = []

//     data.map((d: any) => d.citations.map((c: any) => {
//         return {
//             source: d.paperId,
//             target: c.paperId
//         }
//     })).flat().filter((d: any) => d != undefined).forEach((d: any) => links.push(d))


//     return { nodes, links };
// }

// export const to_lda = (data: Paper[]) => {
//     const id_set = new Set()

//     data.map((d: any) => {
//         if (!id_set.has(d.paperId))
//             id_set.add(d.paperId)
//         d.citations.map((c: any) => {
//             if (!id_set.has(c.paperId)) {
//                 id_set.add(c.paperId)
//             }
//         })
//     })

//     return Array.from(id_set);
// }


interface PaperIdGraph {
    nodes: { paperId: string }[];
    links: { source: string; target: string }[];
}

interface TopicGraph {
    nodes: { 
        id: string, 
        keywords: string[], 
        paperIds: string[], 
        neighbors: string[] ,
        links: string[]
    }[];
    links: { 
        id: string,
        source: string; 
        target: string; 
        strength: number; }[];
}

export interface document {
    score: number;
    id: string;
    text: string;
}

export interface Vocab {
    count: number;
    word: string;
    stopword: any;
    specificity: number;
}


export interface topicInfo {
    topic: number;
    documents: document[];
    documentVocab: Vocab[];
}


export const data_to_graph = (data: Paper[]) => {
    const nodes: PaperIdGraph["nodes"] = []
    const links: PaperIdGraph["links"] = []

    const id_map = new Set<string>()
    data.map((d) => d.paperId)
        .reduce((acc, cur) => {
            if (!id_map.has(cur)) {
                id_map.add(cur)
                acc.push({ paperId: cur })
            }
            return acc;
        }, nodes)

    data.map((d) => d.citations?.filter((c) => {
        if (!id_map.has(c.paperId)) {
            id_map.add(c.paperId)
            return true;
        }
        return false;
    })).flat().filter((d) => d != undefined).forEach((d) => nodes.push(d))

    data.map((d) => d.references?.filter((c) => {
        if (!id_map.has(c.paperId)) {
            id_map.add(c.paperId)
            return true;
        }
        return false;
    })).flat().filter((d) => d != undefined).forEach((d) => nodes.push(d))


    data.map((d) => d.citations?.map((c) => {
        return {
            source: d.paperId,
            target: c.paperId
        }
    })).flat()
        // .filter((d) => d.source != undefined && d.target != undefined)
        .forEach((d) => links.push(d))

    data.map((d) => d.references?.map((c) => {
        return {
            source: d.paperId,
            target: c.paperId
        }
    })).flat()
        // .filter((d) => d.source != undefined && d.target != undefined)
        .forEach((d) => links.push(d))

    return { nodes, links };
}

export const to_lda = (data: Paper[]) => {
    const id_set = new Set<string>()
    data.forEach((d) => {
        id_set.add(d.paperId)
        d.citations?.forEach((c) => {
            id_set.add(c.paperId)
        })
    })
    return Array.from(id_set);
}

export const keyWord_to_graph = (data: topicInfo[]) => {
    // console.log('load data', data);
    const nodes: TopicGraph["nodes"] = []
    const links: TopicGraph["links"] = []
    for (let i = 0; i < data.length; i++) {
        // console.log(data[i].documents.map((d) => d.id));
        nodes.push({ 
            id: `${data[i].topic}`, 
            keywords: data[i].documentVocab.map((d) => d.word), 
            paperIds: data[i].documents.map((d) => `${d.id}`), 
            neighbors: [],
            links: []
        });
    }
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            let documentVocabA = data[i].documentVocab;
            let documentVocabB = data[j].documentVocab;
            let sameWord = 0;
            for (let k = 0; k < documentVocabA.length; k++) {
                for (let l = 0; l < documentVocabB.length; l++) {
                    if (documentVocabA[k].word == documentVocabB[l].word) {
                        sameWord++;
                        // console.log(documentVocabA[k].word);
                        break;
                    }
                }
            }
            if (sameWord != 0) {
                nodes[i].neighbors.push(`${data[j].topic}`);
                nodes[i].links.push(`${data[i].topic}-${data[j].topic}`);
                nodes[j].neighbors.push(data[i].topic);
                nodes[j].links.push(`${data[i].topic}-${data[j].topic}`);
                links.push({
                    id: `${data[i].topic}-${data[j].topic}`,
                    source: `${data[i].topic}`, 
                    target: `${data[j].topic}`, 
                    strength: sameWord 
                });
                
            }
        }
    }
    // console.log(nodes)
    return { nodes, links };
}