import { request, gql } from 'graphql-request';
import {
    IAnilistInfo,
    IAnilistInfoResult,
    IAnimeDetails,
    IAnimeSearchResult,
    ISeasonResponse,
} from '../../Types';

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

    public getAnimeInfo = async (anilistId: string): Promise<IAnimeDetails> => {
        const query = gql`{
            Page(perPage: 100) {
              media(id: ${anilistId}) {
                title {
                  romaji
                  english
                  native
                  userPreferred
                }
                synonyms
                coverImage {
                  large
                  medium
                }
                genres
                description
                source
                type
                episodes
                status
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
                tags {
                  name
                  category
                }
                startDate {
                  year
                  month
                  day
                },
                endDate {
                  year
                  month
                  day
                },
                meanScore
                studios {
                  edges {
                    node {
                      isAnimationStudio
                      name
                      id
                    }
                  }
                }
                duration
                popularity
                characters {
                  edges {
                    node {
                      name {
                        full
                        native
                      }
                      image {
                        large
                        medium
                      }
                    }
                    role
                  }
                }
              }
            }
          }
        `;
        try {
            const response: { Page: { media: IAnilistInfoResult[] } } = await request(
                'https://graphql.anilist.co',
                query,
            );
            const convertToIAnimeDetails = (): IAnimeDetails => {
                const info = response.Page.media[0];
                const characters: {
                    name: string;
                    role: string;
                    image: string;
                }[] = [];

                info.characters.edges.forEach((character) => {
                    characters.push({
                        name: character.node.name.full,
                        role: character.role,
                        image: character.node.image.large ?? character.node.image.medium,
                    });
                });

                const studios: string[] = [];

                info.studios.edges.forEach((studio) => {
                    if (studio.node.isAnimationStudio) {
                        studios.push(studio.node.name);
                    }
                });

                const convertedGuy: IAnimeDetails = {
                    title: {
                        english: info.title.english,
                        native: info.title.native,
                        romaji: info.title.romaji,
                    },
                    aired: {
                        start: `${info.startDate.day ?? ''} ${
                            this.MonthnumberToMonthName(info.startDate.month)?.short ?? ''
                        } ${info.startDate.year ?? ''}`,
                        end: `${info.endDate.day ?? ''} ${
                            this.MonthnumberToMonthName(info.endDate.month)?.short ?? ''
                        } ${info.endDate.year ?? ''}`,
                    },
                    cover: info.coverImage.large ?? info.coverImage.medium,
                    duration: `${info.duration ? info.duration + ' minutes' : '??'}`,
                    episodes: info.episodes,
                    genres: info.genres,
                    characters: characters,
                    nextAiringEpisode: {
                        airingAt: info.nextAiringEpisode?.airingAt ?? '',
                        timeLeft: info.nextAiringEpisode?.timeUntilAiring ?? '',
                        episode: info.nextAiringEpisode?.episode ?? '',
                    },
                    rating: info.meanScore / 10 ?? null,
                    status: info.status,
                    type: info.type,
                    studios: studios,
                    synonyms: info.synonyms,
                    synopsis: info.description,
                    tags: info.tags.map((tag) => tag.name),
                };
                return convertedGuy;
            };

            return convertToIAnimeDetails();
        } catch (err) {
            console.log(err);
            throw new Error('Error Getting Anime Details');
        }
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

    private MonthnumberToMonthName = (
        monthNumber: number | string,
    ): { full: string; short: string } | undefined => {
        if (typeof monthNumber === 'string') monthNumber = parseInt(monthNumber);
        if (monthNumber > 12 || monthNumber < 1) return undefined;
        const monthName = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return {
            full: monthName[monthNumber],
            short: monthName[monthNumber].slice(0, 3),
        };
    };
}
