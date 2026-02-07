import React, { useState, useEffect } from 'react'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Input from '../../common/Input'
import { X } from 'lucide-react'

const TopicModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [level, setLevel] = useState('BEGINNER')

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '')
            setDescription(initialData.description || '')
            setLevel(initialData.level || 'BEGINNER')
        } else {
            // Reset form on open if no data
            setName('')
            setDescription('')
            setLevel('BEGINNER')
        }
    }, [isOpen, initialData])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({
            name,
            description,
            level,
            orderIndex: initialData?.orderIndex ?? 0
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 transition-all duration-300">
            <Card className="max-w-lg w-full p-6 border-2 border-blue-400 shadow-xl rounded-2xl bg-white/90 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Topic' : 'Add New Topic'}
                    </h3>
                    <button onClick={onClose}>
                        <X size={24} className="text-gray-500 hover:text-gray-700" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Topic Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </select>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            {initialData ? 'Update Topic' : 'Add Topic'}
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

export default TopicModal
