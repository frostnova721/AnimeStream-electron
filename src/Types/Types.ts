export interface IStreamOutput {
    totalSources: number, 
    sources: {
        resolution: string,
        quality: string,
        link: string
    }[],
    iframe: string
}

export interface ISearchOutput {
    name: string;
    alias: string;
    imageUrl: string;
    episodes: number;
    episodeLink: string;
}

export interface IMALSearch {
    name: string;
    id: number;
    infoLink: string;
    image: string
}

export type TChara = {
    name: string;
    role: string;
    image: string;
    va: {
        name:string;
        url: string;
        image: string;
    }
}

export interface IAnimeDetails {
    synonyms: string;
    names: {
        japanese: string;
        english: string;
        german: string;
        spanish: string;
        french: string;
    },
    cover: string;
    genres: string[];
    themes: string[];
    synopsis: string;
    source: string;
    type: string;
    episodes: string;
    status: string;
    aired: string;
    premiered: string;
    broadcast: string;
    producers: string[];
    licensors: string[];
    studios: string;
    duration: string;
    rating: string;
    score: number;
    popularity: number;
    characters: TChara[];
}

export type TGlobalVar = {
    clickedResult: string ;
    episodeId: string
}