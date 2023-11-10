import { request, gql } from 'graphql-request';
import { IAnimeSearchResult, ISeasonResponse } from '../Types';
import axios from 'axios';

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
        for (const data of response.Page.media) {
            data.infoLink = `https://myanimelist.net/anime/${data.idMal}`;
            data.infoAl = `https://anilist.co/anime/${data.id}`;
        }
        return response.Page.media;
    };

    public getThisSeason = async (): Promise<ISeasonResponse[]> => {
        const res = await axios.get('https://anime-stream-api-psi.vercel.app/alseason');
        return res.data;
    };

    public getMalIdFromAlId = async (
        anilistId: number,
    ): Promise<{ IdMal: number; malLink: string }> => {
        if (!anilistId) throw new Error('No AL Id!');
        const query = gql`
            query {
                Page(perPage: 1) {
                    media(id: $Id, type: ANIME) {
                        idMal
                    }
                }
            }
        `;

        const response: any = await request(
            'https://graphql.anilist.co',
            query.replace('$Id', `${anilistId}`),
        );

        const updatedResponse = {
            IdMal: response.Page.media[0].idMal,
            malLink: `https://myanimelist.net/anime/${response.Page.media[0].idMal}`,
        };
        return updatedResponse;
    };
}
