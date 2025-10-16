'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { createCaller } from '@/server/root'
import type { RegistrationStatus } from '@/domains/event-registration/types'

export async function updateParticipantInfo(
  slug: string,
  data: { streamingUrl: string; notes: string }
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }

  const caller = await createCaller()
  await caller.admin.participantInfo.update({
    slug,
    streamingUrl: data.streamingUrl,
    notes: data.notes,
  })

  revalidatePath(`/admin/events/${slug}`)
  return { success: true }
}

export async function deleteRegistration(slug: string, registrationId: string) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }

  const caller = await createCaller()
  await caller.admin.registrations.delete({
    slug,
    id: registrationId,
  })

  revalidatePath(`/admin/events/${slug}`)
  return { success: true }
}

export async function updateRegistrationStatus(
  slug: string,
  registrationId: string,
  status: RegistrationStatus
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }

  const caller = await createCaller()
  await caller.admin.registrations.updateStatus({
    slug,
    id: registrationId,
    status,
  })

  revalidatePath(`/admin/events/${slug}`)
  return { success: true }
}

export async function bulkUpdateRegistrationStatus(
  slug: string,
  registrationIds: string[],
  status: RegistrationStatus
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized')
  }

  const caller = await createCaller()
  const result = await caller.admin.registrations.bulkUpdateStatus({
    slug,
    ids: registrationIds,
    status,
  })

  revalidatePath(`/admin/events/${slug}`)
  return result
}
