export interface Paper {
  paperId: string;
  title: string;
  embedding: number[];
  abstract: string;
  tldr: { text: string } | null;
  citations: { paperId: string; title: string; abstract: string }[];
  references: { paperId: string; title: string; abstract: string }[];
}

const search_url =
  "https://api.semanticscholar.org/graph/v1/paper/search?query=";

const batch_url =
  "https://api.semanticscholar.org/graph/v1/paper/batch?fields=";

const recommend_url =
  "https://api.semanticscholar.org/recommendations/v1/papers?limit=15&fields=";


const getURL = (input: string, filter_input: string) => {
  if (filter_input.length == 0)
    return (
      search_url + input + "&limit=10&fields=paperId,title,embedding,abstract,tldr,citations,citations.paperId,citations.title,citations.abstract,references,references.paperId,references.title,references.abstract"
    );
  else
    return (
      search_url + input + "-" + filter_input + "&limit=10&fields=paperId,title,embedding,abstract,tldr,citations,citations.paperId,citations.title,citations.abstract,references,references.paperId,references.title,references.abstract"
    );
};

export const fetchPaperbyInput = async (input: Array<string>, filter_input: Array<string>) => {
  const input_string = input.join("+");
  const filter_string = filter_input.join("-");
  const response = await fetch(getURL(input_string, filter_string), {
    method: "GET",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
  })
    .then((response) => response.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    .then((data: any) => data.data as Paper[])
    .then((data) => data.filter((d) => d.paperId != null && d.abstract != null))
    .then((data) => data.map((d) => {
      d.citations = d.citations.filter((c) => c.paperId != null && c.abstract != null).slice(0, 5);
      d.references = d.references.filter((c) => c.paperId != null && c.abstract != null).slice(0, 5);
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

export const PostPaper = async (data: any) => {
  const fields = ["paperId", "title", "abstract"];
  const fieldsString = fields.join();
  if (data.length == 0) {
    return []
  }
  const response = await fetch(batch_url + fieldsString, {
    method: "POST",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
    body: JSON.stringify({ "ids": data })
  })
    .then((response) => response.json())
    .then((data: Paper[]) => data.filter((d) => d.paperId != null))
    .catch((error) => { console.log(error) });
  return response;
}

export const PostRecommendation = async (data: any) => {
  var fields = ["paperId", "title", "authors", "abstract"]
  const fieldsString = fields.join();
  if (data.length == 0) {
    return []
  }
  const response = await fetch(recommend_url + fieldsString, {
    method: "POST",
    headers: {
      "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
    },
    body: JSON.stringify({ "positivePaperIds": data })
  })
    .then((response) => response.json())
    .then((data: any) => {
      return data.recommendedPapers as Paper[]
    })
    .then((data) => data.filter((d) => d.paperId != null && d.abstract != null))
    .then((data) => data.map((d) => {
      d.citations = [];
      d.references = [];
      return d;
    }))
    .catch((error) => { console.log(error) });
  return response;
}

