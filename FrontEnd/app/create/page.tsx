"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Sparkles, ImageIcon, Loader2, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const createNFTSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  traits: z.string().optional(),
  price: z.string().regex(/^\d*\.?\d*$/, 'Must be a valid number'),
})

type FormValues = z.infer<typeof createNFTSchema>

export default function CreateNFTPage() {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(createNFTSchema),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 50 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      setFile(file)
      setFilePreview(URL.createObjectURL(file))
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (!file) {
      toast.error('Please upload an image')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate NFT creation
      toast.success('NFT created successfully!')
    } catch (error) {
      toast.error('Failed to create NFT')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-yellow-300/80" />
            <span className="text-sm text-white/80">Create Your NFT</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Turn Your Art Into NFTs
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Create and showcase your digital creations. Set your price and let the world discover your art.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="col-span-8">
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* File Upload Section */}
                <div>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-colors",
                      "hover:border-white/30 cursor-pointer",
                      isDragActive && "border-emerald-500/50 bg-emerald-500/5"
                    )}
                  >
                    <input {...getInputProps()} />
                    {filePreview ? (
                      <div className="space-y-4">
                        <div className="aspect-square w-48 mx-auto rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFile(null)
                            setFilePreview(null)
                          }}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-6 h-6 text-white/80" />
                        </div>
                        <p className="text-gray-400 text-sm">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Maximum file size: 50MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <input
                    {...register('title')}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                      "text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    )}
                    placeholder="Give your NFT a name"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <textarea
                    {...register('description')}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                      "text-white placeholder-gray-500 focus:outline-none focus:border-white/20",
                      "resize-none h-24"
                    )}
                    placeholder="Tell the story behind your creation"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                  )}
                </div>

                {/* Traits Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Traits (format: key:value, separated by commas)
                  </label>
                  <input
                    {...register('traits')}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                      "text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    )}
                    placeholder="e.g. background:red, rarity:legendary, type:weapon"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: background:red, rarity:legendary, type:weapon
                  </p>
                </div>

                {/* Price Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Price (ETH)</label>
                  <div className="relative">
                    <input
                      {...register('price')}
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                        "text-white placeholder-gray-500 focus:outline-none focus:border-white/20",
                        "pr-12"
                      )}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">ETH</span>
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full bg-emerald-500 text-white p-3 rounded-lg",
                    "hover:bg-emerald-500/90 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create NFT'
                  )}
                </button>

                {/* Info Cards */}
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
                  <Wallet className="w-4 h-4" />
                  <p>Payments will be sent to your connected wallet</p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="col-span-4">
            <div className="sticky top-4">
              <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-white mb-4">Live Preview</h3>
                {filePreview ? (
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5 mb-4">
                    <img
                      src={filePreview}
                      alt="NFT Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-white text-lg font-medium">{watch('title') || 'NFT Title'}</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      {watch('description') || 'NFT description will appear here'}
                    </p>
                  </div>
                  {watch('traits') && (
                    <div>
                      <h5 className="text-sm text-gray-400 mb-2">Traits</h5>
                      <div className="flex flex-wrap gap-2">
                        {watch('traits')?.split(',').map((trait, index) => {
                          const [key, value] = trait.trim().split(':');
                          return key && value ? (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 rounded-full text-xs text-white"
                            >
                              {key}: {value}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price</span>
                      <span className="text-white font-medium">
                        {watch('price') ? `${watch('price')} ETH` : '0.00 ETH'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">Owner</span>
                      <span className="text-white font-medium truncate max-w-[150px]">
                        0xYourWalletAddress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}