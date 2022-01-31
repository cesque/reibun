import Kuroshiro from 'kuroshiro'
import KuromojiAnalyser from 'kuroshiro-analyzer-kuromoji'

import { resolve } from 'path'

const kuroshiro = new Kuroshiro()
kuroshiro.init(new KuromojiAnalyser({
    dictPath: resolve('./src/data/dicts')
}))


export default async function handler(req, res) {
    if(!kuroshiro._analyzer) {
        res.status(503).json({
            error: 'kuroshiro is not instantiated'
        })

        return
    }

    const result = await kuroshiro.convert(req.query.q, { 
        to: 'hiragana',
        mode: 'furigana',
    })

    res.status(200).json({
        result: result
    })
}
