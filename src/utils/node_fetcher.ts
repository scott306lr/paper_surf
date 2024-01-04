import { type Paper } from "~/server/server_utils/fetchHandler"

const url = 'https://api.semanticscholar.org/graph/v1/paper/'

export const getPaper = async (paperId: string, fields: string[]) => {
    const fieldsString = fields.join();
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