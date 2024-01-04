import { type Paper } from "~/server/server_utils/fetchHandler"
import { useQuery } from "@tanstack/react-query"

const url = 'https://api.semanticscholar.org/graph/v1/paper/'

const FetchPaper = async (paperId: string) => {
    const fieldsString = ['title', 'url', 'publicationVenue', 'externalIds', 'year', 'abstract', 'referenceCount', 'citationCount', 'influentialCitationCount',
        'isOpenAccess', 'openAccessPdf', 'fieldsOfStudy', 's2FieldsOfStudy', 'publicationTypes', 'publicationDate', 'journal',
        'citationStyles', 'embedding', 'authors.externalIds', 'authors.url', 'authors.name', 'authors.aliases', 'authors.affiliations',
        'authors.homepage', 'authors.paperCount', 'authors.citationCount', 'authors.hIndex',
        'citations.title', 'citations.publicationVenue', 'citations.year', 'citations.externalIds', 'citations.journal',
        'references.title', 'references.publicationVenue', 'references.year', 'references.externalIds', 'references.journal'].join();
    const response = await fetch(url + paperId + "?fields=" + fieldsString, {
        method: "GET",
        headers: {
            "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
        }
    })
        .then((response) => response.json())
        .then((data: any) => { return data as Paper })
        .catch((error) => { console.log(error) });
    return response;
}

export const getApaper = (paperId: string) => {
    const { data: data, error: error, isLoading: isLoading } = useQuery({
        queryKey: [paperId],
        queryFn: () => FetchPaper(paperId)
    })
    return data;
}