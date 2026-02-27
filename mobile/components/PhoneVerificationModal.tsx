import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/lib/api';
import { useRouter } from 'expo-router';

const PURPLE = '#5E2D87';

interface Props {
    visible: boolean;
    existingPhone?: string; // Pre-fill if user has unverified phone
    onVerified: () => void; // Called when verification is complete
    onDismiss: () => void;
}

type Step = 'phone' | 'otp' | 'success';

const PhoneVerificationModal: React.FC<Props> = ({
    visible,
    existingPhone,
    onVerified,
    onDismiss,
}) => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { showToast } = useToast();
    const api = useApi();
    const router = useRouter();

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Polling interval reference
    useEffect(() => {
        let interval: any;

        if (visible && step === 'otp' && !loading) {
            // Start polling every 3 seconds
            interval = setInterval(() => {
                checkStatus(true); // silent check
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [visible, step, loading]);

    // Pre-fill phone if the user already has one
    useEffect(() => {
        if (visible) {
            if (existingPhone) {
                setPhone(existingPhone);
                // Even if phone exists, we might want to offer Magic Verify first
                setStep('phone');
            } else {
                setPhone('');
                setStep('phone');
            }
            setOtp('');
            setError("");
        }
    }, [visible, existingPhone]);

    const handleSendOTP = async () => {
        const cleaned = phone.trim();
        if (!cleaned || cleaned.length < 10) {
            showToast({ type: 'error', title: 'Invalid Number', message: 'Please enter a valid phone number.' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/send-otp', { phoneNumber: cleaned });
            showToast({
                type: 'success',
                title: 'OTP Sent!',
                message: `A verification code has been sent to your WhatsApp (${cleaned}).`,
            });
            setStep('otp');
        } catch (err: any) {
            showToast({ type: 'error', title: 'Send Failed', message: err?.response?.data?.error || 'Could not send OTP. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const code = otp.trim();
        if (!code || code.length < 4) {
            showToast({ type: 'error', title: 'Invalid Code', message: 'Please enter the 6-digit code.' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { phoneNumber: phone, code });

            // Refresh Clerk user to reflect updated metadata
            await user?.reload();

            showToast({ type: 'success', title: 'Verified!', message: 'Your phone number has been verified.' });
            onVerified();
        } catch (err: any) {
            showToast({ type: 'error', title: 'Verification Failed', message: err?.response?.data?.error || 'Invalid or expired code.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMagicVerify = async () => {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned || cleaned.length < 10) {
            showToast({ type: 'error', title: 'Invalid Number', message: 'Please enter a valid phone number (min 10 digits).' });
            return;
        }

        setLoading(true);
        setError(""); // Clear error on retry
        try {
            const response = await api.post('/auth/whatsapp-code', { phoneNumber: cleaned });
            const { code } = response.data;

            const configResponse = await api.get('/config');
            const botNumber = configResponse.data.features.whatsapp_bot_number || "+923488383679";

            const message = `VERIFY:${code}`;
            const whatsappUrl = `whatsapp://send?phone=${botNumber}&text=${encodeURIComponent(message)}`;

            // Fix for Android 11+ Intent Queries: 
            // Instead of canOpenURL (which gets blocked by package visibility restrictions),
            // we fire openURL directly and catch the rejection if the app isn't installed.
            try {
                await Linking.openURL(whatsappUrl);
                showToast({
                    type: 'success',
                    title: 'WhatsApp Opened',
                    message: 'Please send the pre-filled message to verify.'
                });
                setStep('otp');
            } catch (linkingErr) {
                showToast({
                    type: 'error',
                    title: 'WhatsApp Not Found',
                    message: 'Please install WhatsApp to use this feature.'
                });
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.error || 'Could not initiate WhatsApp verification. Please check your connection.';
            showToast({ type: 'error', title: 'Failed', message: errMsg });
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Fetch profile directly for reliability
            const profileRes = await api.get('/users/me');
            const userData = profileRes.data.user;

            if (userData.isPhoneVerified) {
                if (!silent) showToast({ type: 'success', title: 'Success!', message: 'Your account is now verified.' });
                setError("");

                // Refresh Clerk user
                await user?.reload();

                // Transition to success state instead of closing
                setStep('success');
            } else if (userData.lastVerificationError) {
                const errMsg = userData.lastVerificationError;
                if (error !== errMsg) {
                    setError(errMsg);
                    if (!silent) showToast({
                        type: 'error',
                        title: 'Verification Error',
                        message: errMsg
                    });
                }
            } else {
                if (!silent) showToast({ type: 'info', title: 'Not Verified Yet', message: 'Please ensure you have sent the message on WhatsApp.' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.sheet}>
                        {/* Handle */}
                        <View style={styles.handle} />

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="shield-checkmark" size={28} color={PURPLE} />
                            </View>
                            <Text style={styles.title}>Verify Your Phone</Text>
                            <Text style={styles.subtitle}>
                                {step === 'phone'
                                    ? 'Verify your number instantly via WhatsApp - No typing codes needed!'
                                    : step === 'otp'
                                        ? `We've initiated verification for ${phone}. If you sent the message, you're all set.`
                                        : 'Mission Accomplished!'}
                            </Text>
                        </View>

                        {/* Input */}
                        {step === 'success' ? (
                            <View style={styles.successContainer}>
                                <View style={styles.successIconBox}>
                                    <Ionicons name="checkmark" size={48} color="white" />
                                </View>
                                <Text style={styles.successTitle}>Verified Successfully!</Text>
                                <Text style={styles.successSubtitle}>
                                    Your WhatsApp number <Text style={{ fontWeight: 'bold', color: '#111827' }}>{phone}</Text> is now securely linked to your account.
                                </Text>
                                <TouchableOpacity
                                    style={styles.doneButton}
                                    onPress={onVerified}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.buttonText}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        ) : step === 'phone' ? (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="+92 300 1234567"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    maxLength={13}
                                    autoFocus
                                />
                            </View>
                        ) : (
                            <View style={styles.inputGroup}>
                                {error ? (
                                    <View style={styles.errorBox}>
                                        <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                                        <Text style={styles.errorText}>
                                            {error === "Number mismatch detected"
                                                ? "Sender mismatch! Your WhatsApp account doesn't match this number."
                                                : error}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.waitingBox}>
                                        <ActivityIndicator size="small" color={PURPLE} style={{ marginBottom: 8 }} />
                                        <Text style={styles.waitingText}>Waiting for your WhatsApp message...</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={() => {
                                        setStep('phone');
                                        setError("");
                                    }}
                                    style={{ marginTop: 12 }}
                                >
                                    <View style={styles.backButton}>
                                        <Ionicons name="arrow-back" size={16} color={PURPLE} style={{ marginRight: 6 }} />
                                        <Text style={styles.changeLink}>Fix Phone Number / Try Again</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* CTA Button - Only show on phone step */}
                        {step === 'phone' && (
                            <TouchableOpacity
                                style={[styles.button, loading && { opacity: 0.7 }]}
                                onPress={handleMagicVerify}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons
                                            name="logo-whatsapp"
                                            size={20}
                                            color="white"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={styles.buttonText}>Magic Verify via WhatsApp</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}


                        {/* Secondary Action: Go to Account */}
                        <TouchableOpacity
                            onPress={() => {
                                onDismiss();
                                router.push('/(tabs)/profile' as any);
                            }}
                            style={styles.secondaryButton}
                        >
                            <Ionicons name="person-outline" size={18} color={PURPLE} style={{ marginRight: 8 }} />
                            <Text style={styles.secondaryButtonText}>Go to Account Settings</Text>
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity onPress={onDismiss} style={styles.cancel}>
                            <Text style={styles.cancelText}>Not now, go back</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    scrollContainer: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 12,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 0.3,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 21,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    otpInput: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 6,
    },
    changeLink: {
        color: PURPLE,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'right',
    },
    changeLinkCenter: {
        color: PURPLE,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    button: {
        backgroundColor: PURPLE,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cancel: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    cancelText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#F3E8FF',
        backgroundColor: '#FCFAFF',
        marginBottom: 8,
    },
    secondaryButtonText: {
        color: PURPLE,
        fontSize: 15,
        fontWeight: '700',
    },
    waitingBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    waitingText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '600',
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginBottom: 12,
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
        fontWeight: '700',
        flex: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F5F3FF',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 20,
    },
    successIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1DB954', // Distinct success green, or we can use PURPLE here. Let's stick to brand requested.
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
        marginBottom: 32,
    },
    doneButton: {
        backgroundColor: PURPLE,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        width: '100%',
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    }
});

export default PhoneVerificationModal;
