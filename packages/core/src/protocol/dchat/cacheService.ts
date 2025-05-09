import { CacheSchema } from '../../schema/cache'
import { logger } from '../../utils/log'
import { CacheDb, CacheDbModel, MediaType } from '../database/cache'
import Dexie from 'dexie'

export class CacheService {
  static async getCache({ db, id }: { db: Dexie; id: string }): Promise<CacheSchema | undefined> {
    if (!db || !id) return undefined

    const cacheDb = new CacheDb(db)
    try {
      const cache = await cacheDb.get(id)
      if (cache) {
        await cacheDb.updateLastAccessed(cache.id)
        return CacheSchema.fromDbModel(cache)
      }
      return undefined
    } catch (e) {
      logger.error('Failed to get cache:', e)
      return undefined
    }
  }

  static async setCache({ db, name, value }: { db: Dexie; name: string; value: any }): Promise<string> {
    let file: File | Blob

    if (typeof value === 'string' && value.startsWith('data:')) {
      const base64Data = value.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteArrays = []

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512)
        const byteNumbers = new Array(slice.length)

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }

      file = new Blob(byteArrays, { type: 'image/png' })
    } else if (value instanceof Blob || value instanceof File) {
      file = value
    } else {
      throw new Error('Value must be a Blob, File, or base64 string')
    }

    const cacheDb = new CacheDb(db)

    let mediaType = MediaType.FILE
    if (file.type.startsWith('image/')) {
      mediaType = MediaType.IMAGE
    } else if (file.type.startsWith('video/')) {
      mediaType = MediaType.VIDEO
    } else if (file.type.startsWith('audio/')) {
      mediaType = MediaType.AUDIO
    }

    // Create a new File object with the name as the filename
    const renamedFile = new File([file], name, { type: file.type })

    const cacheItem: Omit<CacheDbModel, 'id'> = {
      type: mediaType,
      mimeType: file.type,
      name: name,
      size: renamedFile.size,
      source: renamedFile,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    }

    // Generate thumbnail for image
    if (mediaType === MediaType.IMAGE) {
      try {
        const imageBitmap = await createImageBitmap(renamedFile)
        cacheItem.width = imageBitmap.width
        cacheItem.height = imageBitmap.height

        // Create thumbnail using OffscreenCanvas
        const MAX_THUMB_SIZE = 200
        let thumbWidth = imageBitmap.width
        let thumbHeight = imageBitmap.height

        // Calculate thumbnail dimensions maintaining aspect ratio
        if (thumbWidth > thumbHeight) {
          if (thumbWidth > MAX_THUMB_SIZE) {
            thumbHeight *= MAX_THUMB_SIZE / thumbWidth
            thumbWidth = MAX_THUMB_SIZE
          }
        } else {
          if (thumbHeight > MAX_THUMB_SIZE) {
            thumbWidth *= MAX_THUMB_SIZE / thumbHeight
            thumbHeight = MAX_THUMB_SIZE
          }
        }

        const canvas = new OffscreenCanvas(thumbWidth, thumbHeight)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(imageBitmap, 0, 0, thumbWidth, thumbHeight)

        // Convert canvas to blob
        const blob = await canvas.convertToBlob({
          type: 'image/jpeg',
          quality: 0.7
        })

        if (blob) {
          cacheItem.thumbnail = new File([blob], `thumb_${name}`, { type: 'image/jpeg' })
        }
      } catch (error) {
        logger.error('Failed to generate thumbnail:', error)
      }
    }

    // Generate thumbnail for video
    if (mediaType === MediaType.VIDEO) {
      const video = document.createElement('video')
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          cacheItem.duration = video.duration

          // Generate thumbnail from first frame
          video.currentTime = 0
          video.onseeked = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const MAX_THUMB_SIZE = 200
            let thumbWidth = video.videoWidth
            let thumbHeight = video.videoHeight

            // Calculate thumbnail dimensions maintaining aspect ratio
            if (thumbWidth > thumbHeight) {
              if (thumbWidth > MAX_THUMB_SIZE) {
                thumbHeight *= MAX_THUMB_SIZE / thumbWidth
                thumbWidth = MAX_THUMB_SIZE
              }
            } else {
              if (thumbHeight > MAX_THUMB_SIZE) {
                thumbWidth *= MAX_THUMB_SIZE / thumbHeight
                thumbHeight = MAX_THUMB_SIZE
              }
            }

            canvas.width = thumbWidth
            canvas.height = thumbHeight
            ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight)

            // Convert canvas to blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  cacheItem.thumbnail = new File([blob], `thumb_${name}`, { type: 'image/jpeg' })
                }
                resolve(null)
              },
              'image/jpeg',
              0.7
            )
          }
        }
        video.onerror = reject
        video.src = URL.createObjectURL(renamedFile)
      })
    }

    // Handle audio files
    if (mediaType === MediaType.AUDIO) {
      const audio = document.createElement('audio')
      await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          cacheItem.duration = audio.duration
          resolve(null)
        }
        audio.onerror = reject
        audio.src = URL.createObjectURL(renamedFile)
      })
    }

    try {
      const id = await cacheDb.add(cacheItem)
      return id
    } catch (e) {
      logger.error('Failed to add cache:', e)
      throw e
    }
  }

  static async deleteCache({ db, id }: { db: Dexie; id: string }): Promise<void> {
    if (!db || !id) return

    const cacheDb = new CacheDb(db)
    await cacheDb.delete(id)
  }
}
