import { CacheDbModel, MediaType } from '../protocol/database/cache'

export interface ICacheSchema {
  id?: string
  type: MediaType
  mimeType: string
  name: string
  size: number
  width?: number
  height?: number
  duration?: number
  thumbnail?: Blob
  source: Blob
  createdAt: number
  lastAccessed: number
  expiresAt?: number
  tags?: string[]
}

export class CacheSchema implements ICacheSchema {
  public id?: string
  public type: MediaType
  public mimeType: string
  public name: string
  public size: number
  public width?: number
  public height?: number
  public duration?: number
  public thumbnail?: Blob
  public source: Blob
  public createdAt: number
  public lastAccessed: number
  public expiresAt?: number
  public tags?: string[]

  constructor(schema: ICacheSchema) {
    this.id = schema.id
    this.type = schema.type
    this.mimeType = schema.mimeType
    this.name = schema.name
    this.size = schema.size
    this.width = schema.width
    this.height = schema.height
    this.duration = schema.duration
    this.thumbnail = schema.thumbnail
    this.source = schema.source
    this.createdAt = schema.createdAt
    this.lastAccessed = schema.lastAccessed
    this.expiresAt = schema.expiresAt
    this.tags = schema.tags
  }

  toDbModel(): Omit<CacheDbModel, 'id'> {
    return {
      type: this.type,
      mimeType: this.mimeType,
      name: this.name,
      size: this.size,
      width: this.width,
      height: this.height,
      duration: this.duration,
      thumbnail: this.thumbnail,
      source: this.source,
      createdAt: this.createdAt,
      lastAccessed: this.lastAccessed,
      expiresAt: this.expiresAt,
      tags: this.tags
    }
  }

  static fromDbModel(model: CacheDbModel): CacheSchema {
    return new CacheSchema({
      id: model.id,
      type: model.type,
      mimeType: model.mimeType,
      name: model.name,
      size: model.size,
      width: model.width,
      height: model.height,
      duration: model.duration,
      thumbnail: model.thumbnail,
      source: model.source,
      createdAt: model.createdAt,
      lastAccessed: model.lastAccessed,
      expiresAt: model.expiresAt,
      tags: model.tags
    })
  }

  // Helper methods
  get isImage(): boolean {
    return this.type === MediaType.IMAGE
  }

  get isVideo(): boolean {
    return this.type === MediaType.VIDEO
  }

  get isAudio(): boolean {
    return this.type === MediaType.AUDIO
  }

  get isFile(): boolean {
    return this.type === MediaType.FILE
  }

  get hasExpired(): boolean {
    if (!this.expiresAt) return false
    return Date.now() > this.expiresAt
  }

  get hasThumbnail(): boolean {
    return this.thumbnail != null
  }

  // Get source URL for display
  getSourceUrl(): string {
    return URL.createObjectURL(this.source)
  }

  // Get thumbnail URL for display
  getThumbnailUrl(): string | null {
    if (!this.thumbnail) return null
    return URL.createObjectURL(this.thumbnail)
  }

  // Clean up URLs when no longer needed
  revokeUrls(): void {
    if (this._sourceUrl) {
      URL.revokeObjectURL(this._sourceUrl)
      this._sourceUrl = null
    }
    if (this._thumbnailUrl) {
      URL.revokeObjectURL(this._thumbnailUrl)
      this._thumbnailUrl = null
    }
  }

  private _sourceUrl: string | null = null
  private _thumbnailUrl: string | null = null
}
