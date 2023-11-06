import cheerio from 'cheerio'
import axios from 'axios'
import { IAiredEpisodes } from '../Types'

export class Episodes {
    constructor() {} 
    
    public getAiredEpisodes = async(infoLink: string, db: 'anilist' | 'mal'): Promise<IAiredEpisodes[]> => {
        if(db === 'anilist')
            return await this.getAiredEpisodesFromAL(infoLink)
        if(db === 'mal')
            return await this.getAiredEpisodesFromMal(infoLink) 
        throw new Error('No DB??')
    }

    private getAiredEpisodesFromMal = async(malEpLink: string): Promise<IAiredEpisodes[]> => {
        const url = `${malEpLink}/episode`
        const res = await this.fetch(url)
        const $ = cheerio.load(res)

        const airedEpsTable = $('.mt8.episode_list.js-watch-episode-list')
        const tbody = airedEpsTable.children('tbody').children()
        const releasedEps = tbody.length
        if(!airedEpsTable || !tbody || releasedEps === 0) throw new Error('No episodes')
        const episodes: IAiredEpisodes[] = []
        tbody.each((ind, ele) => {
            const ep = {
                episodeNumber: parseInt($(ele).find('.episode-number.nowrap').text()),
                episodeTitle: $(ele).find('.episode-title.fs12').children('a').text(),
                airedDate: $(ele).find('.episode-aired.nowrap').text().replace(',', '')
            }
            episodes.push(ep)
        })
        return episodes
    }

    private getAiredEpisodesFromAL = async(anilistEpLink: string): Promise<IAiredEpisodes[]> => {
        const url = `${anilistEpLink}/watch`
        const episodes = await this.fetch(`https://anime-stream-api-psi.vercel.app/anilistepisodes?link=${url}`)
        return episodes
    }

    private fetch = async (url: string, options?: any): Promise<any> => {
        if (!options) options = '';
        const res = await axios.get(url, options);
        return res.data;
    };
}