import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { whatsappApi } from "../lib/api";
import {
    WifiIcon,
    WifiOffIcon,
    QrCodeIcon,
    RotateCcwIcon,
    ClockIcon,
    AlertTriangleIcon,
    CheckCircle2Icon,
    LoaderIcon,
    ShieldAlertIcon,
    ActivityIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
    connected: {
        label: "Online",
        badge: "badge-success",
        icon: CheckCircle2Icon,
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
        pulse: "bg-emerald-500",
    },
    waiting_qr: {
        label: "Waiting QR Scan",
        badge: "badge-warning",
        icon: QrCodeIcon,
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
        pulse: "bg-amber-500",
    },
    connecting: {
        label: "Connecting...",
        badge: "badge-info",
        icon: LoaderIcon,
        color: "text-sky-600",
        bg: "bg-sky-50 border-sky-200",
        pulse: "bg-sky-500",
    },
    disconnected: {
        label: "Disconnected",
        badge: "badge-error",
        icon: WifiOffIcon,
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
        pulse: "bg-red-500",
    },
    stopped: {
        label: "Stopped",
        badge: "badge-neutral",
        icon: ShieldAlertIcon,
        color: "text-gray-600",
        bg: "bg-gray-50 border-gray-200",
        pulse: "bg-gray-500",
    },
};

function formatUptime(seconds) {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function WhatsAppPage() {
    const queryClient = useQueryClient();
    const [confirmRestart, setConfirmRestart] = useState(false);

    const {
        data: status,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["whatsappStatus"],
        queryFn: whatsappApi.getStatus,
        refetchInterval: 5000,
    });

    const {
        data: qrData,
        isLoading: qrLoading,
    } = useQuery({
        queryKey: ["whatsappQr"],
        queryFn: whatsappApi.getQr,
        enabled: status?.status === "waiting_qr",
        refetchInterval: status?.status === "waiting_qr" ? 10000 : false,
    });

    const restartMutation = useMutation({
        mutationFn: whatsappApi.restart,
        onSuccess: () => {
            toast.success("WhatsApp bot restart initiated!");
            setConfirmRestart(false);
            queryClient.invalidateQueries({ queryKey: ["whatsappStatus"] });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to restart bot");
        },
    });

    const cfg = STATUS_CONFIG[status?.status] || STATUS_CONFIG.disconnected;
    const StatusIcon = cfg.icon;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                        WhatsApp Bot
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor and manage your WhatsApp verification bot
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        {status?.status === "connected" && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.pulse} opacity-75`}></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.pulse}`}></span>
                    </span>
                    <span className={`badge ${cfg.badge} badge-sm font-semibold gap-1`}>
                        {cfg.label}
                    </span>
                </div>
            </div>

            {/* LOADING STATE */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            )}

            {/* ERROR STATE */}
            {isError && (
                <div className="card bg-red-50 border border-red-200">
                    <div className="card-body items-center text-center py-12">
                        <WifiOffIcon className="w-12 h-12 text-red-400 mb-3" />
                        <h3 className="font-bold text-red-800 text-lg">Cannot Reach Server</h3>
                        <p className="text-red-600 text-sm max-w-md">
                            Unable to fetch WhatsApp bot status. Ensure the backend is running and the API is accessible.
                        </p>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            {status && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* STATUS CARD */}
                    <div className={`card border shadow-sm ${cfg.bg}`}>
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-xl ${cfg.bg}`}>
                                    <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Connection Status</h3>
                                    <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Uptime */}
                                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Uptime</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {formatUptime(status.uptime)}
                                        </p>
                                    </div>
                                </div>

                                {/* 440 Conflicts */}
                                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                                    <ActivityIcon className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Reconnect Attempts</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {status.reconnectAttempts || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* QR Timeouts */}
                                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                                    <QrCodeIcon className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">QR Timeouts</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {status.qrTimeoutCount || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR CODE CARD */}
                    <div className="card bg-white border border-base-200 shadow-sm">
                        <div className="card-body items-center text-center">
                            <h3 className="font-bold text-gray-800 text-lg mb-2">QR Code</h3>

                            {status.status === "waiting_qr" ? (
                                <div className="space-y-4">
                                    {qrLoading ? (
                                        <div className="w-64 h-64 flex items-center justify-center bg-base-100 rounded-xl">
                                            <span className="loading loading-spinner loading-lg text-primary"></span>
                                        </div>
                                    ) : qrData?.qr ? (
                                        <div className="p-3 bg-white rounded-xl border-2 border-dashed border-amber-300 shadow-inner">
                                            <img
                                                src={qrData.qr}
                                                alt="WhatsApp QR Code"
                                                className="w-64 h-64 object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-64 h-64 flex items-center justify-center bg-base-100 rounded-xl">
                                            <p className="text-gray-400 text-sm">QR not available yet</p>
                                        </div>
                                    )}
                                    <p className="text-sm text-amber-600 font-medium">
                                        Open WhatsApp → Linked Devices → Scan this QR
                                    </p>
                                </div>
                            ) : status.status === "connected" ? (
                                <div className="py-8 space-y-3">
                                    <div className="p-4 rounded-full bg-emerald-50 inline-block">
                                        <WifiIcon className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <p className="text-emerald-700 font-semibold">Bot is connected!</p>
                                    <p className="text-gray-500 text-sm">No QR code needed.</p>
                                </div>
                            ) : (
                                <div className="py-8 space-y-3">
                                    <div className="p-4 rounded-full bg-gray-100 inline-block">
                                        <QrCodeIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-semibold">QR not available</p>
                                    <p className="text-gray-500 text-sm">
                                        Bot is {status.status}. Restart to generate a new QR.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CONTROLS CARD */}
                    <div className="card bg-white border border-base-200 shadow-sm">
                        <div className="card-body">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Controls</h3>

                            {/* Last Error */}
                            {status.lastError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-red-500 font-semibold mb-1">Last Error</p>
                                            <p className="text-xs text-red-700">{status.lastError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Restart Button */}
                            <div className="space-y-3">
                                {!confirmRestart ? (
                                    <button
                                        onClick={() => setConfirmRestart(true)}
                                        className="btn btn-outline btn-block gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
                                    >
                                        <RotateCcwIcon className="w-4 h-4" />
                                        Restart Bot
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 text-center font-medium">
                                            Are you sure? This will disconnect and reconnect the bot.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => restartMutation.mutate()}
                                                disabled={restartMutation.isPending}
                                                className="btn btn-error btn-sm flex-1 text-white"
                                            >
                                                {restartMutation.isPending ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    "Yes, Restart"
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setConfirmRestart(false)}
                                                className="btn btn-ghost btn-sm flex-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WhatsAppPage;
