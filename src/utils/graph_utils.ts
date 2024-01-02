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
    const id_set = new Set()
    data.forEach((d) => {
        id_set.add(d.paperId)
        d.citations?.forEach((c) => {
            id_set.add(c.paperId)
        })
    })
    return Array.from(id_set);
}