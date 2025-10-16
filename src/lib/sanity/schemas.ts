import { defineType } from 'sanity'

const attendanceTypeDisplay: Record<string, string> = {
  physical: 'Fysisk oppmøte',
  digital: 'Digitalt',
}

export const eventRegistrationSchema = defineType({
  name: 'eventRegistration',
  title: 'Event Registration',
  type: 'document',
  fields: [
    {
      name: 'eventSlug',
      title: 'Event Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'slackUserId',
      title: 'Slack User ID',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'organisation',
      title: 'Organisation',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'dietary',
      title: 'Dietary Requirements',
      type: 'text',
    },
    {
      name: 'comments',
      title: 'Comments',
      type: 'text',
    },
    {
      name: 'attendanceType',
      title: 'Attendance Type',
      type: 'string',
      options: {
        list: [
          { title: 'Fysisk oppmøte', value: 'physical' },
          { title: 'Digitalt', value: 'digital' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'attendingSocialEvent',
      title: 'Attending Social Event',
      type: 'boolean',
    },
    {
      name: 'registeredAt',
      title: 'Registered At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'status',
      title: 'Registration Status',
      type: 'string',
      options: {
        list: [
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Waitlist', value: 'waitlist' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Attended', value: 'attended' },
          { title: 'No-show', value: 'no-show' },
        ],
        layout: 'radio',
      },
      initialValue: 'confirmed',
      validation: Rule => Rule.required(),
    },
    {
      name: 'metadata',
      title: 'Additional Metadata',
      type: 'object',
      fields: [
        {
          name: 'source',
          title: 'Registration Source',
          type: 'string',
        },
        {
          name: 'experience',
          title: 'Experience Level',
          type: 'string',
          options: {
            list: [
              { title: 'Beginner', value: 'beginner' },
              { title: 'Intermediate', value: 'intermediate' },
              { title: 'Advanced', value: 'advanced' },
            ],
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      attendanceType: 'attendanceType',
      status: 'status',
    },
    prepare(selection) {
      const { title, subtitle, attendanceType, status } = selection
      const attendanceDisplay = attendanceType
        ? attendanceTypeDisplay[attendanceType] || attendanceType
        : ''
      const attendanceInfo = attendanceDisplay ? ` (${attendanceDisplay})` : ''
      const statusInfo = status ? ` - ${status}` : ''
      return {
        title: title,
        subtitle: `${subtitle}${attendanceInfo}${statusInfo}`,
      }
    },
  },
  orderings: [
    {
      title: 'Registration Date (Newest First)',
      name: 'registeredAtDesc',
      by: [{ field: 'registeredAt', direction: 'desc' }],
    },
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
})

export const eventParticipantInfoSchema = defineType({
  name: 'eventParticipantInfo',
  title: 'Event Participant Info',
  type: 'document',
  fields: [
    {
      name: 'eventSlug',
      title: 'Event Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'streamingUrl',
      title: 'Streaming URL',
      type: 'url',
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'eventSlug',
      subtitle: 'streamingUrl',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: `Participant Info: ${title}`,
        subtitle: subtitle || 'No streaming URL',
      }
    },
  },
})

export const talkAttachmentSchema = defineType({
  name: 'talkAttachment',
  title: 'Talk Attachment',
  type: 'document',
  fields: [
    {
      name: 'eventSlug',
      title: 'Event Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'talkTitle',
      title: 'Talk Title',
      type: 'string',
      description: 'Title of the talk this attachment belongs to',
      validation: Rule => Rule.required(),
    },
    {
      name: 'speakerSlackId',
      title: 'Speaker Slack ID',
      type: 'string',
      description: 'Primary speaker for authorization',
      validation: Rule => Rule.required(),
    },
    {
      name: 'title',
      title: 'Attachment Title',
      type: 'string',
      description: 'Optional custom title for the attachment',
    },
    {
      name: 'url',
      title: 'External URL',
      type: 'url',
      description: 'Link to external resource (Google Slides, YouTube, etc.)',
    },
    {
      name: 'file',
      title: 'Upload File',
      type: 'file',
      description: 'Upload a file directly to Sanity',
      options: {
        accept: '.pdf,.pptx,.ppt,.key,.odp,.zip',
      },
    },
    {
      name: 'type',
      title: 'Attachment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Slides', value: 'Slides' },
          { title: 'PDF', value: 'PDF' },
          { title: 'Video', value: 'Video' },
          { title: 'Recording', value: 'Recording' },
          { title: 'Code', value: 'Code' },
          { title: 'Link', value: 'Link' },
          { title: 'Other', value: 'Other' },
        ],
        layout: 'dropdown',
      },
      validation: Rule => Rule.required(),
      initialValue: 'Slides',
    },
    {
      name: 'uploadedAt',
      title: 'Uploaded At',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'uploadedBy',
      title: 'Uploaded By Slack ID',
      type: 'string',
      description: 'Slack ID of uploader',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      talkTitle: 'talkTitle',
      eventSlug: 'eventSlug',
      type: 'type',
    },
    prepare(selection) {
      const { title, talkTitle, eventSlug, type } = selection
      return {
        title: title || `${type} - ${talkTitle}`,
        subtitle: eventSlug,
      }
    },
  },
})

export const eventFeedbackSchema = defineType({
  name: 'eventFeedback',
  title: 'Event Feedback',
  type: 'document',
  fields: [
    {
      name: 'eventSlug',
      title: 'Event Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slackUserId',
      title: 'Slack User ID',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'talkRatings',
      title: 'Talk Ratings',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'talkTitle',
              title: 'Talk Title',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'rating',
              title: 'Rating',
              type: 'number',
              validation: Rule => Rule.required().min(1).max(5).integer(),
            },
            {
              name: 'comment',
              title: 'Comment',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'eventRating',
      title: 'Event Rating',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5).integer(),
    },
    {
      name: 'eventComment',
      title: 'Event Comment',
      type: 'text',
    },
    {
      name: 'topicSuggestions',
      title: 'Topic Suggestions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'topic',
              title: 'Topic',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'willingToPresent',
              title: 'Willing to Present',
              type: 'boolean',
            },
          ],
        },
      ],
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        {
          name: 'userAgent',
          title: 'User Agent',
          type: 'string',
        },
        {
          name: 'submissionSource',
          title: 'Submission Source',
          type: 'string',
        },
      ],
    },
  ],
  preview: {
    select: {
      name: 'name',
      eventSlug: 'eventSlug',
      eventRating: 'eventRating',
    },
    prepare(selection) {
      const { name, eventSlug, eventRating } = selection
      return {
        title: name,
        subtitle: `${eventSlug} - Rating: ${eventRating}/5`,
      }
    },
  },
  orderings: [
    {
      title: 'Submitted Date (Newest First)',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
})

export const schemas = [
  eventRegistrationSchema,
  eventParticipantInfoSchema,
  talkAttachmentSchema,
  eventFeedbackSchema,
]
