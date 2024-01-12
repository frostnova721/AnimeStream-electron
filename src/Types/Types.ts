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

export interface IMALInfoResult {
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
    id: number;
    title: {
        romaji: string;
        english: string;
    };
    startDate: {
        year: number;
        month: number;
        day: number;
    };
    episodes: number;
    coverImage: {
        large: string;
        medium: string;
        color: string;
    };
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

export interface IStreams {
    link: string;
    server: string;
    quality: string;
}

export interface IAnilistInfoResult {
    title: {
      romaji: string;
      english: string;
      native: string;
      userPreferred: string;
    };
    synonyms: string[];
    coverImage: {
      large: string;
      medium: string;
    };
    genres: string[];
    description: string;
    source: string;
    type: string;
    episodes: number;
    status: string;
    nextAiringEpisode?: {
      episode: number;
      airingAt: number;
      timeUntilAiring: number;
    };
    tags: {
      name: string;
      category: string
      }[]
    startDate: {
        year: number;
        month: number;
        day: number;
      };
    endDate: {
        year: number;
        month: number;
        day: number;
    };
    meanScore: number;
    studios: {
      edges: {
        node: {
          isAnimationStudio: boolean;
          name: string;
          id: string;
        };
      }[];
    };
    duration: number;
    popularity: number;
    characters: {
      edges: {
        node: {
          name: {
            full: string;
            native: string;
          };
          image: {
            large: string;
            medium: string
          }
        };
        role: string;
      }[];
    };
}

export interface IAnimeDetails {
    title: {
        english: string;
        romaji: string;
        native: string;
    };
    synonyms: string[];
    aired: {
        start: string;
        end: string;
    };
    studios: string[];
    characters: {
        name: string;
        role: string;
        image: string;
    }[];
    nextAiringEpisode?: {
        episode: string | number;
        airingAt: string | number;
        timeLeft: string | number;
    };
    duration: string;
    cover: string;
    genres: string[];
    rating: number;
    status: string;
    type: string;
    synopsis: string;
    episodes: string | number;
    tags?: string[]
}
