import React, { useState, useEffect } from 'react'
import { X, UserPlus, Mail, AlertCircle, CheckCircle, Search, Users } from 'lucide-react'
import Button from '../common/Button'
import toast from 'react-hot-toast'
import axios from 'axios'

const AddAttendeesModal = ({ isOpen, onClose, courseId, onSuccess }) => {
    const [mode, setMode] = useState('select') // 'select' or 'manual'
    const [students, setStudents] = useState([])
    const [selectedStudents, setSelectedStudents] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [emails, setEmails] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetchingStudents, setFetchingStudents] = useState(false)
    const [result, setResult] = useState(null)

    useEffect(() => {
        if (isOpen && mode === 'select') {
            fetchStudents()
        }
    }, [isOpen, mode])

    const fetchStudents = async () => {
        try {
            setFetchingStudents(true)
            const token = localStorage.getItem('token')

            const response = await axios.get(
                'http://localhost:8080/api/student/list',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            const studentList = response.data?.data || []
            setStudents(studentList)
        } catch (error) {
            console.error('Error fetching students:', error)
            toast.error('Failed to load students')
        } finally {
            setFetchingStudents(false)
        }
    }

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(filteredStudents.map(s => s.email))
        }
    }

    const handleStudentToggle = (email) => {
        if (selectedStudents.includes(email)) {
            setSelectedStudents(selectedStudents.filter(e => e !== email))
        } else {
            setSelectedStudents([...selectedStudents, email])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let emailList = []

        if (mode === 'select') {
            emailList = selectedStudents
            if (emailList.length === 0) {
                toast.error('Please select at least one student')
                return
            }
        } else {
            // Manual email entry
            emailList = emails
                .split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email.length > 0)

            if (emailList.length === 0) {
                toast.error('Please enter at least one email address')
                return
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const invalidEmails = emailList.filter(email => !emailRegex.test(email))

            if (invalidEmails.length > 0) {
                toast.error(`Invalid email format: ${invalidEmails.join(', ')}`)
                return
            }
        }

        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await axios.post(
                `http://localhost:8080/api/enrollments/course/${courseId}/bulk-enroll`,
                emailList,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            setResult(response.data)
            toast.success(response.data.message || 'Students enrolled successfully!')

            if (onSuccess) {
                onSuccess(response.data)
            }
        } catch (error) {
            console.error('Error enrolling students:', error)
            toast.error(error.response?.data?.message || 'Failed to enroll students')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setEmails('')
        setSelectedStudents([])
        setSearchTerm('')
        setResult(null)
        setMode('select')
        onClose()
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UserPlus className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Add Attendees</h2>
                            <p className="text-sm text-gray-600">Enroll students to this course</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Mode Toggle */}
                {!result && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setMode('select')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'select'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Users className="inline mr-2" size={16} />
                                Select Students
                            </button>
                            <button
                                onClick={() => setMode('manual')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'manual'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Mail className="inline mr-2" size={16} />
                                Enter Emails
                            </button>
                        </div>
                    </div>
                )}

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {mode === 'select' ? (
                        <>
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search students by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Select All */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Select All ({filteredStudents.length})
                                    </span>
                                </label>
                                <span className="text-sm text-gray-600">
                                    {selectedStudents.length} selected
                                </span>
                            </div>

                            {/* Student List */}
                            {fetchingStudents ? (
                                <div className="text-center py-8 text-gray-500">Loading students...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No students found</div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto space-y-2">
                                    {filteredStudents.map((student) => (
                                        <label
                                            key={student.id}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student.email)}
                                                onChange={() => handleStudentToggle(student.email)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-600">{student.email}</div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {student.coursesEnrolled} courses
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <Mail className="inline mr-2" size={16} />
                                Student Email Addresses
                            </label>
                            <textarea
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                                placeholder="Enter email addresses (comma or newline separated)&#10;Example:&#10;student1@example.com&#10;student2@example.com, student3@example.com"
                                rows="8"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500">
                                Separate multiple emails with commas or new lines
                            </p>
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
                                                Successfully Enrolled ({result.successCount})
                                            </h4>
                                            <ul className="mt-2 text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
                                                {result.successfulEnrollments.map((email, index) => (
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
                                                Failed to Enroll ({result.failedCount})
                                            </h4>
                                            <ul className="mt-2 text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                                                {result.failedEnrollments.map((error, index) => (
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
                                disabled={loading || (mode === 'select' && selectedStudents.length === 0)}
                                icon={UserPlus}
                            >
                                {loading ? 'Enrolling...' : `Add ${mode === 'select' ? selectedStudents.length : ''} Attendees`}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddAttendeesModal
