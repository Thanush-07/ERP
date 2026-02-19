import { AlertCircle } from 'lucide-react';

export default function ChangeRequestPendingBanner() {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
                <p className="font-medium">Update Request Pending</p>
                <p className="text-sm opacity-90">
                    Your changes have been submitted and are pending approval from the faculty. You cannot make further edits until this request is processed.
                </p>
            </div>
        </div>
    );
}
