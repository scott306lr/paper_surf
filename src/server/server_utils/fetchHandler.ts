import chroma from "chroma-js";

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
  embedding: { model: string; vector: number[] };
  abstract: string;
  citationCount: number;
  authors: { authorId: string; name: string }[];
  citations: { paperId: string; title: string; abstract: string }[];
  references: { paperId: string; title: string; abstract: string }[];
}

export interface PaperBrief {
  paperId: string;
  year: number;
  authors: { authorId: string; name: string }[];
  citations: { paperId: string; year: number; authors: { authorId: string; name: string }[] }[];
  references: { paperId: string; year: number; authors: { authorId: string; name: string }[] }[];
}

const search_url =
  "https://api.semanticscholar.org/graph/v1/paper/search?query=";

const batch_url =
  "https://api.semanticscholar.org/graph/v1/paper/batch?fields=";

const recommend_url =
  "https://api.semanticscholar.org/recommendations/v1/papers?limit=15&fields=";


export const getColor = (year: number, min_year: number, max_year: number) => {
  if (year == -1) return "#000000";
  const f = chroma.scale(['yellow', '008ae5']).domain([min_year, max_year]);
  return f(year).hex().toString();
}

const getSearchURL = (input: string[], filter_input: string[]) => {
  const input_str = input.join("+");
  const prepend = [input_str].concat(filter_input).join("-");
  // return search_url + prepend + "&limit=10&fields=paperId,title,authors,year,embedding,abstract,tldr,citations,citations.paperId,citations.title,citations.authors,citations.year,references,references.paperId,references.authors,references.title,references.year";
  return search_url + prepend + "&limit=10&fields=paperId,year,authors,citations,citations.paperId,citations.year,citations.authors,references,references.paperId,references.year,references.authors";
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
      d.citations = d.citations?.filter((c) => c.paperId != null).slice(0, 5) ?? [];
      d.references = d.references?.filter((c) => c.paperId != null).slice(0, 5) ?? [];
      return d as Paper;
    });

  return filteredPaper;
}

export const fetchPaperbyInput = async (input_arr: string[], filter_arr: string[]) => {
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
      d.citations = d.citations.filter((c) => c.paperId != null).slice(0, 5) ?? [];
      d.references = d.references.filter((c) => c.paperId != null).slice(0, 5) ?? [];
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

export const PostPaper = async (data: string[]) => {
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
}

export const PostRecommendation = async (data: string[]) => {
  if (data.length == 0) {
    return []
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

