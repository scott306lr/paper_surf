import { any } from "zod";
import { Paper } from "~/server/server_utils/fetchHandler";

export const data_to_graph = (data: Paper[]) => {
    const nodes: any[] = []
    const id_map = new Map()
    data.map((d: any) => {
        if (!id_map.has(d.paperId)) {
            id_map.set(d.paperId, d.title)
            return {
                id: d.paperId,
                title: d.title
            }
        }
    }).forEach((d: any) => nodes.push(d))

    data.map((d: any) => d.citations.map((c: any) => {
        if (!id_map.has(c.paperId)) {
            id_map.set(c.paperId, c.title)
            return {
                id: c.paperId,
                title: c.title
            }
        }
    })).flat().filter((d: any) => d != undefined).forEach((d: any) => nodes.push(d))

    data.map((d: any) => d.references.map((c: any) => {
        if (!id_map.has(c.paperId)) {
            id_map.set(c.paperId, c.title)
            return {
                id: c.paperId,
                title: c.title
            }
        }
    })).flat().filter((d: any) => d != undefined).forEach((d: any) => nodes.push(d))

    const links: any[] = []

    data.map((d: any) => d.citations.map((c: any) => {
        return {
            source: d.paperId,
            target: c.paperId
        }
    })).flat().filter((d: any) => d != undefined).forEach((d: any) => links.push(d))

    data.map((d: any) => d.references.map((c: any) => {
        return {
            source: c.paperId,
            target: d.paperId
        }
    })).flat().filter((d: any) => d != undefined).forEach((d: any) => links.push(d))

    return { nodes, links };
}

export const to_lda = (data: Paper[]) => {
    const id_set = new Set()

    data.map((d: any) => {
        if (!id_set.has(d.paperId))
            id_set.add(d.paperId)
        if (d.citations != null) {
            d.citations.map((c: any) => {
                if (!id_set.has(c.paperId)) {
                    id_set.add(c.paperId)
                }
            })
        }
    })

    return Array.from(id_set);
}
