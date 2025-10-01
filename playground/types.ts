// Description: Type definitions for the Contentstack API

// PublishDetails object - Represents the details of publish functionality
export interface PublishDetails {
  environment: string
  locale: string
  time: string
  user: string
}

// File object - Represents a file in Contentstack
export interface File {
  uid: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  content_type: string
  file_size: string
  tags: string[]
  filename: string
  url: string
  ACL: any[] | object
  is_dir: boolean
  parent_uid: string
  _version: number
  title: string
  _metadata?: object
  publish_details: PublishDetails
  cslp: any
}

// Block object - Represents a modular block in Contentstack
export interface Block {
  _version?: number
  _metadata: any
  cslp: any
  title?: string
  copy?: string
  image?: File | null
  layout?: ('image_left' | 'image_right') | null
}

export interface Blocks {
  block: Block
}

// Page object - Represents a page in Contentstack
export interface Page {
  uid: string
  $: any
  _version?: number
  title: string
  url?: string
  description?: string
  image?: File | null
  rich_text?: string
  blocks?: Blocks[]
}
