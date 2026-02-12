import { createClient } from './supabase'

export async function uploadTournamentImage(file: File, tournamentId: string): Promise<string | null> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${tournamentId}-${Date.now()}.${fileExt}`
  const filePath = `tournaments/${fileName}`

  const { error } = await supabase.storage
    .from('tournament-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('tournament-images')
    .getPublicUrl(filePath)

  return publicUrl
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
