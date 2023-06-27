import { Readable } from 'node:stream'
import fs from 'node:fs/promises'

import { parse } from 'csv-parse'

const filePath = new URL('./tasks.csv', import.meta.url)

class ReadCsvStream extends Readable {
  async _read() {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' })

    const records = parse(content, {
      fromLine: 2,
    })

    for await(const chunk of records) {
      const taskTitle = chunk[0]
      const taskDescription = chunk[1]

      const body = JSON.stringify({ title: taskTitle, description: taskDescription })
      
      await fetch('http://localhost:3333/tasks', {
        headers: {
          'Content-type': 'application/json'
        },
        method: 'POST',
        body
      })

      console.log(`${taskTitle} created`)
    }
  }
}

new ReadCsvStream().pipe(process.stdout)