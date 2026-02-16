import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput, Linking } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useProfile } from "@/hooks/useProfile";
import { useAddresses } from "@/hooks/useAddressess";
import { Image } from "expo-image";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { useToast } from "@/context/ToastContext";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";

const AccountInfoScreen = () => {
    const { user: clerkUser } = useUser();
    const { profile, updateProfile, isLoading: profileLoading } = useProfile();
    const { addresses, isLoading: addressesLoading } = useAddresses();
    const { showToast } = useToast();

    const [addressModalVisible, setAddressModalVisible] = useState(false);

    // Phone state
    const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || "");
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    // Name state
    const [name, setName] = useState(clerkUser?.fullName || "");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);

    useEffect(() => {
        if (profile?.phoneNumber) {
            setPhoneNumber(profile.phoneNumber);
        }
    }, [profile?.phoneNumber]);

    useEffect(() => {
        if (clerkUser?.fullName) {
            setName(clerkUser.fullName);
        }
    }, [clerkUser?.fullName]);

    const handleUpdateName = async () => {
        if (!name.trim()) return;

        setIsSavingName(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const [firstName, ...lastNameParts] = name.trim().split(" ");
            const lastName = lastNameParts.join(" ");

            // 1. Update Clerk (Primary Auth Identity)
            await clerkUser?.update({
                firstName,
                lastName: lastName || undefined,
            });

            // 2. Update Backend (Database Sync)
            await updateProfile({ name: name.trim() });

            setIsEditingName(false);
            showToast({ title: "Profile Updated", message: "Name updated successfully!", type: "success" });
        } catch (error) {
            console.error("Failed to update name:", error);
            showToast({ title: "Update Failed", message: "Could not update name. Please try again.", type: "error" });
        } finally {
            setIsSavingName(false);
        }
    };

    const { loaded, buildUserProfileUrl } = useClerk();

    const handleManageAccount = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!loaded) return;

        try {
            const url = await buildUserProfileUrl();
            console.log("Opening Manage Account URL:", url);

            if (url && typeof url === 'string') {
                await WebBrowser.openBrowserAsync(url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                    controlsColor: "#5E2D87",
                    toolbarColor: "white"
                });
            } else {
                showToast({ title: "Error", message: "Could not open account settings.", type: "error" });
            }
        } catch (error) {
            console.error("Error opening profile:", error);
            showToast({ title: "Error", message: "Failed to load account portal.", type: "error" });
        }
    };

    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

    if (profileLoading || addressesLoading) {
        return (
            <SafeScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#5E2D87" />
                </View>
            </SafeScreen>
        );
    }

    return (
        <SafeScreen>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Information</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={clerkUser?.imageUrl}
                            style={styles.avatar}
                            transition={200}
                        />
                        <View style={styles.verifiedBadge}>
                            <Ionicons
                                name={profile?.isPhoneVerified ? "checkmark" : "time-outline"}
                                size={14}
                                color="white"
                            />
                        </View>
                    </View>

                    {/* Editable Name */}
                    {isEditingName ? (
                        <View style={styles.nameEditContainer}>
                            <TextInput
                                style={styles.nameInput}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                placeholder="Your Name"
                            />
                            <View style={styles.nameEditActions}>
                                <TouchableOpacity
                                    style={styles.saveNameButton}
                                    onPress={handleUpdateName}
                                    disabled={isSavingName}
                                >
                                    {isSavingName ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Ionicons name="checkmark" size={18} color="white" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelNameButton}
                                    onPress={() => {
                                        setName(clerkUser?.fullName || "");
                                        setIsEditingName(false);
                                    }}
                                    disabled={isSavingName}
                                >
                                    <Ionicons name="close" size={18} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.nameDisplayContainer}
                            onPress={() => setIsEditingName(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.userName}>{clerkUser?.fullName || name}</Text>
                            <View style={styles.editNameIconBadge}>
                                <Ionicons name="pencil" size={12} color="white" />
                            </View>
                        </TouchableOpacity>
                    )}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: profile?.isPhoneVerified ? "#1DB95420" : "#F59E0B20" }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: profile?.isPhoneVerified ? "#1DB954" : "#F59E0B" }
                        ]}>
                            {profile?.isPhoneVerified ? "Verified Member" : "Not Verified"}
                        </Text>
                    </View>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="mail-outline" size={20} color="#5E2D87" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{clerkUser?.primaryEmailAddress?.emailAddress}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="call-outline" size={20} color="#5E2D87" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                {isEditingPhone ? (
                                    <TextInput
                                        style={styles.phoneInput}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                        placeholder="Enter phone number"
                                        autoFocus
                                    />
                                ) : (
                                    <Text style={styles.infoValue}>{profile?.phoneNumber || "Not added yet"}</Text>
                                )}
                            </View>
                            {isEditingPhone ? (
                                <View style={styles.editActions}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                            updateProfile({ phoneNumber });
                                            setIsEditingPhone(false);
                                            showToast({ title: "Profile Updated", message: "Phone number saved successfully!", type: "success" });
                                        }}
                                    >
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setPhoneNumber(profile?.phoneNumber || "");
                                            setIsEditingPhone(false);
                                        }}
                                    >
                                        <Ionicons name="close" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setIsEditingPhone(true)}
                                >
                                    <Ionicons name="create-outline" size={20} color="#5E2D87" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* WhatsApp Verification */}
                        {!profile?.isPhoneVerified && profile?.phoneNumber && (
                            <TouchableOpacity
                                style={styles.whatsappVerifyBox}
                                onPress={() => {
                                    const message = `Hi OrderKer Support, I'd like to verify my account. ID: ${profile._id}. My registered number is ${profile.phoneNumber}.`;
                                    Linking.openURL(`whatsapp://send?phone=+923488383679&text=${encodeURIComponent(message)}`);
                                }}
                            >
                                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                                <Text style={styles.whatsappVerifyText}>Verify Account via WhatsApp</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Shipping Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setAddressModalVisible(true);
                            }}
                        >
                            <Text style={styles.actionText}>Change</Text>
                        </TouchableOpacity>
                    </View>

                    {defaultAddress ? (
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <View style={styles.addressLabelBox}>
                                    <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
                                </View>
                                {defaultAddress.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>DEFAULT</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.addressName}>{defaultAddress.fullName}</Text>
                            <Text style={styles.addressText}>{defaultAddress.streetAddress}</Text>
                            <Text style={styles.addressText}>{defaultAddress.city}, {defaultAddress.state}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.emptyAddressBox}
                            onPress={() => router.push("/addresses")}
                        >
                            <Ionicons name="location-outline" size={24} color="#9CA3AF" />
                            <Text style={styles.emptyAddressText}>Add a shipping address</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Security</Text>
                    <TouchableOpacity
                        style={styles.securityRow}
                        activeOpacity={0.7}
                        onPress={handleManageAccount}
                    >
                        <View style={styles.securityIconBox}>
                            <Ionicons name="settings-outline" size={20} color="#5E2D87" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.securityText}>Manage Account</Text>
                            <Text style={styles.securitySubText}>Password, Sessions, 2FA</Text>
                        </View>
                        <Ionicons name="open-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AddressSelectionModal
                visible={addressModalVisible}
                onClose={() => setAddressModalVisible(false)}
                allowLive={false}
                onProceed={(address) => {
                    setAddressModalVisible(false);
                    // In a real app, we might update the default address via API here
                    showToast({ title: "Address Switched", message: `Primary address set to ${address.label}`, type: "success" });
                }}
                isProcessing={false}
            />
        </SafeScreen>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#5E2D87',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#5E2D87',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5E2D87',
    },
    infoBox: {
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#5E2D8710',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
    verifyButton: {
        backgroundColor: '#5E2D87',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    addressCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressLabelBox: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    addressLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4B5563',
        textTransform: 'uppercase',
    },
    defaultBadge: {
        backgroundColor: '#5E2D8710',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#5E2D87',
    },
    addressName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    emptyAddressBox: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderStyle: 'dashed',
    },
    emptyAddressText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    securityRow: {
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    securityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EF444410',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    securityText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    phoneInput: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        paddingVertical: 2,
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    saveButton: {
        backgroundColor: '#5E2D87',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
        padding: 4,
    },
    whatsappVerifyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D36610',
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#25D36630',
        gap: 8,
    },
    whatsappVerifyText: {
        color: '#25D366',
        fontWeight: '700',
        fontSize: 13,
    },
    // Name Editing Styles
    nameEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    nameInput: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        borderBottomWidth: 2,
        borderBottomColor: '#5E2D87',
        minWidth: 150,
        textAlign: 'center',
        paddingVertical: 4,
    },
    nameEditActions: {
        flexDirection: 'row',
        gap: 8,
    },
    saveNameButton: {
        backgroundColor: '#5E2D87',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelNameButton: {
        backgroundColor: '#F3F4F6',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    editNameIconBadge: {
        backgroundColor: '#5E2D87',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
    },
    securitySubText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
});

export default AccountInfoScreen;
