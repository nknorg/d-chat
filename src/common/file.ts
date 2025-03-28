export class File {
  public static async read(file: File): Promise<string> {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => {
        reject(reader.error)
      }
      reader.readAsText(file)
    })
  }
}
