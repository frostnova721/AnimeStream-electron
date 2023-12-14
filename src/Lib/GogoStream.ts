import axios from 'axios';
import cheerio from 'cheerio';
import { ISearchOutput, IStreamOutput } from '../Types';
const CryptoJS = require('crypto-js');

export class GogoStreams {
    constructor() {}

    private readonly keys = {
        key: CryptoJS.enc.Utf8.parse('37911490979715163134003223491201'),
        secondKey: CryptoJS.enc.Utf8.parse('54674138327930866480207815084989'),
        iv: CryptoJS.enc.Utf8.parse('3134003223491201'),
    };

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
    ): Promise<IStreamOutput> => {
        //gives vidstreaming links
        if (!episodeId.startsWith(this.baseUrl)) {
            episodeId = `${this.baseUrl}/${episodeId}`;
        }
        const streamLink = await this.getIframeLink(episodeId);
        if (!streamLink) {
            throw new Error('No stream link found!');
        }
        const episodeLink = new URL(streamLink);
        const id = episodeLink.searchParams.get('id') ?? '';

        const encryptedKey = await this.getEncryptedKey(id);
        const decrypted = await this.decrypt(episodeLink);

        const params = `id=${encryptedKey}&alias=${id}&${decrypted}`;

        const encryptedData = await this.fetch(
            `${episodeLink.protocol}//${episodeLink.hostname}/encrypt-ajax.php?${params}`,
            {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            },
        );

        const decryptedData = CryptoJS.enc.Utf8.stringify(
            CryptoJS.AES.decrypt(encryptedData.data, this.keys.secondKey, {
                iv: this.keys.iv,
            }),
        );

        const parsedData = JSON.parse(decryptedData);

        const qualityList: any[] = [];

        for (const src of parsedData.source) {
            qualityList.push(await this.generateQualitiesFromBaseStreamLink(src.file));
        }

        for (const src of parsedData.source_bk) {
            qualityList.push(await this.generateQualitiesFromBaseStreamLink(src.file, true));
        }

        const concatedList: any[] = [].concat(...qualityList);

        if (quality) {
            const specificArray = [];
            for (const source of concatedList) {
                if (parseInt(source.quality.replace('p', '')) === parseInt(quality)) {
                    specificArray.push(source);
                }
            }
            if (!specificArray || specificArray.length === 0) {
                throw new Error(`Couldnt find any streams with quality ${quality}`);
            }
            return {
                totalSources: specificArray.length,
                sources: specificArray,
                iframe: parsedData.linkiframe,
            };
        }

        return {
            totalSources: concatedList.length,
            sources: concatedList,
            iframe: parsedData.linkiframe,
        };
    };

    private generateQualitiesFromBaseStreamLink = async (
        streamLink: string,
        backup?: boolean,
    ): Promise<{ resolution: string; quality: string; link: string }[]> => {
        const qualityArray = [];
        const streamMetadata: string = await this.fetch(streamLink);
        const regex = /RESOLUTION=(\d+x\d+),NAME="([^"]+)"\n([^#]+)+/g;
        const matchedData = streamMetadata.match(regex);
        if (!matchedData) throw new Error('No Matches while reading the stream');
        for (let item of matchedData) {
            let edit: string | string[] = item.trim().replace(/\n\s+|,|\n/g, ' ');
            edit = edit.replace(/RESOLUTION=|NAME=/g, '');
            edit = edit.split(' ');
            const obj = {
                resolution: edit[0],
                quality: edit[1].replace(/"/g, ''),
                link: `${streamLink.split('/').slice(0, -1).join('/')}/${edit[2]}`,
                server: backup ? 'vidstreaming' : 'vidstreaming backup',
            };
            qualityArray.push(obj);
        }

        return qualityArray;
    };

    private fetch = async (url: string, options?: any) => {
        if (!options) options = '';
        const res = await axios.get(url, options);
        return res.data;
    };

    private getEncryptedKey = async (id: string) => {
        const encryptedKey = CryptoJS.AES.encrypt(id, this.keys.key, {
            iv: this.keys.iv,
        });

        return encryptedKey;
    };

    private getIframeLink = async (epurl: string): Promise<string | undefined> => {
        const res = await this.fetch(epurl);
        const $ = cheerio.load(res);
        const link = $('iframe').attr('src');
        if (!link) return undefined;
        return link;
    };

    private decrypt = async (streamLink: URL) => {
        const res = await this.fetch(streamLink.href);
        const $ = cheerio.load(res);
        const value = $('script[data-name="episode"]').attr('data-value') as string;
        if (!value) return;
        const decrypted = CryptoJS.AES.decrypt(value, this.keys.key, {
            iv: this.keys.iv,
        }).toString(CryptoJS.enc.Utf8);

        return decrypted;
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
}
