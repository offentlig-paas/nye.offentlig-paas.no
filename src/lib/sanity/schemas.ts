import { defineType } from 'sanity'

const attendanceTypeDisplay: Record<string, string> = {
  physical: 'Fysisk oppmøte',
  digital: 'Digitalt',
}

const eventRegistrationSchema = defineType({
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

const eventParticipantInfoSchema = defineType({
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

const talkAttachmentSchema = defineType({
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

const eventFeedbackSchema = defineType({
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
      name: 'isPublic',
      title: 'Display Publicly',
      type: 'boolean',
      description:
        'If true, this review can be displayed publicly on the event page',
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

const eventPhotoSchema = defineType({
  name: 'eventPhoto',
  title: 'Event Photo',
  type: 'document',
  fields: [
    {
      name: 'eventSlug',
      title: 'Event Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'speakers',
      title: 'Tagged Speakers',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Speaker names tagged in this photo',
    },
    {
      name: 'uploadedAt',
      title: 'Uploaded At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'uploadedBy',
      title: 'Uploaded By Slack ID',
      type: 'string',
      description: 'Slack ID of uploader',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which photos are displayed',
      validation: Rule => Rule.integer().min(0),
    },
  ],
  preview: {
    select: {
      title: 'caption',
      eventSlug: 'eventSlug',
      media: 'image',
      speakers: 'speakers',
    },
    prepare(selection) {
      const { title, eventSlug, media, speakers } = selection
      const speakersText =
        speakers && speakers.length > 0 ? ` - ${speakers.join(', ')}` : ''
      return {
        title: title || 'Untitled Photo',
        subtitle: `${eventSlug}${speakersText}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Upload Date (Newest First)',
      name: 'uploadedAtDesc',
      by: [{ field: 'uploadedAt', direction: 'desc' }],
    },
  ],
})

const talkSubmissionStatusDisplay: Record<string, string> = {
  submitted: 'Innsendt',
  accepted: 'Godkjent',
  rejected: 'Avslått',
  withdrawn: 'Trukket',
}

const talkSubmissionSchema = defineType({
  name: 'talkSubmission',
  title: 'Talk Submission',
  type: 'document',
  fields: [
    {
      name: 'eventSlug',
      title: 'Event Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'title',
      title: 'Talk Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'abstract',
      title: 'Abstract',
      type: 'text',
      validation: Rule => Rule.required(),
    },
    {
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'Presentasjon', value: 'Presentation' },
          { title: 'Workshop', value: 'Workshop' },
          { title: 'Panel', value: 'Panel' },
          { title: 'Lyntale', value: 'Lightning talk' },
        ],
        layout: 'dropdown',
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'duration',
      title: 'Preferred Duration',
      type: 'string',
      options: {
        list: [
          { title: '15 min', value: '15 min' },
          { title: '20 min', value: '20 min' },
          { title: '30 min', value: '30 min' },
          { title: '45 min', value: '45 min' },
          { title: '60 min', value: '60 min' },
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'speakerName',
      title: 'Speaker Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'speakerEmail',
      title: 'Speaker Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'speakerSlackId',
      title: 'Speaker Slack ID',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'speakerOrganisation',
      title: 'Speaker Organisation',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'speakerBio',
      title: 'Speaker Bio',
      type: 'text',
    },
    {
      name: 'notes',
      title: 'Additional Notes',
      type: 'text',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Innsendt', value: 'submitted' },
          { title: 'Godkjent', value: 'accepted' },
          { title: 'Avslått', value: 'rejected' },
          { title: 'Trukket', value: 'withdrawn' },
        ],
        layout: 'radio',
      },
      initialValue: 'submitted',
      validation: Rule => Rule.required(),
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      speakerName: 'speakerName',
      format: 'format',
      status: 'status',
      eventSlug: 'eventSlug',
    },
    prepare(selection) {
      const { title, speakerName, format, status, eventSlug } = selection
      const statusDisplay = status
        ? talkSubmissionStatusDisplay[status] || status
        : ''
      return {
        title: title,
        subtitle: `${speakerName} · ${format} · ${statusDisplay} · ${eventSlug}`,
      }
    },
  },
  orderings: [
    {
      title: 'Submitted Date (Newest First)',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
    {
      title: 'Speaker Name (A-Z)',
      name: 'speakerNameAsc',
      by: [{ field: 'speakerName', direction: 'asc' }],
    },
  ],
})

const surveyResponseSchema = defineType({
  name: 'surveyResponse',
  title: 'Survey Response',
  type: 'document',
  fields: [
    {
      name: 'surveySlug',
      title: 'Survey Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'surveyVersion',
      title: 'Survey Version',
      type: 'number',
      validation: Rule => Rule.required().integer().min(1),
    },
    {
      name: 'answers',
      title: 'Answers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'questionId',
              title: 'Question ID',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'Single value for text/radio questions',
            },
            {
              name: 'arrayValue',
              title: 'Array Value',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Multiple values for checkbox questions',
            },
            {
              name: 'otherText',
              title: 'Other Text',
              type: 'string',
            },
          ],
        },
      ],
      validation: Rule => Rule.required(),
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
          name: 'deviceCategory',
          title: 'Device Category',
          type: 'string',
          description:
            'Broad device category (e.g. "desktop", "mobile", "tablet")',
        },
        {
          name: 'submissionSource',
          title: 'Submission Source',
          type: 'string',
        },
        {
          name: 'consentVersion',
          title: 'Consent Version',
          type: 'number',
        },
        {
          name: 'durationSeconds',
          title: 'Duration (seconds)',
          type: 'number',
          description: 'Time the respondent spent on the survey',
        },
        {
          name: 'environment',
          title: 'Environment',
          type: 'string',
          description: 'Runtime environment (e.g. development, production)',
        },
      ],
    },
    {
      name: 'organizationOverride',
      title: 'Organization Override',
      type: 'object',
      description: 'Admin override linking response to a member organization',
      fields: [
        {
          name: 'memberName',
          title: 'Member Name',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'originalValue',
          title: 'Original Value',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'overriddenBy',
          title: 'Overridden By',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'overriddenAt',
          title: 'Overridden At',
          type: 'datetime',
          validation: Rule => Rule.required(),
        },
      ],
    },
  ],
  preview: {
    select: {
      surveySlug: 'surveySlug',
      submittedAt: 'submittedAt',
    },
    prepare(selection: Record<string, string>) {
      return {
        title: selection.surveySlug,
        subtitle: selection.submittedAt,
      }
    },
  },
  orderings: [
    {
      title: 'Submitted Date (Newest First)',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' as const }],
    },
  ],
})

const surveyContactInfoSchema = defineType({
  name: 'surveyContactInfo',
  title: 'Survey Contact Info',
  type: 'document',
  fields: [
    {
      name: 'submissionId',
      title: 'Submission ID',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'surveySlug',
      title: 'Survey Slug',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'answers',
      title: 'Sensitive Answers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'questionId',
              title: 'Question ID',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
            {
              name: 'arrayValue',
              title: 'Array Value',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'otherText',
              title: 'Other Text',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
  ],
  preview: {
    select: {
      surveySlug: 'surveySlug',
      submissionId: 'submissionId',
      createdAt: 'createdAt',
    },
    prepare(selection: Record<string, string>) {
      return {
        title: `Contact: ${selection.surveySlug}`,
        subtitle: selection.createdAt,
      }
    },
  },
})

export const schemas = [
  eventRegistrationSchema,
  eventParticipantInfoSchema,
  talkAttachmentSchema,
  eventFeedbackSchema,
  eventPhotoSchema,
  talkSubmissionSchema,
  surveyResponseSchema,
  surveyContactInfoSchema,
]
