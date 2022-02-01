import classNames from 'classnames'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useCallback, useState, createRef } from 'react'
import styles from '../styles/Home.module.scss'

import { ReiIcon, BunIcon } from '../src/data/icons'

import * as Kuroshiro from 'kuroshiro/dist/kuroshiro.min.js'
import * as KuromojiAnalyser from 'kuroshiro-analyzer-kuromoji/dist/kuroshiro-analyzer-kuromoji'

export default function Home() {
    let [loading, setLoading] = useState(true)

    let [sentences, setSentences] = useState([])
    let [sentence, setSentence] = useState(false)
    let [levels, setLevels] = useState(new Array(60).fill(0).map((_, i) => {
        return {
            level: i + 1,
            enabled: false,
        }
    }))
    let [showEnglish, setShowEnglish] = useState(false)
    let [showLevelSelect, setShowLevelSelect] = useState(false)

    let [kuroshiro, setKuroshiro] = useState(null)
    let [furigana, setFurigana] = useState(null)

    let [levelDragState, setLevelDragState] = useState(null)
    const serverURL = '' //process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${ process.env.NEXT_PUBLIC_VERCEL_URL }` : process.env.NEXT_PUBLIC_SERVER_ADDRESS

    useEffect(() => {
        setShowEnglish(false)
        getRandomSentence()
    }, [ sentences ])

    useEffect(() => {
        fetchSentences()

        try {
            let levelsFromStorage = localStorage.getItem('levels')

            if(levelsFromStorage && (levelsFromStorage.updated == process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA)) {
                setLevels(JSON.parse(levelsFromStorage).levels)
            }
        } catch(e) {
            console.warn(e)
        }

        try {
            async function instantiateKuroshiro() {
                let instance = new Kuroshiro.default()
                let analyser = new KuromojiAnalyser({ dictPath: '/dicts' })

                await instance.init(analyser)

                setKuroshiro(instance)
            }

            instantiateKuroshiro()
        } catch(e) {
            console.warn(e)
        }
    }, [ ])

    useEffect(() => {
        setShowEnglish(false)
        setFurigana(null)

        async function getFurigana() {
            if(sentence && kuroshiro) {
                // console.log('getting furigana: ', sentence)
                setFurigana(await kuroshiro.convert(sentence.ja, { to: 'hiragana', mode: 'furigana' }))
            }
        }

        getFurigana()
    }, [ sentence ])

    async function fetchSentences() {
        setLoading(true)
        let searchParams = new URLSearchParams()

        if(levels.some(level => level.enabled)) {
            let levelString = levels
                .filter(level => level.enabled)
                .map(level => level.level)
                .join(',')

            searchParams.set('levels', levelString)
        }

        let response = await fetch(`${ serverURL }/api/getSentencesForLevels?${ searchParams.toString() }`)
        let sentences = await response.json()

        setLoading(false)

        setSentences(sentences)
    }

    const getRandomSentence = useCallback(() => {
        if(sentences.length > 0) {
            let randomSentence = sentences[Math.floor(Math.random() * sentences.length)]
    
            setSentence(randomSentence)
        } else {
            setSentence(null)
        }
    }, [ sentences ])
    
    function toggleLevelState(i) {
        let newLevels = levels.slice()

        let level = newLevels.find(level => level.level == i)
        level.enabled = !level.enabled

        setLevels(newLevels)
    }

    function setLevelState(i, value) {
        let newLevels = levels.slice()

        let level = newLevels.find(level => level.level == i)
        level.enabled = value

        setLevels(newLevels)
    }

    function setAllLevelsState(value) {
        setLevels(levels.map(level => {
            return {
                ...level,
                enabled: value,
            }
        }))
    }

    function getSentenceContent() {
        if(sentence == null) {
            let classes = classNames([styles.sentences, styles.sentencesError])
            let englishClasses = classNames([ styles.english, styles.englishVisible ])

            return <section className={ classes }>
                <h2 className={ styles.japanese }>【・_・?】</h2>
                <h3 className={ englishClasses }>maybe select some lower levels?</h3>
            </section>
        }

        let japaneseClasses = classNames(styles.japanese, {
            [styles.japaneseFuriganaAvailable]: furigana != null,
            [styles.japaneseFuriganaVisible]: showEnglish,
        })

        let englishClasses = classNames(styles.english, {
            [styles.englishVisible]: showEnglish,
        })


        return <section className={ styles.sentences }>
            <h2 className={ japaneseClasses }>
                { furigana ? <span dangerouslySetInnerHTML={ { __html: furigana } } /> : sentence.ja }
            </h2>
            <h3 className={ englishClasses }>{ sentence.en }</h3>
        </section>
    }

    function getLevelsContent() {
        let list = []
        
        for(let level of levels) {

            let classes = classNames(styles.level, {
                [styles.levelEnabled]: level.enabled,
            })

            let listElement = <li 
                className={ classes }
                key={ level.level }
                onMouseDown={ () => { setLevelDragState(!level.enabled); toggleLevelState(level.level) } }
                onMouseEnter={ () => { if(levelDragState != null) setLevelState(level.level, levelDragState) } }
            >
                { level.level } 
            </li>

            list.push(listElement)
        }

        let listRef = createRef()

        return <section className={ styles.levelsSection } onMouseUp={ () => setLevelDragState(null) }>
            <div className={ styles.levelsSectionInner }>
                <ol className={ styles.list } onMouseDown={ event => { if(event.target == listRef.current) setLevelDragState(true) } } ref={ listRef }>
                    { list }
                </ol>

                <div className={ styles.levelSelectHelpers }>
                    <button className={ styles.levelSelectHelper } type="button" onClick={ () => setAllLevelsState(true) }>select all</button>
                    <button className={ styles.levelSelectHelper } type="button" onClick={ () => setAllLevelsState(false) }>deselect all</button>
                </div>

                <button 
                    className={ styles.closeLevelsButton }
                    type="button"
                    onClick={ () => { 
                        try {
                            localStorage.setItem('levels', JSON.stringify({
                                updated: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || null,
                                levels
                            }))
                        } catch(e) {
                            console.warn(e)
                        }

                        setShowLevelSelect(false)
                        fetchSentences()
                    } }>
                    save
                </button>
            </div>
        </section>
    }

    let loadingModalClasses = classNames(styles.loadingFuriganaModal, {
        [styles.loadingFuriganaModalVisible]: kuroshiro == null
    })

    function getLoadingContent() {
        let classes = classNames([styles.sentences, styles.sentencesError])
        let englishClasses = classNames([ styles.english, styles.englishVisible ])

        return <section className={ classes }>
            <h2 className={ styles.japanese }>【・_・&apos;】・・・</h2>
            <h3 className={ englishClasses }>loading...</h3>
        </section>
    }

    function getContent() {
        return <>
            { getSentenceContent() }

            <section className={ styles.actions }>
                { showEnglish 
                    ? <button className={ styles.nextButton } type="button" onClick={ () => getRandomSentence() }>next</button>
                    : <button className={ styles.showButton } type="button" onClick={ () => setShowEnglish(true) }>show</button>
                }
                <button className={ styles.selectLevelsButton } type="button" onClick={ () => setShowLevelSelect(true) }>select levels</button>
            </section>

            { showLevelSelect && getLevelsContent() }

            <div className={ loadingModalClasses }>
                loading furigana...
            </div>
        </>
    }

    return (
        <div className={ styles.container }>
            <Head>
                <title>例文 - reibun</title>
                <meta name="description" content="practice your kanji with example sentences from wanikani" />
                <link rel="icon" href={ `data:image/svg+xml;base64,${ btoa(showEnglish ? BunIcon : ReiIcon) }` } sizes="any" type="image/svg+xml" />
            </Head>

            <header className={ styles.header }>
                <Link href="/">
                    <a className={ styles.headerReibun } onClick={ () => window.location.reload() }>
                        <ruby>
                            例 <rp>(</rp><rt>rei</rt><rp>)</rp>
                            文 <rp>(</rp><rt>bun</rt><rp>)</rp>
                        </ruby>
                    </a>
                </Link>
                <div className={ styles.attribution }>
                    by <a className={ styles.cesque } href="https://twitter.com/cesque">@cesque</a>
                </div>
            </header>

            <main className={ styles.main }>
                { loading ? getLoadingContent() : getContent() }
            </main>
        </div>
    )
}
