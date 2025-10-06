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

export const schemas = [eventRegistrationSchema, eventParticipantInfoSchema]
