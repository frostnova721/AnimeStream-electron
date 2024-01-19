export interface IDownloads {
    title: string;
    path: string;
    status: 'downloaded' | 'downloading' | 'cancelled'
    size: number;
}