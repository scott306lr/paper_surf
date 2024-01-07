import { type PaperBrief } from "~/server/server_utils/fetchHandler";

export interface Document {
    score: number;
    id: string;
    text: string;
}

export interface Vocab {
    count: number;
    word: string;
    // stopword: any;
    specificity: number;
}

export interface TopicInfo {
    topic: number;
    documents: Document[];
    documentVocab: Vocab[];
}


export const to_lda = (data: PaperBrief[]) => {
    const id_set = new Set<string>()
    data.forEach((d) => {
        id_set.add(d.paperId)
        d.citations?.forEach((c) => {
            id_set.add(c.paperId)
        })
        d.references?.forEach((c) => {
            id_set.add(c.paperId)
        })
    })
    return Array.from(id_set);
}