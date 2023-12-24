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
  tldr: string;
}

const search_url =
  "https://api.semanticscholar.org/graph/v1/paper/search?query=";

const getURL = (input: string) => {
  return (
    search_url + input + "&limit=10&fields=paperId,title,embedding,abstract,tldr"
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    .then((data: any) => data.data as Paper[])
    .catch((error) => {
      console.log(error);
    });
    
  // console.log("response:");
  // console.log(response);
  return response;
};
