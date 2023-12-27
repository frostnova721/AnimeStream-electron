import axios from 'axios';
import cheerio from 'cheerio';
import { ISearchOutput, IStreams } from '../../Types';
import { Gogo, StreamWish } from '..';

export class GogoStreams {
    constructor() {}

    private readonly baseUrl = `https://gogoanime3.net`;
    private readonly ajaxUrl = `https://ajax.gogo-load.com/ajax`;

    public searchForAnime = async (
        searchTerm: string,
        onlySearch: boolean,
    ): Promise<ISearchOutput[]> => {
        const searchUrl = `${this.baseUrl}/search.html?keyword=${encodeURIComponent(searchTerm)}`;
        const res = await axios.get(searchUrl);
        const $ = cheerio.load(res.data);
        const titles = $('.items p.name');
        const imgs = $('.img');
        const list: string[] = [];
        const links: string[] = [];
        const images: string[] = [];
        titles.each((ind, ele) => {
            const pt = $(ele).text().replace(/\s+/g, ' ').trim();
            list.push(pt);
            const link = $(ele).children().attr('href');
            if (!link) return false;
            links.push(link.replace('/category/', ''));
        });
        imgs.each((ind, ele) => {
            const i = $(ele).children().children().attr('src');
            if (!i) return false;
            images.push(i);
        });
        if (list.length === 0) {
            console.error('No results');
            throw new Error('No results');
        }
        const searchResults = [];
        for (const item of list) {
            try {
                if (onlySearch) {
                    searchResults.push({
                        name: item,
                        alias: links[list.indexOf(item)],
                        imageUrl: images[list.indexOf(item)],
                    });
                } else {
                    const extraa = await this.getAnimeEpisodeLink(links[list.indexOf(item)]);
                    searchResults.push({
                        name: item,
                        alias: links[list.indexOf(item)],
                        imageUrl: images[list.indexOf(item)],
                        episodes: extraa.episodes,
                        episodeLink: `${this.baseUrl}${extraa.link.trim()}`,
                    });
                }
            } catch (err) {
                console.log('err');
            }
        }

        return searchResults;
    };

    /**
     *
     * @param episodeId episodeid from gogo or link to that episode (required)
     * @param quality to filter the streams by quality (optional)
     * @returns
     */
    public getStreams = async (
        episodeId: string,
        quality?: '360' | '480' | '720' | '1080',
    ): Promise<IStreams[]> => {
        const gogo = new Gogo()
        const streamWish = new StreamWish()
        const servers = await this.getAllServerLinks(episodeId)
        let streamwish: IStreams[] = [], filelions: IStreams[] = [], vidStreaming: IStreams[] = []

        try {
            streamwish = await streamWish.extractStreamWish(servers.find(item => item.src.includes('awish.pro'))?.src ?? '')
        } catch(err) {
            //ignore
            console.log(err)
        }
        try {
            filelions = await streamWish.extractStreamWish(servers.find(item => item.src.includes('alions.pro'))?.src ?? '')
        } catch(err) {
            //ignore
            console.log(err)
        }
        try {
            // vidStreaming = (await gogo.extractGogo(episodeId, quality)).sources
        } catch(err) {
            //ignore
        }
        
        const resultArray = [...streamwish, ...filelions, ...vidStreaming]

        if(resultArray.length < 1) throw new Error('No_Streams_Found_(sus)')

        return resultArray;
    };

    private fetch = async (url: string, options?: any) => {
        if (!options) options = '';
        const res = await axios.get(url, options);
        return res.data;
    };    

    public getAnimeEpisodeLink = async (
        aliasId: string,
    ): Promise<{ link: string; episodes: number }> => {
        const url = `${this.baseUrl}/category/${aliasId}`;
        const res = await this.fetch(url);
        let $ = cheerio.load(res);

        const epStart = $('.anime_video_body > ul > li > a').attr('ep_start');
        const epEnd = $('.anime_video_body > ul > li:last-child > a').attr('ep_end');
        if (!epEnd) throw new Error('Couldnt find end Eps');
        const alias = $('#alias_anime').attr('value');
        const movieId = $('#movie_id').attr('value');

        const ajaxurl = `${this.ajaxUrl}/load-list-episode?ep_start=${epStart}&ep_end=${epEnd}&id=${movieId}&default_ep=0&alias=${alias}`;
        const ajaxres = await this.fetch(ajaxurl);
        $ = cheerio.load(ajaxres);
        // const eps = $('.name').text().replace(/EP/g, '').split(' ')
        // const SoD = $('.cate').text().replace(/(SUB|DUB)/g, "$1 ").split(' ')
        const link = $('a').attr('href');
        if (!link) throw new Error('No links found');
        const split = link.split('-');
        return { link: `${split.slice(0, -1).join('-')}-`, episodes: parseInt(epEnd) };
    };

    public getAllServerLinks = async(epUrl: string) => {
        const res = await this.fetch(epUrl)
        const $ = cheerio.load(res)
        const serverArray: { server: string, src: string }[] = []
        $('div.anime_muti_link > ul > li').each((i,e) => {
            const serverName = $(e).attr('class') ?? ''
            const src = $(e).children('a').attr('data-video') ?? ''
            serverArray.push({
                server: serverName === 'anime' ? 'vidstreaming' : serverName,
                src: src
            })
        })
        return serverArray
    }
}
