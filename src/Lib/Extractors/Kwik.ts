import axios from 'axios'

export class Kwik {
    constructor() {}
    public extractKwik = async (videoUrl: string): Promise<{ url: string; isM3U8: boolean }> => {
        //run on api due to issues with electron ig
        // try {
        //     const { data } = await axios.get(`${videoUrl.href}`, {
        //         headers: { Referer: 'https://animepahe.ru' },
        //     });

        //     const source = eval(
        //         /(eval)(\(f.*?)(\n<\/script>)/s.exec(data)![2].replace('eval', ''),
        //     ).match(/https.*?m3u8/);

        //     const sources = {
        //         url: source[0],
        //         isM3U8: source[0].includes('.m3u8'),
        //     };

        //     return sources;
        // } catch (err) {
        //     throw new Error(err as string);
        // }
        const data = (
            await axios.get(`https://anime-stream-api-psi.vercel.app/kwik?link=${videoUrl}`)
        ).data;
        return data;
    };
}