import React, { useState, useEffect } from 'react'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import { X, Upload, Link as LinkIcon, FileText, Video as VideoIcon, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const LessonEditorModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('VIDEO')
    const [link, setLink] = useState('')
    const [file, setFile] = useState(null)

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '')
            setDescription(initialData.description || '')
            setType(initialData.materialType || 'VIDEO')
            setLink(initialData.externalUrl || '')
            setFile(null) // Files are not pre-filled, only replaced
        } else {
            // Reset
            setTitle('')
            setDescription('')
            setType('VIDEO')
            setLink('')
            setFile(null)
        }
    }, [isOpen, initialData])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return

        // Validation
        const maxSize = type === 'VIDEO' ? 500 * 1024 * 1024 : 50 * 1024 * 1024
        if (selectedFile.size > maxSize) {
            toast.error(`File too large! Max size: ${type === 'VIDEO' ? '500MB' : '50MB'}`)
            e.target.value = ''
            return
        }

        setFile(selectedFile)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Basic validation
        if (!title.trim()) {
            toast.error('Title is required')
            return
        }

        if (type === 'LINK' && !link.trim()) {
            toast.error('Link URL is required')
            return
        }

        if (!initialData && type !== 'LINK' && !file) {
            toast.error('Please upload a file')
            return
        }

        // Construct payload
        const payload = {
            title,
            description,
            type,
            link: type === 'LINK' ? link : null,
            file: type !== 'LINK' ? file : null,
            // ID is handled by parent if initialData exists
            id: initialData?.id
        }

        onSubmit(payload)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 transition-all duration-300">
            <Card className="max-w-xl w-full p-6 border-2 border-purple-400 shadow-xl rounded-2xl bg-white/90 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Lesson' : 'Add New Lesson'}
                    </h3>
                    <button onClick={onClose}>
                        <X size={24} className="text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Type Selection */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['VIDEO', 'PDF', 'IMAGE', 'LINK'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${type === t
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                {t === 'VIDEO' && <VideoIcon size={20} className="mb-1" />}
                                {t === 'PDF' && <FileText size={20} className="mb-1" />}
                                {t === 'IMAGE' && <ImageIcon size={20} className="mb-1" />}
                                {t === 'LINK' && <LinkIcon size={20} className="mb-1" />}
                                <span className="text-xs">{t === 'PDF' ? 'Document' : t.charAt(0) + t.slice(1).toLowerCase()}</span>
                            </button>
                        ))}
                    </div>

                    <Input
                        label="Lesson Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="e.g., Introduction to React"
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="2"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Brief description of this lesson..."
                        />
                    </div>

                    {/* Dynamic Input based on Type */}
                    {type === 'LINK' ? (
                        <Input
                            label="External Link URL"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://youtube.com/..."
                            required
                        />
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {initialData ? 'Replace File (Optional)' : 'Upload File'}
                            </label>

                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">
                                            {fields[type]?.hint || 'Supported file types'}
                                        </p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept={fields[type]?.accept}
                                    />
                                </label>
                            </div>

                            {file && (
                                <div className="text-sm text-green-600 flex items-center bg-green-50 p-2 rounded">
                                    <Upload size={14} className="mr-2" />
                                    Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                </div>
                            )}

                            {initialData && !file && (
                                <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                    Current file: {initialData.fileName || 'Existing file'}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4 border-t mt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            {initialData ? 'Update Lesson' : 'Add Lesson'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

const fields = {
    VIDEO: { accept: 'video/*', hint: 'MP4, WebM (Max 500MB)' },
    PDF: { accept: 'application/pdf', hint: 'PDF (Max 50MB)' },
    IMAGE: { accept: 'image/*', hint: 'JPG, PNG, WEBP (Max 50MB)' },
    LINK: { accept: '', hint: '' }
}

export default LessonEditorModal
