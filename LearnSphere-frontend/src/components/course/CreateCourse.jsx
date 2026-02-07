import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createCourse } from '../../store/slices/courseSlice'
import { ArrowLeft, Save } from 'lucide-react'
import Card from '../common/Card'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'
import axios from 'axios'

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'BEGINNER',
    duration: '',
    thumbnailUrl: '',
    category: '',
    tags: '',
    visibility: 'EVERYONE',
    accessRule: 'OPEN',
    price: ''
  })

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageInputMethod, setImageInputMethod] = useState('url') // 'url' or 'upload'
  const [adminUsers, setAdminUsers] = useState([])

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.course)

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/api/admin/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAdminUsers(response.data)
    } catch (error) {
      console.error('Error fetching admin users:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate price if access rule is ON_PAYMENT
    if (formData.accessRule === 'ON_PAYMENT') {
      if (!formData.price || formData.price <= 0) {
        toast.error('Price is required and must be greater than 0 when Access Rule is "On Payment"')
        return
      }
    }

    const result = await dispatch(createCourse({
      courseData: formData,
      instructorId: user?.userId
    }))

    if (result.type === 'course/createCourse/fulfilled') {
      navigate('/courses')
    }
  }

  const handleCancel = () => {
    navigate('/courses')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // For create course, we'll upload after course is created
    // Store the file for later upload
    setFormData(prev => ({ ...prev, imageFile: file }))
    toast.success('Image ready to upload')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
        <p className="text-gray-600">Fill in the details to create your course</p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Course Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Introduction to Web Development"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <Input
              label="Duration (minutes)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 120"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="BUSINESS">Business</option>
                <option value="FINANCE">Finance</option>
                <option value="IT_SOFTWARE">IT & Software</option>
                <option value="MARKETING">Marketing</option>
                <option value="DESIGN">Design</option>
                <option value="PERSONAL_DEVELOPMENT">Personal Development</option>
              </select>
            </div>
            <Input
              label="Tags (comma separated)"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., java, spring boot, backend"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Access Type <span className="text-red-500">*</span>
              </label>
              <select
                name="accessRule"
                value={formData.accessRule}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="OPEN">Free (Open)</option>
                <option value="ON_PAYMENT">Paid</option>
              </select>
            </div>

            {formData.accessRule === 'ON_PAYMENT' && (
              <Input
                label="Price (₹)"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 499"
                required
                min="1"
              />
            )}
          </div>

          {/* Course Admin Selector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Course Administrator (Optional)
            </label>
            <select
              name="courseAdminUserId"
              value={formData.courseAdminUserId || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Admin Assigned</option>
              {adminUsers.map((admin) => (
                <option key={admin.userId} value={admin.userId}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Assign an admin to help manage this course
            </p>
          </div>

          {/* Image Input Method Toggle */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Course Thumbnail
            </label>

            {/* Toggle Buttons */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setImageInputMethod('url')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${imageInputMethod === 'url'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                🔗 Image URL
              </button>
              <button
                type="button"
                onClick={() => setImageInputMethod('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${imageInputMethod === 'upload'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                📤 Upload File
              </button>
            </div>

            {/* URL Input Method */}
            {imageInputMethod === 'url' && (
              <div className="space-y-3">
                <input
                  type="url"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => {
                    handleChange(e)
                    setImagePreview(e.target.value)
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {formData.thumbnailUrl && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Course thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* File Upload Method */}
            {imageInputMethod === 'upload' && (
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Course thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </div>
                  </label>
                  <span className="text-sm text-gray-500">
                    Max size: 5MB. Formats: JPG, PNG, GIF
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              icon={Save}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateCourse