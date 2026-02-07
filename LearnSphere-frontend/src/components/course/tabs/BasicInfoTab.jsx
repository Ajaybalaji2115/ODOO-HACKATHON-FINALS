import React from 'react'
import Input from '../../common/Input'
import Card from '../../common/Card'
import Button from '../../common/Button'
import { Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'

const BasicInfoTab = ({ formData, setFormData, imagePreview, setImagePreview, imageInputMethod, setImageInputMethod, uploadingImage, handleImageUpload }) => {

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>

                    <div className="space-y-6">
                        <Input
                            label="Course Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="Programming">Programming</option>
                                    <option value="Design">Design</option>
                                    <option value="Business">Business</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Music">Music</option>
                                    <option value="Photography">Photography</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                                <select
                                    value={formData.difficultyLevel}
                                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Tags (comma separated)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="e.g., react, javascript, frontend"
                        />
                    </div>
                </div>
            </Card>

            {/* Thumbnail Section */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Course Thumbnail</h3>

                    <div className="space-y-4">
                        {/* Toggle Input Method */}
                        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                            <button
                                type="button"
                                onClick={() => setImageInputMethod('url')}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${imageInputMethod === 'url'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <LinkIcon size={16} className="mr-2" />
                                Image URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageInputMethod('upload')}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${imageInputMethod === 'upload'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Upload size={16} className="mr-2" />
                                Upload File
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Input Area */}
                            <div className="space-y-4">
                                {imageInputMethod === 'url' ? (
                                    <Input
                                        label="Thumbnail URL"
                                        value={formData.thumbnailUrl}
                                        onChange={(e) => {
                                            setFormData({ ...formData, thumbnailUrl: e.target.value });
                                            setImagePreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="text-center">
                                                {uploadingImage ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                        <span className="text-sm text-gray-500">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Preview Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                                <div className="aspect-video rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                setImagePreview(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                                            <span>No image selected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default BasicInfoTab
