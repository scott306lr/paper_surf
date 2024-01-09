import chroma from 'chroma-js';

interface RawPaper {
  paperId?: string;
  title: string;
  embedding: { model: string; vector: number[] };
  abstract?: string;
  tldr?: { text?: string };
  authors?: { authorId: string; name: string }[];
  citations: { paperId: string; title: string; abstract: string }[];
  references: { paperId: string; title: string; abstract: string }[];
}

export interface Paper {
  paperId: string;
  title: string;
  year: number;
  embedding: { model: string; vector: number[] };
  abstract: string;
  citationCount: number;
  authors: { authorId: string; name: string }[];
  citations: { paperId: string; title: string; abstract: string }[];
  references: { paperId: string; title: string; abstract: string }[];
}

export interface PaperBrief {
  paperId: string;
  citations: { paperId: string;  }[];
  references: { paperId: string; }[];
}

const search_url =
  "https://api.semanticscholar.org/graph/v1/paper/search?query=";

const batch_url =
  "https://api.semanticscholar.org/graph/v1/paper/batch?fields=";

const recommend_url =
  "https://api.semanticscholar.org/recommendations/v1/papers?limit=15&fields=";


export const getColor = (year: number, min_year: number, max_year: number) => {
  if (year == -1) return "#000000";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const f = chroma.scale(['#ffffd9', '#41b6c4', '#081d58']).domain([min_year, max_year]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return f(year).hex().toString();
}

const getSearchURL = (input: string[], filter_input: string[]) => {
  const input_str = input.join("+");
  const prepend = [input_str].concat(filter_input).join("-");
  return search_url + prepend + "&limit=20&fields=paperId";
  // return search_url + prepend + "&limit=100&fields=paperId,year,authors";
};

const processPaper = (papers: RawPaper[]) => {
  // paper.abstract = (!paper.abstract) ? paper.abstract : paper.tldr?.text;
  const filteredPaper = papers
    .map((d) => {
      // d.abstract = (!d.abstract) ? d.abstract : d.tldr?.text; 
      d.abstract = (d.tldr?.text != null) ? d.tldr?.text : d.abstract;
      d.tldr = undefined;
      return d
    })
    .filter((d) => d.paperId != null && d.abstract != null && d.embedding != null)
    .map((d) => {
      d.citations = d.citations?.filter((c) => c.paperId != null).slice(0, 3) ?? [];
      d.references = d.references?.filter((c) => c.paperId != null).slice(0, 3) ?? [];
      return d as Paper;
    });

  return filteredPaper;
}

export const oldFetchPaperByInput = async (input_arr: string[], filter_arr: string[]) => {
  const response = await fetch(getSearchURL(input_arr, filter_arr), {
    method: "GET",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
  })
    .then((response) => response.json())
    // .then((data) => {console.log(data); return data;})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    .then((data: any) => data.data as PaperBrief[])
    .then((data) => data.map((d) => {
      d.citations = d.citations.filter((c) => c.paperId != null).slice(0, 3) ?? [];
      d.references = d.references.filter((c) => c.paperId != null).slice(0, 3) ?? [];
      return d;
    })) 
    .catch((error) => {
      console.log(error);
    });
  return response;
};


export const postPaperById = async (data: string[]) => {
  if (data.length == 0) {
    return []
  }

  const fieldsString = ["paperId", "title", "abstract", "tldr", "embedding", "citationCount", "authors", "year"].join();
  const response = await fetch(batch_url + fieldsString, {
    method: "POST",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
    body: JSON.stringify({ "ids": data })
  })
    .then((response) => response.json())
    // .then (data => {console.log(data); return data;})
    .then((data: Paper[]) => processPaper(data))
    .catch((error) => { console.log(error) });
  return response;
};

export const PostRecommendation = async (data: string[]) => {
  if (data.length == 0) {
    return [] as Paper[]
  }

  const fieldsString = ["paperId", "title", "years", "authors", "abstract"].join();
  const response = await fetch(recommend_url + fieldsString, {
    method: "POST",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
    body: JSON.stringify({ "positivePaperIds": data })
  })
    .then((response) => response.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((data: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return data.recommendedPapers as Paper[]
    })
    .then((data) => processPaper(data))
    .catch((error) => { console.log(error) });
  return response;
}


const getCiteURL = (paperId: string) => {
  return `https://api.semanticscholar.org/graph/v1/paper/${paperId}/citations?fields=paperId&limit=3`;
}

const getRefURL = (paperId: string) => {
  return `https://api.semanticscholar.org/graph/v1/paper/${paperId}/references?fields=paperId&limit=3`;
}

export const fetchPaperByInput = async (input_arr: string[], filter_arr: string[]) => {
  const paperIds = await fetch(getSearchURL(input_arr, filter_arr), {
    method: "GET",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
  })
    .then((response) => response.json())
    // .then((data) => {console.log(data); return data;})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    .then((data: any) => data.data as PaperBrief[])
    .then((data) => data.map((d) => d.paperId))
    .catch((error) => {
      console.log(error);
    });

    if (paperIds == null || paperIds.length == 0) {
      return []
    }

    const fieldsString = ["paperId", "citations", "citations.paperId", "references", "references.paperId"].join();
    const response = await fetch(batch_url + fieldsString, {
      method: "POST",
      headers: {
        "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
      },
      body: JSON.stringify({ "ids": paperIds })
    })
      // .then((response) => {
      //   if (!response.ok) {
      //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      //     console.log(response.ok, response.statusText, response.json());
      //     throw new Error(response.statusText, response.json());
      //   }
      //   return response.json();
      // })

      .then((response) => response.json())
      .then((data: PaperBrief[] | { error: string }) => {
        if ('error' in data) {
          throw new Error(data.error);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
      })
      .then((data: PaperBrief[]) => data.map((d) => {
        d.citations = d.citations.filter((c) => c.paperId != null).slice(0, 3) ?? [];
        d.references = d.references.filter((c) => c.paperId != null).slice(0, 3) ?? [];
        return d;
      })) 
      .catch((error) => {
        console.log(error);
      });
    return response;
}

  // // For each paperId, fetch the citation and reference, and store them in a map
  // const paperBriefsMap = new Map<string, PaperBrief>();

  // await Promise.all(paperIds.map(async (paperId) => {
  //   const response = await fetch(getCiteURL(paperId), {
  //     method: "GET",
  //     headers: {
  //       "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
  //     }
  //   })
  //     .then((response) => response.json())
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  //     .then((data: any) => (data.data as { paperId: string; }[]))
  //     .catch((error) => { console.log(error) });

  //   if (response == null) {
  //     return
  //   }

  //   paperBriefsMap.set(paperId, { paperId: paperId, citations: response, references: [] });
  // }));

  // await Promise.all(paperIds.map(async (paperId) => {
  //   const response = await fetch(getRefURL(paperId), {
  //     method: "GET",
  //     headers: {
  //       "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
  //     }
  //   })
  //     .then((response) => response.json())
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  //     .then((data: any) => (data.data as { paperId: string; }[]))
  //     .catch((error) => { console.log(error) });

  //   if (response == null) {
  //     return
  //   }

  //   paperBriefsMap.set(paperId, { paperId: paperId, citations: paperBriefsMap.get(paperId)?.citations ?? [], references: response });
//   }));

//   const paperBriefs = Array.from(paperBriefsMap.values());
//   return paperBriefs;
// };