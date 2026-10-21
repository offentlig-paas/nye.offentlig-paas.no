// Vercel rejects request bodies over 4.5 MB, and phone photos are often
// bigger. Downscale in the browser and send one photo per request.
const MAX_DIMENSION = 2560

export async function shrinkPhoto(file: File): Promise<File> {
  // Canvas drops GIF animation, so leave GIFs alone.
  if (file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    )
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85)
    )
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', {
      type: 'image/jpeg',
    })
  } catch {
    return file
  }
}

/** Parses a JSON response, falling back when the platform returns plain text. */
export async function readUploadResponse(
  response: Response
): Promise<Record<string, unknown>> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok && !data.message) {
    data.message =
      response.status === 413
        ? 'Bildet er for stort til å lastes opp'
        : `Opplasting feilet (${response.status})`
  }
  return data
}
