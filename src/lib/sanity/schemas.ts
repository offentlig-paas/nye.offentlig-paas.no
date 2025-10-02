import { defineType } from 'sanity'

// Local attendance type display mapping for Sanity Studio
const attendanceTypeDisplay: Record<string, string> = {
  physical: 'Fysisk oppmøte',
  digital: 'Digitalt',
}

// Sanity schema for event registrations
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
      description: 'The slug identifier for the event',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Full name of the registrant',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
      description: 'Email address of the registrant',
    },
    {
      name: 'slackUserId',
      title: 'Slack User ID',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Slack user ID for the registrant',
    },
    {
      name: 'organisation',
      title: 'Organisation',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Organisation or company the registrant represents',
    },
    {
      name: 'dietary',
      title: 'Dietary Requirements',
      type: 'text',
      description: 'Any dietary requirements or restrictions',
    },
    {
      name: 'comments',
      title: 'Comments',
      type: 'text',
      description: 'Additional comments or notes from the registrant',
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
      description: 'How the participant will attend the event',
    },
    {
      name: 'attendingSocialEvent',
      title: 'Attending Social Event',
      type: 'boolean',
      description:
        'Whether the participant will attend the social event after the fagdag',
    },
    {
      name: 'registeredAt',
      title: 'Registered At',
      type: 'datetime',
      validation: Rule => Rule.required(),
      description: 'When the registration was submitted',
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
    // Extensible metadata field for future enhancements
    {
      name: 'metadata',
      title: 'Additional Metadata',
      type: 'object',
      description: 'Extensible field for additional registration data',
      fields: [
        {
          name: 'source',
          title: 'Registration Source',
          type: 'string',
          description: 'How the user found out about the event',
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

// Export the schema for use in Sanity Studio
export const schemas = [eventRegistrationSchema]
