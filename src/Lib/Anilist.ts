import { request, gql } from 'graphql-request'
import { IAnilistResult } from '../Types'

export class AniList {
    constructor() {}

    public searchAnime = async(term: string): Promise<IAnilistResult[]> => {
        const query = gql`query {
            Page(perPage: 10) {
              media(search: "$TERM", type: ANIME) {
                id
                idMal
                title {
                  english
                  romaji
                }
                coverImage {
                  extraLarge
                  large
                }
              }
            }
          }
        ` 
        const response: { Page: { media: IAnilistResult[]}} = await request('https://graphql.anilist.co', query.replace('$TERM', term))
        console.log(response)
        return response.Page.media
    }
}

