import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

const VerifyOtp = () => {
    const [searchParams] = useSearchParams() // Get email from URL params
    const emailFromUrl = searchParams.get('email')

    const [email, setEmail] = useState(emailFromUrl || '')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0) // Timer for resend

    const navigate = useNavigate()

    useEffect(() => {
        if (!emailFromUrl) {
            toast.error("Email missing. Please register or login again.")
            navigate('/login')
        }
    }, [emailFromUrl, navigate])

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleVerify = async (e) => {
        e.preventDefault()
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        setLoading(true)
        try {
            await authService.verifyOtp(email, otp)
            toast.success("Account verified successfully! Please login.")
            navigate('/login')
        } catch (error) {
            console.error("Verification failed", error)
            const msg = error.response?.data?.message || "Verification failed. Invalid code."
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (timeLeft > 0) return

        setResendLoading(true)
        try {
            await authService.resendOtp(email)
            toast.success("Verification code resent to your email.")
            setTimeLeft(60) // 60 seconds cooldown
        } catch (error) {
            console.error("Resend failed", error)
            toast.error("Failed to resend code. Please try again.")
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Verify Your Account</h2>
                    <p className="text-gray-500 text-sm">
                        Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Verification Code</label>
                        <Input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="text-center tracking-widest text-xl font-mono"
                            maxLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3 text-lg font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl"
                        disabled={loading || otp.length !== 6}
                        icon={ArrowRight}
                    >
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm mb-3">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={timeLeft > 0 || resendLoading}
                        className={`flex items-center justify-center gap-2 mx-auto font-bold text-sm ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                            }`}
                    >
                        {resendLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
                    </button>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Back to Login</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp
