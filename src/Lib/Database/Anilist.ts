import { request, gql } from 'graphql-request';
import { IAnilistInfo, IAnimeSearchResult, ISeasonResponse } from '../../Types';
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
        const query = `{
            Page(perPage: 100) {
              media(sort: [START_DATE_DESC], type: ANIME, format: TV, status: RELEASING) {
                id
                title {
                  romaji
                  english
                }
                startDate {
                  year
                  month
                  day
                }
                episodes
                coverImage {
                  large
                  medium
                  color
                }
              }
            }
          }`;
        const response: any = await request('https://graphql.anilist.co', query);
        return response.Page.media as ISeasonResponse[];
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

    public getALInfo = async (id: string): Promise<IAnilistInfo> => {
        const query = gql`
            {
                Page(perPage: 100) {
                    media(id: $Id) {
                        title {
                            romaji
                            english
                            native
                            userPreferred
                        }
                        startDate {
                            year
                            month
                            day
                        }
                        season
                        seasonInt
                        seasonYear
                        genres
                        averageScore
                        popularity
                        isAdult
                        status
                        type
                        bannerImage
                    }
                }
            }
        `;
        const res: any = await request('https://graphql.anilist.co', query.replace('$Id', `${id}`));
        return res.Page.media[0] as IAnilistInfo;
    };
}
