import axios from 'axios'
import cheerio from 'cheerio'
import { IAnimeDetails, IMALSearch, TChara } from '../Types'

export class MAL {
    constructor() {}

    private baseUrl = 'https://myanimelist.net/'

    /**
     * 
     * @param url MAL url of anime to fetch details
     * @returns details of the anime
     */
    public getAnimeDetails = async(url: string): Promise<IAnimeDetails> => {
        if(!url) throw new Error('No url')
        const res = await this.fetch(url)
        let $ = cheerio.load(res)

        const leftDiv = $('.leftside')
        const animeInfo = $('.spaceit_pad')
        const info = $('p[itemprop="description"]')
        const charactersDiv = $('.detail-characters-list')
        const titleDiv = $('h1.title-name')

        const title = titleDiv.children('strong').text().trim()

        const imgArr: string[] = []
        const infoArr: string[] = []
    
        leftDiv.each((ind, ele) => {
            const img = $(ele).children().children('a').children().attr('data-src')?.split(' ')[0].replace(/\/r\/|\d+x\d+/g, '').split('?')[0]
            if(img) imgArr.push(img)
        })
    
        animeInfo.each((ind, ele) => {
            const info = $(ele).text()
            infoArr.push(info.trim().replace(/\n/g, '').replace(/\s+/g, ' '))
    
        })
    
        const genres = infoArr.find(item => item.split(':')[0].trim() === 'Genres')?.split(':')[1].trim().split(',') ?? ''
        const genArr = []
    
        for(const genre of genres) {
            genArr.push(genre.trim().slice(-(genre.length/2)))
        }
    
        const themes = infoArr.find(item => item.split(':')[0].trim() === 'Themes')?.split(':')[1].trim().split(',') ?? ''
        const themeArr = []
    
        for(const theme of themes) {
            themeArr.push(theme.trim().slice(-(theme.length/2)))
        }
        const set: string[] = []
    
        charactersDiv.each((i, ele) => {
            const html = $(ele).html()
            if(!html)
                return false
            set.push(html)
        })
    
        $ = cheerio.load(set.join('\n'))
    
        const characters: TChara[] = []
    
        $('table[width=100%]').each((ind, ele) => {
            const chara = {} as TChara
    
            if($(ele).find('.h3_characters_voice_actors').length > 0) {
                chara.name = $(ele).find('.h3_characters_voice_actors').text() ?? ''
                chara.image = $(ele).find('.picSurround img').attr('data-src')?.split(' ')[0].replace(/\/r\/|\d+x\d+/g, '').split('?')[0] ?? ''
                chara.role = $(ele).find('.spaceit_pad small').text() ?? ''
    
                const voiceActor = $(ele).find('.va-t a')
                chara.va = {
                    name: voiceActor.text().trim() ?? '',
                    url: voiceActor.attr('href') ?? '',
                    image: $(ele).find(`.picSurround a img[alt="${voiceActor.text().trim()}"]`).attr('data-src')?.split(' ')[0].replace(/\/r\/|\d+x\d+/g, '').split('?')[0] ?? ''
                }
                
                characters.push(chara)
            }
    
        })
    
        const finalInfo = {
            title: title,
            synonyms: infoArr.find(item => item.split(':')[0].trim() === 'Synonyms')?.split(':')[1].trim() ?? '',
            names: {
                japanese: infoArr.find(item => item.split(':')[0].trim() === 'Japanese')?.split(':')[1].trim() ?? '',
                english: infoArr.find(item => item.split(':')[0].trim() === 'English')?.split(':')[1].trim() ?? '',
                german: infoArr.find(item => item.split(':')[0].trim() === 'German')?.split(':')[1].trim() ?? '',
                spanish: infoArr.find(item => item.split(':')[0].trim() === 'Spanish')?.split(':')[1].trim() ?? '',
                french: infoArr.find(item => item.split(':')[0].trim() === 'French')?.split(':')[1].trim() ?? '',
            },
            cover: imgArr[0],
            genres: genArr,
            themes: themeArr,
            synopsis: info.text().trim(),
            source: infoArr.find(item => item.split(':')[0].trim() === 'Source')?.split(':')[1].trim() ?? '',
            type: infoArr.find(item => item.split(':')[0].trim() === 'Type')?.split(':')[1].trim() ?? '',
            episodes: infoArr.find(item => item.split(':')[0].trim() === 'Episodes')?.split(':')[1].trim() ?? '',
            status: infoArr.find(item => item.split(':')[0].trim() === 'Status')?.split(':')[1].trim() ?? '',
            aired: infoArr.find(item => item.split(':')[0].trim() === 'Aired')?.split(':')[1].trim() ?? '',
            premiered: infoArr.find(item => item.split(':')[0].trim() === 'Premiered')?.split(':')[1].trim() ?? '',
            broadcast: infoArr.find(item => item.split(':')[0].trim() === 'Broadcast')?.split(':')[1].trim() ?? '',
            producers: infoArr.find(item => item.split(':')[0].trim() === 'Producers')?.split(':')[1].trim().split(', ') ?? [],
            licensors: infoArr.find(item => item.split(':')[0].trim() === 'Licensors')?.split(':')[1].trim().split(', ') ?? [],
            studios: infoArr.find(item => item.split(':')[0].trim() === 'Studios')?.split(':')[1].trim() ?? '',
            duration: infoArr.find(item => item.split(':')[0].trim() === 'Duration')?.split(':')[1].trim() ?? '',
            rating: infoArr.find(item => item.split(':')[0].trim() === 'Rating')?.split(':')[1].trim() ?? '',
            score: parseFloat(infoArr.find(item => item.split(':')[0].trim() === 'Score')?.split(':')[1].trim().split(' ')[0].replace('#', '') ?? ''),
            popularity: parseInt(infoArr.find(item => item.split(':')[0].trim() === 'Popularity')?.split(':')[1].trim().replace('#', '') ?? ''),
            characters: characters
        }

        return finalInfo
    }

    public searchForAnime = async(searchTerm: string): Promise<IMALSearch[]> => {
        const url = `${this.baseUrl}anime.php?q=${searchTerm}&cat=anime`
        const res = await this.fetch(url)
        const $ = cheerio.load(res)
        const results: IMALSearch[]  = []
        const searchResults = $('.js-categories-seasonal > table tr')
        searchResults.each((ind, ele) => {
            const a = $(ele).children().children().children('a')
            const img = a.children().attr('data-srcset')
            const href = a.attr('href')
            if(href && img) {
                const name = a.children('strong').text()
                const id = parseInt(href.split('/')[href.split('/').length - 2])
                const split = img.split(',')
                results.push(
                    {
                        name: name,
                        id: id,
                        infoLink: href,
                        image: split[0].split(' ')[0].replace(/\/r\/|\d+x\d+/g, '').split('?')[0]
                    }
                )
            }
        })

        return results;
    }

    private fetch = async(url: string, options?: any): Promise<any> => {
        if(!options) options = ''
        const res = await axios.get(url, options)
        return res.data
    }
}