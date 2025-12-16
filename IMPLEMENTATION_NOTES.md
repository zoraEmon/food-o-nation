# Registration & Authentication Implementation Notes

## Changes Made:

### 1. Beneficiary Registration Form
- ✅ Added `password` and `confirmPassword` fields with toggle visibility (eye icons)
- ✅ Added form state tracking with `hasUnsavedChanges`
- ✅ Added navigation warning when user tries to leave page with unsaved data
- ✅ Updated payload to use actual password instead of hardcoded temp password
- ✅ Show OTP modal after successful registration

### 2. Add These Functions to Page (after handleSubmit):

```typescript
  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setOtpLoading(true);
    setError("");
    
    try {
      await authService.verifyOtp({ email: formData.email, otp });
      alert("Verification successful! Please log in.");
      setShowOtpModal(false);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };
```

### 3. Add OTP Modal JSX (before </main> closing tag):

```tsx
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0a291a] rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#004225] dark:text-white mb-4">Verify Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've sent a 6-digit verification code to <strong>{formData.email}</strong>. Please enter it below.
            </p>
            
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className={`${inputClass} text-center text-2xl tracking-widest mb-6`}
            />
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleOtpVerification}
                disabled={otpLoading || otp.length !== 6}
                className="flex-1 bg-[#ffb000] text-black hover:bg-[#ffc107]"
              >
                {otpLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setError("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
```

### 4. Next Steps:

1. **Login Page Updates**: Handle unverified users (show error + resend OTP option)
2. **Auth Context**: Create proper session management
3. **Protected Routes**: Add authentication middleware
4. **Resend OTP**: Add endpoint and UI for resending verification codes

### Backend Status:
- ✅ Multiple file uploads working (profileImage, governmentIdFile, signature)
- ✅ HouseholdPosition enum added to validator
- ✅ Registration endpoint fully functional
- ✅ OTP generation and email sending implemented

