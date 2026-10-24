import { useState } from 'react';
import { Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundService } from '../services/audio';

interface PinLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  correctPin: string;
  isSettingNewPin?: boolean;
  onPinConfigured?: (newPin: string) => void;
  onCloseModal?: () => void;
}

export function PinLockModal({
  isOpen,
  onUnlock,
  correctPin,
  isSettingNewPin = false,
  onPinConfigured,
  onCloseModal,
}: PinLockModalProps) {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [shakeKey, setShakeKey] = useState<number>(0);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    soundService.playSlideClick();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        // Evaluate
        if (isSettingNewPin) {
          if (step === 'enter') {
            setTimeout(() => {
              setStep('confirm');
              setConfirmPin(nextPin);
              setPin('');
            }, 200);
          } else {
            // Check confirm match
            if (nextPin === confirmPin) {
              soundService.playHabitComplete();
              onPinConfigured?.(nextPin);
            } else {
              setErrorMsg('PINs do not match. Try again.');
              setShakeKey((k) => k + 1);
              setPin('');
              setStep('enter');
            }
          }
        } else {
          // Verify existing PIN
          if (nextPin === correctPin) {
            soundService.playHabitComplete();
            onUnlock();
          } else {
            setErrorMsg('Incorrect PIN. Please try again.');
            setShakeKey((k) => k + 1);
            setTimeout(() => {
              setPin('');
            }, 350);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    soundService.playSlideClick();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      <motion.div
        id="pin-lock-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#100713]/85 backdrop-blur-md p-4"
      >
        <motion.div
          key={shakeKey}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, x: shakeKey > 0 ? [-8, 8, -6, 6, 0] : 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-xs majestic-card rounded-3xl p-6 shadow-2xl text-center text-slate-100 border border-[#DE72B5]/30"
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white mb-4 shadow-lg">
            {isSettingNewPin ? <KeyRound className="w-7 h-7 text-[#FFBBE2]" /> : <Lock className="w-7 h-7 text-[#FFBBE2]" />}
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight font-serif uppercase">
            {isSettingNewPin
              ? step === 'enter'
                ? 'Set 4-Digit PIN'
                : 'Confirm 4-Digit PIN'
              : 'Maestroso Vault'}
          </h2>

          <p className="text-xs text-[#DDD8E2] mt-1 mb-6">
            {isSettingNewPin
              ? step === 'enter'
                ? 'Create a PIN to protect your practice notes and repertoire logs'
                : 'Re-enter your 4-digit PIN to confirm'
              : 'Enter your 4-digit security PIN to access your practice logs'}
          </p>

          {/* 4-dot PIN indicator */}
          <div className="flex justify-center items-center gap-4 mb-6">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              return (
                <motion.div
                  key={index}
                  animate={{ scale: isFilled ? 1.2 : 1 }}
                  className={`w-4 h-4 rounded-full transition-colors ${
                    isFilled ? 'bg-[#DE72B5] shadow-md shadow-[#DE72B5]/60' : 'bg-[#2D1A36] border border-[#4D2B5B]'
                  }`}
                />
              );
            })}
          </div>

          {errorMsg && (
            <div className="text-xs text-[#FFBBE2] bg-[#40234D] border border-[#DE72B5]/40 rounded-xl py-1.5 px-3 mb-4 flex items-center justify-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-[#DE72B5]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                id={`pin-btn-${digit}`}
                type="button"
                onClick={() => handleDigit(digit)}
                className="w-16 h-14 rounded-2xl bg-[#2D1A36] hover:bg-[#40234D] active:bg-[#B63E88] text-lg font-bold text-white transition-all shadow-md flex items-center justify-center active:scale-95 mx-auto border border-[#4D2B5B]"
              >
                {digit}
              </button>
            ))}
            <button
              id="pin-clear-btn"
              type="button"
              onClick={handleClear}
              className="w-16 h-14 rounded-2xl bg-[#1D0F22] hover:bg-[#2D1A36] text-xs font-semibold text-[#B8A9C2] transition-all flex items-center justify-center mx-auto border border-[#4D2B5B]"
            >
              Clear
            </button>
            <button
              id="pin-btn-0"
              type="button"
              onClick={() => handleDigit('0')}
              className="w-16 h-14 rounded-2xl bg-[#2D1A36] hover:bg-[#40234D] active:bg-[#B63E88] text-lg font-bold text-white transition-all shadow-md flex items-center justify-center active:scale-95 mx-auto border border-[#4D2B5B]"
            >
              0
            </button>
            <button
              id="pin-backspace-btn"
              type="button"
              onClick={handleBackspace}
              className="w-16 h-14 rounded-2xl bg-[#1D0F22] hover:bg-[#2D1A36] text-xs font-semibold text-[#B8A9C2] transition-all flex items-center justify-center mx-auto border border-[#4D2B5B]"
            >
              ⌫
            </button>
          </div>

          {onCloseModal && (
            <button
              id="pin-cancel-btn"
              type="button"
              onClick={onCloseModal}
              className="mt-2 text-xs text-[#B8A9C2] hover:text-white underline underline-offset-2 font-medium"
            >
              Cancel
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
