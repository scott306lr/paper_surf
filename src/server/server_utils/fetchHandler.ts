// export interface Paper {
//   abstract: string;
//   arxivId: string;
//   authors: string[];
//   citationVelocity: number;
//   citations: string[];
//   corpusId: number;
//   doi: string;
//   influentialCitationCount: number;
//   paperId: string;
//   references: string[];
//   title: string;
//   topics: string[];
//   url: string;
//   venue: string;
//   year: number;
// }

// paperId: d.paperId as string,
// embedding: d.embedding as Array<number>,
// abstract: d.abstract as string,
// tldr: d.tldr == null ? null : d.tldr.text as string,

export interface Paper {
  paperId: string;
  title: string;
  embedding: number[];
  abstract: string;
  tldr: { text: string } | null;
  citations: { paperId: string; title: string; abstract: string }[];
  references: { paperId: string; title: string }[];
}

const search_url =
  "https://api.semanticscholar.org/graph/v1/paper/search?query=";


const getURL = (input: string) => {
  return (
    search_url + input + "&limit=10&fields=paperId,title,embedding,abstract,tldr,citations,citations.paperId,citations.title,citations.abstract"
  );
};

export const fetchPaperbyInput = async (input: string) => {
  const response = await fetch(getURL(input), {
    method: "GET",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
  })
    .then((response) => response.json())
    .then((data: any) => data.data as Paper[])
    .then((data) => data.filter((d) => d.paperId != null && d.abstract != null))
    //slice the citations to 10
    .then((data) => data.map((d) => {
      d.citations = d.citations.filter((c) => c.abstract != null).slice(0, 10)
      return d;
    }))
    .catch((error) => {
      console.log(error);
    });
  return response;
};

// export const getPaperIDs = async (key: string) => {
//   const response = await fetch(search_url + key + "&limit=2", {
//       method: "GET",
//       headers: {
//           "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
//       }
//   })
//       .then((response) => response.json())
//       .then((data) => data.data as Paper[])
//       .then((data) => data.map((d: any) => d.paperId))
//       .catch((error) => { console.log(error) });
//   return response;
// };

// export const PostPaper = async (data: any, citations: boolean) => {
//   var fields = [];
//   if(citations)
//     fields = ["paperId", "title", "abstract", "tldr", "authors", "citations"]
//   else
//     fields = ["paperId", "title", "abstract", "tldr", "authors", "references"]
//   const fieldsString = fields.join();
//   const response = await fetch(batch_url + fieldsString, {
//       method: "POST",
//       headers: {
//           "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
//       },
//       body: JSON.stringify({ "ids": data })
//   })
//       .then((response) => response.json())
//       .then((data: Paper[]) => data?.filter((d) => d.paperId != null))
//       // .then((data) =>
//       //     data.map((paper: any) => {
//       //       if(citations)
//       //         return {
//       //           paper_id: paper.paperId as string,
//       //           title: paper.title as string,
//       //           abstract: paper.abstract as string,
//       //           tldr: paper.tldr == null ? null : paper.tldr.text as string,
//       //           authors: paper.authors as Array<object>,
//       //           citations: paper.citations.filter((d:any) => d.paperId != null) as Array<object>,
//       //         }
//       //       else
//       //         return {
//       //           paper_id: paper.paperId as string,
//       //           title: paper.title as string,
//       //           abstract: paper.abstract as string,
//       //           tldr: paper.tldr == null ? null : paper.tldr.text as string,
//       //           authors: paper.authors as Array<object>,
//       //           references: paper.references.filter((d:any) => d.paperId != null) as Array<object>,
//       //         }
//       //     })
//       //  )
//       .catch((error) => { console.log(error) });
//   // console.log('post paper : ', response);
//   return response;
// }

