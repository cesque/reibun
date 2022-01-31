import axios from 'axios'
import dotenv from 'dotenv'

import fs from 'fs/promises'

dotenv.config({ path: './.env.local' })

console.log(process.env.WANIKANI_API_KEY)

let apiConfig = {
    headers: {
        Authorization: `Bearer ${ process.env.WANIKANI_API_KEY }`
    }
}

const TYPE = 'vocabulary' // or 'radical' or 'vocabulary'

let data = await getData()

await fs.writeFile(`.src/data/${ TYPE }.json`, JSON.stringify(data, null, 4))


async function getData(url) {
    if(!url) {
        let requestParams = new URLSearchParams()
        
        requestParams.set('types', TYPE)
        // requestParams.set('levels', 3)
        
        url = `https://api.wanikani.com/v2/subjects?${ requestParams.toString() }`
    }
    
    let response = await axios.get(url, apiConfig)
    let data = response.data
    console.log(url, data.total_count)
    
    return data.pages?.next_url ? data.data.concat(await getData(data.pages.next_url)) : data.data
}