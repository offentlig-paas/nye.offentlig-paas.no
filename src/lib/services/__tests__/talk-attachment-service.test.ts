import { AttachmentType } from '@/lib/events/types'
import {
  handleFileUpload,
  handleUrlAttachment,
  type FileUploadData,
  type UrlAttachmentData,
} from '../talk-attachment-service'

jest.mock('@/lib/sanity/talk-attachments')

import {
  uploadTalkAttachmentFile,
  createTalkAttachmentWithFile,
  createTalkAttachment,
} from '@/lib/sanity/talk-attachments'

describe('Talk Attachment Service', () => {
  const mockUploadTalkAttachmentFile =
    uploadTalkAttachmentFile as jest.MockedFunction<
      typeof uploadTalkAttachmentFile
    >
  const mockCreateTalkAttachmentWithFile =
    createTalkAttachmentWithFile as jest.MockedFunction<
      typeof createTalkAttachmentWithFile
    >
  const mockCreateTalkAttachment = createTalkAttachment as jest.MockedFunction<
    typeof createTalkAttachment
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleFileUpload', () => {
    const fileUploadData: FileUploadData = {
      file: Buffer.from('test content'),
      filename: 'slides.pdf',
      mimeType: 'application/pdf',
      eventSlug: 'test-event',
      talkTitle: 'Test Talk',
      speakerSlackId: 'U123456',
      title: 'Test Slides',
      type: AttachmentType.Slides,
      uploadedBy: 'U789012',
    }

    it('should successfully upload file and create attachment', async () => {
      mockUploadTalkAttachmentFile.mockResolvedValue({
        assetId: 'asset-123',
        url: 'https://cdn.sanity.io/files/slides.pdf',
      })

      mockCreateTalkAttachmentWithFile.mockResolvedValue({
        id: 'attachment-1',
        eventSlug: 'test-event',
        talkTitle: 'Test Talk',
        speakerSlackId: 'U123456',
        title: 'Test Slides',
        fileUrl: 'https://cdn.sanity.io/files/slides.pdf',
        type: AttachmentType.Slides,
        uploadedAt: '2025-10-13T10:00:00Z',
        uploadedBy: 'U789012',
      })

      const result = await handleFileUpload(fileUploadData)

      expect(result.success).toBe(true)
      expect(result.attachment).toBeDefined()
      expect(result.error).toBeUndefined()

      expect(mockUploadTalkAttachmentFile).toHaveBeenCalledWith(
        fileUploadData.file,
        fileUploadData.filename,
        fileUploadData.mimeType
      )

      expect(mockCreateTalkAttachmentWithFile).toHaveBeenCalledWith(
        {
          eventSlug: 'test-event',
          talkTitle: 'Test Talk',
          speakerSlackId: 'U123456',
          title: 'Test Slides',
          type: AttachmentType.Slides,
          uploadedBy: 'U789012',
        },
        'asset-123'
      )
    })

    it('should return error when file upload fails', async () => {
      mockUploadTalkAttachmentFile.mockResolvedValue(null)

      const result = await handleFileUpload(fileUploadData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to upload file')
      expect(result.attachment).toBeUndefined()
      expect(mockCreateTalkAttachmentWithFile).not.toHaveBeenCalled()
    })

    it('should return error when attachment creation fails', async () => {
      mockUploadTalkAttachmentFile.mockResolvedValue({
        assetId: 'asset-123',
        url: 'https://cdn.sanity.io/files/slides.pdf',
      })
      mockCreateTalkAttachmentWithFile.mockResolvedValue(null)

      const result = await handleFileUpload(fileUploadData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create attachment')
      expect(result.attachment).toBeUndefined()
    })
  })

  describe('handleUrlAttachment', () => {
    const urlAttachmentData: UrlAttachmentData = {
      eventSlug: 'test-event',
      talkTitle: 'Test Talk',
      speakerSlackId: 'U123456',
      title: 'External Slides',
      url: 'https://example.com/slides.pdf',
      type: AttachmentType.Link,
      uploadedBy: 'U789012',
    }

    it('should successfully create URL attachment', async () => {
      mockCreateTalkAttachment.mockResolvedValue({
        id: 'attachment-2',
        eventSlug: 'test-event',
        talkTitle: 'Test Talk',
        speakerSlackId: 'U123456',
        title: 'External Slides',
        url: 'https://example.com/slides.pdf',
        type: AttachmentType.Link,
        uploadedAt: '2025-10-13T10:00:00Z',
        uploadedBy: 'U789012',
      })

      const result = await handleUrlAttachment(urlAttachmentData)

      expect(result.success).toBe(true)
      expect(result.attachment).toBeDefined()
      expect(result.error).toBeUndefined()

      expect(mockCreateTalkAttachment).toHaveBeenCalledWith({
        eventSlug: 'test-event',
        talkTitle: 'Test Talk',
        speakerSlackId: 'U123456',
        title: 'External Slides',
        url: 'https://example.com/slides.pdf',
        type: AttachmentType.Link,
        uploadedBy: 'U789012',
      })
    })

    it('should return error when attachment creation fails', async () => {
      mockCreateTalkAttachment.mockResolvedValue(null)

      const result = await handleUrlAttachment(urlAttachmentData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create attachment')
      expect(result.attachment).toBeUndefined()
    })

    it('should handle optional title', async () => {
      const dataWithoutTitle = { ...urlAttachmentData, title: undefined }

      mockCreateTalkAttachment.mockResolvedValue({
        id: 'attachment-3',
        eventSlug: 'test-event',
        talkTitle: 'Test Talk',
        speakerSlackId: 'U123456',
        url: 'https://example.com/slides.pdf',
        type: AttachmentType.Link,
        uploadedAt: '2025-10-13T10:00:00Z',
        uploadedBy: 'U789012',
      })

      const result = await handleUrlAttachment(dataWithoutTitle)

      expect(result.success).toBe(true)
      expect(mockCreateTalkAttachment).toHaveBeenCalledWith(
        expect.objectContaining({
          title: undefined,
        })
      )
    })
  })
})
