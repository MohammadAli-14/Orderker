import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
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
import { useProfile } from '@/hooks/useProfile';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SafeScreen from '@/components/SafeScreen';

const PURPLE = '#5E2D87';

type Step = 'phone' | 'otp' | 'success';

const VerifyPhoneScreen = () => {
    const { user } = useUser();
    const { showToast } = useToast();
    const api = useApi();
    const { profile, isLoading: isProfileLoading, refreshProfile } = useProfile();
    const router = useRouter();
    const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Polling interval reference
    useEffect(() => {
        let interval: any;

        if (step === 'otp' && !loading) {
            // Start polling every 3 seconds
            interval = setInterval(() => {
                checkStatus(true); // silent check
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, loading]);

    // Initial check for verified status
    useEffect(() => {
        if (profile?.isPhoneVerified) {
            setStep('success');
        }
    }, [profile?.isPhoneVerified]);

    const handleMagicVerify = async () => {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned || cleaned.length < 10) {
            setError('Please enter a valid phone number (min 10 digits).');
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
            setError(errMsg);
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

                // Refresh everything
                await user?.reload();
                await refreshProfile();

                // Transition to success state
                setStep('success');
            } else if (userData.lastVerificationError) {
                const errMsg = userData.lastVerificationError;
                setError(errMsg);

                // CRITICAL FIX: If we have a definitive error, switch back to 'phone' step
                // so the user can actually SEE the error and change the number.
                setStep('phone');

                if (!silent) showToast({
                    type: 'error',
                    title: 'Verification Error',
                    message: errMsg
                });
            } else {
                if (!silent) showToast({ type: 'info', title: 'Not Verified Yet', message: 'Please ensure you have sent the message on WhatsApp.' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleReturn = () => {
        if (returnTo) {
            router.replace(returnTo as any);
        } else {
            router.back();
        }
    };

    if (isProfileLoading && !profile) {
        return (
            <SafeScreen>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={PURPLE} />
                </View>
            </SafeScreen>
        );
    }

    return (
        <SafeScreen>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Verification</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Status Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons
                                    name={step === 'success' ? "checkmark-circle" : "shield-checkmark"}
                                    size={40}
                                    color={PURPLE}
                                />
                            </View>
                        </View>

                        <Text style={styles.title}>
                            {step === 'success' ? 'Verified!' : 'Verify Your Phone'}
                        </Text>

                        <Text style={styles.subtitle}>
                            {step === 'phone'
                                ? 'Verify your number instantly via WhatsApp - No typing codes needed!'
                                : step === 'otp'
                                    ? `We've initiated verification for ${phone}. If you sent the message, you're all set.`
                                    : 'Your WhatsApp number is now securely linked to your account.'}
                        </Text>

                        {step === 'success' ? (
                            <View style={styles.successBox}>
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-done" size={20} color="white" />
                                    <Text style={styles.verifiedText}>Securely Linked</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleReturn}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.buttonText}>Continue to Place Order</Text>
                                </TouchableOpacity>
                            </View>
                        ) : step === 'phone' ? (
                            <View style={styles.inputSection}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={[styles.input, error ? styles.inputError : null]}
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        if (error) setError("");
                                    }}
                                    placeholder="+92 300 1234567"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    maxLength={13}
                                    autoFocus
                                />
                                {error ? (
                                    <View style={styles.errorBox}>
                                        <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                                        <Text style={styles.errorText}>{error}</Text>
                                    </View>
                                ) : null}

                                <TouchableOpacity
                                    style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                                    onPress={handleMagicVerify}
                                    disabled={loading}
                                    activeOpacity={0.85}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <View style={styles.buttonInner}>
                                            <Ionicons name="logo-whatsapp" size={22} color="white" style={{ marginRight: 10 }} />
                                            <Text style={styles.buttonText}>Magic Verify via WhatsApp</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.waitingSection}>
                                <View style={styles.waitingCard}>
                                    <ActivityIndicator size="large" color={PURPLE} style={{ marginBottom: 16 }} />
                                    <Text style={styles.waitingTitle}>Waiting for Message...</Text>
                                    <Text style={styles.waitingSubtitle}>
                                        Please don't close this screen while we verify your number.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setStep('phone')}
                                    style={styles.retryButton}
                                >
                                    <Ionicons name="refresh" size={18} color={PURPLE} style={{ marginRight: 8 }} />
                                    <Text style={styles.retryText}>Try a different number</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => checkStatus(false)}
                                    style={styles.manualCheck}
                                >
                                    <Text style={styles.manualCheckText}>Sent it? Check manually</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    inputSection: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 18,
        color: '#111827',
        marginBottom: 16,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    primaryButton: {
        backgroundColor: '#4C1D95', // Deeper, more vibrant purple shading
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#4C1D95',
        shadowOffset: { width: 0, height: 10 }, // Stronger depth
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12, // More pronounced elevation on Android
        borderWidth: 1,
        borderColor: '#5B21B6',
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    waitingSection: {
        alignItems: 'center',
    },
    waitingCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    waitingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    waitingSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    retryText: {
        color: PURPLE,
        fontSize: 15,
        fontWeight: '600',
    },
    manualCheck: {
        marginTop: 12,
        padding: 12,
    },
    manualCheckText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    successBox: {
        width: '100%',
        alignItems: 'center',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB954',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 32,
    },
    verifiedText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 6,
    }
});

export default VerifyPhoneScreen;
