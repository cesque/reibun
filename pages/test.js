import * as Kuroshiro from 'kuroshiro/dist/kuroshiro.min.js'
import * as KuromojiAnalyser from 'kuroshiro-analyzer-kuromoji/dist/kuroshiro-analyzer-kuromoji'

import React, { useEffect, useCallback, useState } from 'react'

export default function Test() {
    let [kuroshiro, setKuroshiro] = useState(null)

    useEffect(() => {
        async function instantiateKuroshiro() {
            let instance = new Kuroshiro.default()
            let analyser = new KuromojiAnalyser({ dictPath: '/dicts' })

            await instance.init(analyser)

            setKuroshiro(instance)
        }

        instantiateKuroshiro()
    }, [])

    useEffect(() => {
        async function t() {
            if(kuroshiro) {
                console.log( await kuroshiro.convert(s, { to: 'hiragana' }) )
            }
        }

        t()
    }, [ kuroshiro ])


    let s = `マイケルがトーフグに入る時に間ちがえてメイン州のポートランドに引っこしてしまったことは、今でもみんなのお笑い草です。`;
    return kuroshiro == null
        ? <h1>loading...</h1>
        : <h1>loaded!</h1>

}
