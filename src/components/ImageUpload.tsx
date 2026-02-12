'use client'

import { useState, useRef, useCallback } from 'react'

interface ImageUploadProps {
  value: string | null
  onChange: (file: File | null) => void
  onRemove?: () => void
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (onRemove) onRemove()
    if (inputRef.current) inputRef.current.value = ''
  }

  // Show existing image from URL
  const displayImage = preview || value

  return (
    <div className="space-y-2">
      {displayImage ? (
        <div className="relative">
          <div className="aspect-square w-full max-w-xs rounded-lg overflow-hidden border border-[#E8E2D9] bg-[#F5F0E8]">
            <img
              src={displayImage}
              alt="Tournament flyer"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-[#FFFDF9]/90 hover:bg-[#FFFDF9] rounded-full shadow-sm border border-[#E8E2D9] transition-colors"
          >
            <svg className="w-4 h-4 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            aspect-square w-full max-w-xs rounded-lg border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-colors
            ${isDragging
              ? 'border-[#C4704A] bg-[#C4704A]/5'
              : 'border-[#D4CCC0] hover:border-[#9A948D] bg-[#F5F0E8] hover:bg-[#E8E2D9]'
            }
          `}
        >
          <div className={`p-3 rounded-full ${isDragging ? 'bg-[#C4704A]/10' : 'bg-[#E8E2D9]'}`}>
            <svg className={`w-6 h-6 ${isDragging ? 'text-[#C4704A]' : 'text-[#9A948D]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-[#6B6560]">
              {isDragging ? 'Drop image here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-[#9A948D] mt-1">
              Square image recommended (1:1)
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
