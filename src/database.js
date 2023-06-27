import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)


export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, { encoding: "utf8" })
      .then(data => this.#database = JSON.parse(data))
      .catch(() => {
        this.#persist()
      })
  }


  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(tableName, search) {
    let data = this.#database[tableName] ?? []

    if(search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => row[key].toLowerCase().includes(value.toLowerCase()))
      })
    }

    return data
  }

  insert(tableName,data) {
    if(!this.#database[tableName]) this.#database[tableName] = []

    this.#database[tableName].push(data)

    this.#persist()

    return data
  }

  delete(tableName, id) {
    const rowIndex = this.#database[tableName].findIndex(row => row.id === id)

    if(rowIndex < 0) return
    
    this.#database[tableName].splice(rowIndex, 1)

    this.#persist()
  }

  update(tableName, id, data) {
    const rowIndex = this.#database[tableName].findIndex(row => row.id === id)

    if(rowIndex < 0) return
    
    this.#database[tableName][rowIndex] = {id, ...data}

    this.#persist()
  } 

}