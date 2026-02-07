import React, { useState } from 'react'
import { X, Send, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../common/Button'
import toast from 'react-hot-toast'
import axios from 'axios'

const ContactAttendeesModal = ({ isOpen, onClose, courseId, onSuccess }) => {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!subject.trim()) {
            toast.error('Please enter a subject')
            return
        }

        if (!message.trim()) {
            toast.error('Please enter a message')
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await axios.post(
                `http://localhost:8080/api/enrollments/course/${courseId}/contact-attendees`,
                {
                    subject: subject.trim(),
                    message: message.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            setResult(response.data)
            toast.success(response.data.message || 'Emails sent successfully!')

            if (onSuccess) {
                onSuccess(response.data)
            }
        } catch (error) {
            console.error('Error sending emails:', error)
            toast.error(error.response?.data?.message || 'Failed to send emails')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setSubject('')
        setMessage('')
        setResult(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Mail className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Contact Attendees</h2>
                            <p className="text-sm text-gray-600">Send email to all enrolled students</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Subject Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Email Subject *
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                            disabled={loading || result}
                            maxLength={200}
                        />
                        <p className="text-xs text-gray-500">
                            {subject.length}/200 characters
                        </p>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here...&#10;&#10;This will be sent to all enrolled students in this course."
                            rows="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            required
                            disabled={loading || result}
                        />
                        <p className="text-xs text-gray-500">
                            Your message will be sent to all enrolled students
                        </p>
                    </div>

                    {/* Preview Box */}
                    {subject && message && !result && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Email Preview:</h4>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div>
                                    <strong>Subject:</strong> {subject}
                                </div>
                                <div className="border-t border-gray-300 pt-2 mt-2">
                                    <strong>Message:</strong>
                                    <p className="mt-1 whitespace-pre-wrap">{message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Display */}
                    {result && (
                        <div className="space-y-3">
                            {result.successCount > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-green-900">
                                                Successfully Sent ({result.successCount})
                                            </h4>
                                            <ul className="mt-2 text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
                                                {result.successfulEmails.map((email, index) => (
                                                    <li key={index} className="flex items-center space-x-2">
                                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                                        <span>{email}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {result.failedCount > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-red-900">
                                                Failed to Send ({result.failedCount})
                                            </h4>
                                            <ul className="mt-2 text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                                                {result.failedEmails.map((error, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0 mt-1.5"></span>
                                                        <span>{error}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            {result ? 'Close' : 'Cancel'}
                        </Button>
                        {!result && (
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                disabled={loading || !subject.trim() || !message.trim()}
                                icon={Send}
                            >
                                {loading ? 'Sending...' : 'Send Email'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ContactAttendeesModal
