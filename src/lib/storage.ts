import { createClient } from './supabase'

export type UploadResult = {
  url: string | null
  error: string | null
}

export async function uploadTournamentImage(file: File, tournamentId: string): Promise<UploadResult> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const fileName = `${tournamentId}-${Date.now()}.${fileExt}`
  const filePath = `tournaments/${fileName}`

  // Validate file type
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  if (!fileExt || !allowedTypes.includes(fileExt)) {
    return { url: null, error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.' }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'Image too large. Maximum size is 5MB.' }
  }

  const { error } = await supabase.storage
    .from('tournament-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    console.error('Upload error:', error)
    // Provide helpful error messages
    if (error.message.includes('Bucket not found')) {
      return { url: null, error: 'Storage not configured. Please contact support.' }
    }
    if (error.message.includes('row-level security') || error.message.includes('policy')) {
      return { url: null, error: 'Permission denied. Please sign in and try again.' }
    }
    return { url: null, error: `Upload failed: ${error.message}` }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('tournament-images')
    .getPublicUrl(filePath)

  return { url: publicUrl, error: null }
}

export async function deleteTournamentImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()

  // Extract file path from URL
  const match = imageUrl.match(/tournament-images\/(.+)$/)
  if (!match) return false

  const filePath = match[1]

  const { error } = await supabase.storage
    .from('tournament-images')
    .remove([filePath])

  return !error
}
