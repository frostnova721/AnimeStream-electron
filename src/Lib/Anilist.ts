import Anilist, { AnimeEntry } from 'anilist-node'

export class AniList {
    constructor() {}

    public searchAnime = async(term: string): Promise<AnimeEntry[]> => {
        const anilist = new Anilist()
        const result = (await anilist.searchEntry.anime(term, undefined, undefined, 20)).media
        const reqRes = []
        for(const res of result) {
            const animeInfo = await anilist.media.anime(res.id)
            reqRes.push(animeInfo)
        }

        return reqRes
    }
}

export type AnilistResult = AnimeEntry