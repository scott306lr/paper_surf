import { type Paper } from "~/server/server_utils/fetchHandler"
import { useQuery } from "@tanstack/react-query"

const url = 'https://api.semanticscholar.org/graph/v1/paper/'

export interface PaperInformation {
    'title': string,
    'url': string,
    'publicationVenue': string,
    // 'externalIds': {
    //     'doi': string,
    //     'arxiv': string,
    //     'pii': string,
    //     's2Id': string
    // },
    'year': number,
    'abstract': string,
    'tldr': {
        'text': string
    },
    'referenceCount': number,
    'citationCount': number,
    'influentialCitationCount': number,
    'isOpenAccess': boolean,
    'openAccessPdf': string,
    'fieldsOfStudy': string[],
    's2FieldsOfStudy': string[],
    'publicationTypes': string[],
    'publicationDate': string,
    'journal': string,
    'citationStyles': string[],
    'embedding': number[],
    'authors': {
        // 'externalIds': {
        //     'ids': string[],
        //     'sources': string[]
        // },
        'url': string,
        'name': string,
        'aliases': string[],
        'affiliations': {
            'name': string,
            // 'externalIds': {
            //     'ids': string[],
            //     'sources': string[]
            // },
            'url': string
        }[],
        'homepage': string,
        'paperCount': number,
        'citationCount': number,
        'hIndex': number
    }[],
    'citations': {
        'title': string,
        'citationCount': number,
        'publicationVenue': string,
        'fieldsOfStudy': string[],
        'year': number,
        // 'externalIds': {
        //     'doi': string,
        //     'arxiv': string,
        //     'pii': string,
        //     's2Id': string
        // },
        'publicationTypes': string[],
        'publicationDate': string,
        'journal': string,
        'authors': {
            // 'externalIds': {
            //     'ids': string[],
            //     'sources': string[]
            // },
            'url': string,
            'name': string,
            'aliases': string[],
            'affiliations': {
                'name': string,
                // 'externalIds': {
                //     'ids': string[],
                //     'sources': string[]
                // },
                'url': string
            }[],
            'homepage': string,
            'paperCount': number,
            'citationCount': number,
            'hIndex': number
        }[]
    }[],
    'references': {
        'title': string,
        'citationCount': number,
        'publicationVenue': string,
        'fieldsOfStudy': string[],
        'year': number,
        // 'externalIds': {
        //     'doi': string,
        //     'arxiv': string,
        //     'pii': string,
        //     's2Id': string
        // },
        'publicationTypes': string[],
        'publicationDate': string,
        'journal': string,
        'authors': {
            // 'externalIds': {
            //     'ids': string[],
            //     'sources': string[]
            // },
            'url': string,
            'name': string,
            'aliases': string[],
            'affiliations': {
                'name': string,
                // 'externalIds': {
                //     'ids': string[],
                //     'sources': string[]
                // },
                'url': string
            }[],
            'homepage': string,
            'paperCount': number,
            'citationCount': number,
            'hIndex': number
        }[]
    }[]
}

export const FetchPaper = async (paperId: string) => {
    const fieldsString = ['title', 'url', 'publicationVenue', 'year', 'abstract', 'tldr', 'referenceCount', 'citationCount', 'influentialCitationCount',
        'isOpenAccess', 'openAccessPdf', 'fieldsOfStudy', 's2FieldsOfStudy', 'publicationTypes', 'publicationDate', 'journal',
        'citationStyles', 'embedding', 'authors.url', 'authors.name', 'authors.aliases', 'authors.affiliations',
        'authors.homepage', 'authors.paperCount', 'authors.citationCount', 'authors.hIndex',
        'citations.title', 'citations.citationCount', 'citations.fieldsOfStudy','citations.authors', 'citations.publicationVenue', 'citations.year', 'citations.publicationTypes', 'citations.publicationDate', 'citations.journal',
        'references.title', 'references.citationCount', 'references.fieldsOfStudy','references.authors', 'references.publicationVenue', 'references.year', 'references.publicationTypes', 'references.publicationDate', 'references.journal'].join();
    const response = await fetch(url + paperId + "?fields=" + fieldsString, {
        method: "GET",
        headers: {
            "x-api-key": "ftAySEDKEx5x1V5WQ4XCt1iDvrbDJ0zuaNAkeUeH",
        }
    })
        .then((response) => response.json())
        .then((data: unknown) => { return data as PaperInformation })
        // .then((data) => data.map((d) => {
        //     d.citations = d.citations.filter((c) => c.authors != null);
        //     d.references = d.references.filter((c) => c.authors != null);
        //     return d;
        // }))
        .catch((error) => { console.log(error) });
    return response;
}

export const getDataByPaperId = (paperId: string) => {
    return useQuery({
        queryKey: [paperId],
        queryFn: () => FetchPaper(paperId)
    });
}