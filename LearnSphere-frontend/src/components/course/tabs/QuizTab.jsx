import React from 'react'

const QuizTab = () => {
    return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900">Quiz Management</h3>
            <p className="text-gray-500 mt-2">Create and manage quizzes for your course.</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Create New Quiz
            </button>
        </div>
    )
}

export default QuizTab
