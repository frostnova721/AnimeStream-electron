export interface IStreamOutput {
    totalSources: number;
    sources: {
        resolution: string;
        quality: string;
        link: string;
        server: string;
    }[];
    iframe: string;
}

export interface ISearchOutput {
    name: string;
    alias: string;
    imageUrl: string;
    episodes?: number;
    episodeLink?: string;
}

export interface IMALSearch {
    name: string;
    id: number;
    infoLink: string;
    image: string;
}

export type TChara = {
    name: string;
    role: string;
    image: string;
    va: {
        name: string;
        url: string;
        image: string;
    };
};

export interface IAnimeDetails {
    title: string;
    synonyms: string;
    names: {
        japanese: string;
        english: string;
        german: string;
        spanish: string;
        french: string;
    };
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
    clickedResult: string;
    episodeId: string;
    subWindows: number;
    backTo: string;
    clickedAnilistLink: string;
    totalEpisodes: string;
};

export interface ILatestAnimes {
    image: string;
    title: string;
    score: number;
    infoLink: string;
}

export interface IAnimeSearchResult {
    id: number;
    idMal: number;
    infoAl?: string;
    infoLink: string;
    title: {
        english: string;
        romaji: string;
    };
    coverImage: {
        extraLarge: string;
        large: string;
    };
}

export interface IAiredEpisodes {
    imageUrl?: string | undefined;
    episodeNumber: number | string;
    episodeTitle: string;
    airedDate?: string | undefined;
}

export interface ISeasonResponse {
    img: string;
    url: string;
    id: number;
    title: string;
}

export interface AnimeEpisode {
    id: number;
    anime_id: number;
    episode: number;
    episode2: number;
    edition: string;
    title: string;
    snapshot: string;
    disc: string;
    audio: string;
    duration: string;
    session: string;
    filler: number;
    created_at: string;
}

export interface AnimepaheSearch {
    id: number;
    title: string;
    type: string;
    episodes: number;
    status: string;
    season: string;
    year: number;
    score: number;
    poster: string;
    session: string;
}

export interface IAiredSiteEpisodes {
    episodeNumber: number;
    link: string;
    img?: string;
    title?: string;
}

export interface IAnilistInfo {
    title: {
        romaji: string;
        english: string;
        native: string;
        userPreferred: string;
    };
    startDate: {
        year: number;
        month: number;
        day: number;
    };
    season: string;
    seasonInt: number;
    seasonYear: number;
    genres: string[];
    averageScore: number;
    popularity: number;
    isAdult: boolean;
    status: string;
    type: string;
    bannerImage: string;
}
