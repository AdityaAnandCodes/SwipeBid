"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Transition, Dialog } from '@headlessui/react'
import { Sparkles, Upload, Tag, Wallet, X, ImageIcon, AlertCircle, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import NFTCollections from '@/lib/constant'

// Enhanced Form Schema
const createNFTSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  collection: z.string().min(1, 'Please select or create a collection'),
  traits: z.string().optional(),
  price: z.string().regex(/^\d*\.?\d*$/, 'Must be a valid number'),
  royalty: z.string().regex(/^\d*\.?\d*$/, 'Must be a valid number').refine(
    (val) => parseFloat(val) >= 0 && parseFloat(val) <= 100,
    'Royalty must be between 0 and 100'
  ),
})

type FormValues = z.infer<typeof createNFTSchema>

// New Collection Modal Component
const CreateCollectionModal = ({
  isOpen,
  onClose,
  onCreateCollection
}: {
  isOpen: boolean
  onClose: () => void
  onCreateCollection: (collection: { id: string; title: string; description: string }) => void
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = title.toLowerCase().replace(/\s+/g, '-')
    onCreateCollection({ id, title, description })
    onClose()
  }

  return (
    <Transition show={isOpen} as="div">
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 p-6">
              <Dialog.Title className="text-lg font-medium text-white mb-4">
                Create New Collection
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Collection Name</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-white bg-white/10 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-emerald-500 rounded-lg"
                  >
                    Create Collection
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default function CreateNFTPage() {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [collections, setCollections] = useState(NFTCollections)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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

  const handleCreateCollection = (newCollection: { id: string; title: string; description: string }) => {
    const updatedCollections = [...collections, { ...newCollection, nfts: [] }]
    setCollections(updatedCollections)
    setValue('collection', newCollection.id)
  }

  const onSubmit = async (data: FormValues) => {
    if (!file) {
      toast.error('Please upload an image for your NFT')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Add the new NFT to the selected collection
      const selectedCollection = collections.find(c => c.id === data.collection)
      if (selectedCollection) {
        const newNFT = {
          id: Date.now(),
          name: data.title,
          collection: selectedCollection.title,
          owner: "0xCurrentWallet", // You would get this from your wallet connection
          description: data.description,
          image: filePreview, // In production, you'd upload this to IPFS or similar
          traits: data.traits?.split(',').reduce((acc, trait) => {
            const [key, value] = trait.split(':').map(s => s.trim())
            return { ...acc, [key]: value }
          }, {}),
          price: parseFloat(data.price),
          royalty: parseFloat(data.royalty)
        }

        // Update collections state
        const updatedCollections : any = collections.map(c => {
          if (c.id === data.collection) {
            return { ...c, nfts: [...c.nfts, newNFT] }
          }
          return c
        })
        setCollections(updatedCollections)
      }

      toast.success('NFT created successfully!')
      // Reset form or redirect
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
            Create, sell, and track your NFTs with ease. Set your price, 
            royalties, and let the world discover your creations.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="col-span-8">
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Collection Selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Collection</label>
                  <div className="flex gap-3">
                    <select
                      {...register('collection')}
                      className={cn(
                        "flex-1 bg-white/5 border border-white/10 rounded-lg p-3",
                        "text-white appearance-none"
                      )}
                    >
                      <option value="">Select Collection</option>
                      {collections.map(collection => (
                        <option key={collection.id} value={collection.id}>
                          {collection.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCollection(true)}
                      className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.collection && (
                    <p className="mt-1 text-sm text-red-400">{errors.collection.message}</p>
                  )}
                </div>

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

                {/* Price and Royalty Fields */}
                <div className="grid grid-cols-2 gap-6">
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

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Royalty (%)</label>
                    <div className="relative">
                      <input
                        {...register('royalty')}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                          "text-white placeholder-gray-500 focus:outline-none focus:border-white/20",
                          "pr-8"
                        )}
                        placeholder="2.5"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">%</span>
                    </div>
                    {errors.royalty && (
                      <p className="mt-1 text-sm text-red-400">{errors.royalty.message}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={cn(
                      "flex-1 bg-white/5 text-white p-3 rounded-lg",
                      "hover:bg-white/10 transition-colors"
                    )}
                  >
                    Preview
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1 bg-emerald-500 text-white p-3 rounded-lg",
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
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
                    <Wallet className="w-4 h-4" />
                    <p>Payments will be sent to your connected wallet</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <p>Gas fees apply to all transactions</p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Preview */}
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
                        {watch('traits')?.split(',').map((trait, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 rounded-full text-xs text-white"
                          >
                            {trait.trim()}
                          </span>
                        ))}
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
                      <span className="text-gray-400">Royalty</span>
                      <span className="text-white font-medium">
                        {watch('royalty') ? `${watch('royalty')}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCollectionModal
        isOpen={showNewCollection}
        onClose={() => setShowNewCollection(false)}
        onCreateCollection={handleCreateCollection}
      />
    </main>
  )};
