import { request, gql } from 'graphql-request';
import { IAnimeSearchResult } from '../Types';

export class AniList {
    constructor() {}

    public searchAnime = async (term: string): Promise<IAnimeSearchResult[]> => {
        const query = gql`
            query {
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
        `;
        const response: { Page: { media: IAnimeSearchResult[] } } = await request(
            'https://graphql.anilist.co',
            query.replace('$TERM', term),
        );
        console.log(response);
        for(const data of response.Page.media) {
            data.infoLink = `https://myanimelist.net/anime/${data.idMal}`;
            data.infoAl = `https://anilist.co/anime/${data.id}`
        }
        return response.Page.media;
    };
}
