import lda from 'lda';
import { api } from "~/trpc/server";

export const topic_extraction = async( data : any ) => {

    const data_topic = data.map(async (d : any) => {
        var topic = []
        topic.push({title: d.title, topic: lda_f(d['abstract'], d['tldr'])})
        const citation_id = d.citations.map((c : any) => c.paperId)
        const citation_id_length = citation_id.length
        var cur = 0
        while(cur < citation_id_length){
            var data_citation = []
            if(cur + 100 > citation_id_length){
                data_citation = await api.post.PostData.query({ key: citation_id.slice(cur, citation_id_length), citations: false});
                cur = citation_id_length
            }
            else{
                data_citation = await api.post.PostData.query({ key: citation_id.slice(cur, cur + 100), citations: false});
                cur += 100
            }
            for(var i = 0; i < data_citation.length; i++){
                topic.push({title: data_citation[i].title, topic: lda_f(data_citation[i]['abstract'], d['tldr'])})
            }
        }
        return topic;
    })
    const data_topic_result = await Promise.all(data_topic)
    return data_topic_result;
}

export const test_topic = async(key : any) => {
    const data = await api.post.TestData.query({key: key});
    for(var i = 0; i < data.length; i++){
        const result = lda_f(data[i]['abstract'], data[i]['tldr'])
        data[i]['lda'] = result
    }
    return data;
}

const lda_f = ( abstraction : string, tldr : string ) => {

    var text = abstraction

    if(abstraction == null){
        if(tldr == null)
            return [];
        else
            text = tldr;
    }

    var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

    var result = lda(documents, 1, 10);
    // var topic = result.map((r: any) => r.map((t: any) => t.term as string))
    // var prob = result.map((r: any) => r.map((t: any) => t.probability as number))

    return result;
}
