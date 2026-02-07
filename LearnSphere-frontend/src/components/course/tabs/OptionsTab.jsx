import React from 'react'
import Card from '../../common/Card'
import { Shield, Eye, Lock, IndianRupee } from 'lucide-react'

const OptionsTab = ({ formData, setFormData, adminUsers, user }) => {
    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-blue-600" />
                        Course Options & Access Rules
                    </h3>

                    <div className="space-y-6">
                        {/* Visibility Section */}
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                            <label className="block text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
                                <Eye size={16} />
                                Show course to (Visibility)
                            </label>
                            <p className="text-sm text-purple-700 mb-4">
                                Control who can see this course in the course listing.
                            </p>

                            <select
                                value={formData.visibility || 'EVERYONE'}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                <option value="EVERYONE">Everyone (including guests)</option>
                                <option value="SIGNED_IN">Signed In Users Only</option>
                            </select>

                            <p className="text-xs text-purple-600 mt-2">
                                * "Everyone" allows guests to see the course. "Signed In" requires login to view.
                            </p>
                        </div>

                        {/* Access Rule Section */}
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                            <label className="block text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                                <Lock size={16} />
                                Access Rule
                            </label>
                            <p className="text-sm text-green-700 mb-4">
                                Control who can enroll and start learning this course.
                            </p>

                            <select
                                value={formData.accessRule || 'OPEN'}
                                onChange={(e) => setFormData({ ...formData, accessRule: e.target.value })}
                                className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            >
                                <option value="OPEN">Open (Anyone can enroll)</option>
                                <option value="ON_INVITATION">On Invitation (Invite only)</option>
                                <option value="ON_PAYMENT">On Payment (Paid course)</option>
                            </select>

                            <p className="text-xs text-green-600 mt-2">
                                * "Open" allows free enrollment. "On Invitation" requires manual approval. "On Payment" requires payment.
                            </p>
                        </div>

                        {/* Price Section (Conditional) */}
                        {formData.accessRule === 'ON_PAYMENT' && (
                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                                <label className="block text-sm font-medium text-yellow-900 mb-2 flex items-center gap-2">
                                    <IndianRupee size={16} />
                                    Price (INR)
                                </label>
                                <p className="text-sm text-yellow-700 mb-4">
                                    Set the price for this course (required for paid courses).
                                </p>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : '' })}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                                    />
                                </div>

                                <p className="text-xs text-yellow-600 mt-2">
                                    * Price must be greater than 0 for paid courses.
                                </p>
                            </div>
                        )}

                        {/* Admin Selector */}
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                Course Administrator
                            </label>
                            <p className="text-sm text-blue-700 mb-4">
                                Assign an admin to help manage this course. They will have full access to edit and manage the course content.
                            </p>

                            <select
                                value={formData.courseAdminUserId || ''}
                                onChange={(e) => setFormData({ ...formData, courseAdminUserId: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">-- Select an Admin --</option>
                                {adminUsers.map(admin => (
                                    <option key={admin.id} value={admin.id}>
                                        {admin.name} ({admin.email})
                                    </option>
                                ))}
                            </select>

                            <p className="text-xs text-blue-600 mt-2">
                                * Only users with ADMIN role are listed here.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default OptionsTab
