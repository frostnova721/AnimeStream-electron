import cheerio from 'cheerio';
import axios from 'axios';
import { IGogoEpisodes, IAiredEpisodes } from '../Types';
import request, { gql } from 'graphql-request';
import { Animepahe, GogoStreams } from '.';

export class Episodes {
    constructor() {}

    public getAiredEpisodes = async (
        infoLink: string,
        db: 'anilist' | 'mal'
    ): Promise<IAiredEpisodes[]> => {
        if (db === 'anilist') return await this.getAiredEpisodesFromAL(infoLink);
        if (db === 'mal') return await this.getAiredEpisodesFromMal(infoLink);
        throw new Error('No DB??');
    };

    public getAiredEpisodesFromSite = async(animeName: string, site: 'gogoanime' | 'animepahe') => {
        if(site === 'gogoanime') return await this.getAiredEpisodesFromGogo(animeName)
        throw new Error('No site??')
    }

    private getAiredEpisodesFromMal = async (malEpLink: string): Promise<IAiredEpisodes[]> => {
        const url = `${malEpLink}/episode`;
        const res = await this.fetch(url);
        const $ = cheerio.load(res);

        const airedEpsTable = $('.mt8.episode_list.js-watch-episode-list');
        const tbody = airedEpsTable.children('tbody').children();
        const releasedEps = tbody.length;
        if (!airedEpsTable || !tbody || releasedEps === 0) throw new Error('No episodes');
        const episodes: IAiredEpisodes[] = [];
        tbody.each((ind, ele) => {
            const ep = {
                episodeNumber: parseInt($(ele).find('.episode-number.nowrap').text()),
                episodeTitle: $(ele).find('.episode-title.fs12').children('a').text(),
                airedDate: $(ele).find('.episode-aired.nowrap').text().replace(',', ''),
            };
            episodes.push(ep);
        });
        return episodes;
    };

    private getAiredEpisodesFromAL = async (id: string): Promise<IAiredEpisodes[]> => {
        const query = gql`
            query {
                Page(perPage: 1) {
                    media(id: $ID) {
                        streamingEpisodes {
                            title
                            thumbnail
                        }
                    }
                }
            }
        `;

        const response: {
            Page: {
                media: {
                    streamingEpisodes: {
                        title: string;
                        thumbnail: string;
                        url: string;
                        site: string;
                    }[];
                }[];
            };
        } = await request('https://graphql.anilist.co', query.replace('$ID', id));
        const media = response.Page.media;
        const episodeArray: IAiredEpisodes[] = [];
        for (const data of media[0].streamingEpisodes) {
            const ep = {
                episodeNumber: data.title.split(' - ')[0].trim(),
                episodeTitle: data.title.split(' - ')[1]?.trim() ?? '',
                imageUrl: data.thumbnail ?? '',
            };
            episodeArray.push(ep);
        }

        return episodeArray;
    };

    private getAiredEpisodesFromGogo = async(animeName: string): Promise<IGogoEpisodes[]> => {
        const gogo = new GogoStreams()
        const search = await gogo.searchForAnime(animeName, true)
        const eps = await gogo.getAnimeEpisodeLink(search[0].alias)
        const episodeArray: IGogoEpisodes[] = []
        for(let i=0; i<eps.episodes; i++) {
            episodeArray.push({ episodeNumber: i+1, link: `https://gogoanime3.net${eps.link.trim()}${i+1}`})
        }
        return episodeArray
    }

    private fetch = async (url: string, options?: any): Promise<any> => {
        if (!options) options = '';
        const res = await axios.get(url, options);
        return res.data;
    };
}
