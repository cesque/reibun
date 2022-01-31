import Kuroshiro from 'kuroshiro'
import KuromojiAnalyser from 'kuroshiro-analyzer-kuromoji'

const kuroshiro = new Kuroshiro()
kuroshiro.init(new KuromojiAnalyser())

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

    console.log(result)

    res.status(200).json({
        result: result
    })
}
