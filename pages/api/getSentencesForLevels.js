import Kuroshiro from 'kuroshiro'
import kanji from '@/data/kanji.json'
import vocab from '@/data/vocabulary.json'

export default async function handler(req, res) {
    let levels = new Array(29).fill(0).map((x, i) => i + 1)

    if(req.query.levels) {
        try {
            levels = req.query.levels.split(',').map(i => parseInt(i))
        } catch(e) {
            console.warn(e)
        }
    }

    let knownKanji = kanji.filter(k => levels.includes(k.data.level))

    let sentences = vocab.map(v => v.data.context_sentences).flat()

    let knownSentences = sentences.filter(sentence => {
        // check if sentence only contains kanji we know

        for(let character of sentence.ja) {
            if(Kuroshiro.Util.isKanji(character) && !knownKanji.find(k => k.data.characters == character)) {
                // we found a kanji in this sentence which we don't know
                return false
            }
        }

        return true
    })

    res.status(200).json(knownSentences)
}
