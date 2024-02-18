import axios from 'axios';
import { IStreamOutput } from '../../Types';
const CryptoJS = require('crypto-js');
import { load } from 'cheerio';

export class Gogo {
    constructor() {}

    private readonly keys = {
        key: CryptoJS.enc.Utf8.parse('37911490979715163134003223491201'),
        secondKey: CryptoJS.enc.Utf8.parse('54674138327930866480207815084989'),
        iv: CryptoJS.enc.Utf8.parse('3134003223491201'),
    };

    private readonly baseUrl = `https://gogoanime3.net`;

    public extractGogo = async (
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
        // console.log(`${encryptedKey}`)
        const decrypted = await this.decrypt(episodeLink);

        const params = `id=${encryptedKey}&alias=${id}&${decrypted}`;
        console.log(`${episodeLink.protocol}//${episodeLink.hostname}/encrypt-ajax.php?${params}`)

        const encryptedData = (
            await axios.get(
                `${episodeLink.protocol}//${episodeLink.hostname}/encrypt-ajax.php?${params}`,
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            )
        ).data;

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
        const streamMetadata: string = (await axios.get(streamLink)).data;
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

    private getEncryptedKey = async (id: string) => {
        const encryptedKey = CryptoJS.AES.encrypt(id, this.keys.key, {
            iv: this.keys.iv,
        });

        return encryptedKey;
    };

    private decrypt = async (streamLink: URL) => {
        const res = await axios.get(streamLink.href);
        const $ = load(res.data);
        const value = $('script[data-name="episode"]').attr('data-value') as string;
        if (!value) return;
        const decrypted = CryptoJS.AES.decrypt(value, this.keys.key, {
            iv: this.keys.iv,
        }).toString(CryptoJS.enc.Utf8);

        return decrypted;
    };

    private getIframeLink = async (epurl: string): Promise<string | undefined> => {
        const res = (await axios.get(epurl)).data;
        const $ = load(res);
        const link = $('iframe').attr('src');
        if (!link) return undefined;
        return link;
    };
}
