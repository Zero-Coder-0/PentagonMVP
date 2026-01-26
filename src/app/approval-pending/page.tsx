import { Clock } from 'lucide-react'

export default function ApprovalPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Approval Pending
        </h1>
        <p className="text-slate-600">
          Your account is awaiting approval from an administrator. 
          You'll receive an email once your role has been assigned.
        </p>
      </div>
    </div>
  )
}
