import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { AlertTriangle, Activity, MapPin, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge"; // Bỏ comment
import { formatDistanceToNow } from 'date-fns'; // Dùng thư viện để format time ago
// (Bạn cần cài: npm install date-fns)

// === 1. ĐỊNH NGHĨA INTERFACE ===

// Interface cho Device (giống file trước)
interface ApiDevice {
    _id: string;
    deviceId: string;
    name: string;
    location: string;
    createdAt: string;
    // Thêm các trường từ backend (để đầy đủ)
    status: "online" | "offline";
    lastMagnitude: number;
    lastRssi: number;
}
interface UiDevice {
    id: string;
    name: string;
    location: string;
    addedDate: string;
}

// Interface cho API Recent Alerts
// Backend (getRecentAlerts) trả về DataEntry + populated device
interface ApiRecentAlert {
    _id: string;
    magnitude: number;
    level: number; // 1, 2, or 3
    receivedAt: string; // ISO date string
    device: {
        name: string;
        location: string;
    }
}

// Interface cho UI Recent Alerts
interface UiAlert {
  id: string;
  deviceName: string;
  severity: "low" | "moderate" | "high";
  magnitude: number;
  time: string; // vd: "5 minutes ago"
}

// === 2. HÀM HELPERS ===

const levelToSeverity = (level: number): "low" | "moderate" | "high" => {
    if (level === 3) return "high";
    if (level === 2) return "moderate";
    return "low";
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "moderate":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "low":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const transformApiDeviceToUi = (apiDevice: ApiDevice): UiDevice => ({
    id: apiDevice.deviceId,
    name: apiDevice.name,
    location: apiDevice.location || "N/A",
    addedDate: new Date(apiDevice.createdAt).toLocaleDateString(),
});

const transformApiAlertToUi = (apiAlert: ApiRecentAlert): UiAlert => ({
    id: apiAlert._id,
    deviceName: apiAlert.device.name,
    severity: levelToSeverity(apiAlert.level),
    magnitude: apiAlert.magnitude,
    time: formatDistanceToNow(new Date(apiAlert.receivedAt), { addSuffix: true }),
});


export function DashboardPage() {
    const [devices, setDevices] = useState<UiDevice[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<UiAlert[]>([]); // Dùng UiAlert
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();

    // === 3. GỌI API (Song song) ===
    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) throw new Error("Chưa xác thực");

                const authHeader = { Authorization: `Bearer ${token}` };
                const baseUrl = "http://localhost:5001";

                // Gọi song song 2 API
                const [devicesRes, alertsRes] = await Promise.all([
                    fetch(`${baseUrl}/api/devices`, { headers: authHeader }),
                    fetch(`${baseUrl}/api/alerts/recent`, { headers: authHeader })
                ]);

                // Xử lý Devices
                if (!devicesRes.ok) {
                    throw new Error("Không thể tải danh sách thiết bị");
                }
                const apiDevices: ApiDevice[] = await devicesRes.json();
                setDevices(apiDevices.map(transformApiDeviceToUi));

                // Xử lý Alerts
                if (alertsRes.ok) {
                    const apiAlerts: ApiRecentAlert[] = await alertsRes.json();
                    setRecentAlerts(apiAlerts.map(transformApiAlertToUi));
                } else {
                    // Không chặn nếu chỉ lỗi alert
                    console.error("Không thể tải cảnh báo gần đây");
                }

            } catch (err: any) {
                setError(err.message);
                toast.error(err.message, { duration: 5000 });
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [getToken]);

    // === 4. HIỂN THỊ TRẠNG THÁI LOADING / ERROR ===
    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg text-gray-600">Đang tải dữ liệu Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="p-8 text-center bg-red-50 border-red-200">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Lỗi tải dữ liệu</h2>
                    <p className="text-red-600">{error}</p>
                </Card>
            </div>
        );
    }

    // === 5. HIỂN THỊ DỮ LIỆU ===
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-500">Tổng quan về hệ thống giám sát của bạn</p>
            </div>

            {/* Stats Grid (Chỉ 1 cái) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 md:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Devices</p>
                            <p className="text-3xl">{devices.length}</p>
                        </div>
                        <Activity className="w-10 h-10 text-blue-600" />
                    </div>
                </Card>
            </div>

            {/* Layout 2 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột 1: Danh sách thiết bị (CHIẾM 2 PHẦN) */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h2 className="text-gray-900 mb-4">Your Devices</h2>
                        <div className="space-y-4">
                            {devices.map((device) => (
                                <div
                                    key={device.id}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium">{device.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {device.location}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Device ID</p>
                                                    <p className="text-sm">{device.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Added Date</p>
                                                    <p className="text-sm">{device.addedDate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {devices.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No devices found</p>
                                    <p className="text-xs mt-1">Go to the 'Devices' page to add your first one.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Cột 2: Cảnh báo gần đây (CHIẾM 1 PHẦN) */}
                <div className="lg:col-span-1">
                  <Card className="p-6">
                    <h2 className="text-gray-900 mb-4">Recent Alerts (Level {'>='} 2)</h2>
                    <div className="space-y-3">
                      {recentAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${getSeverityColor(
                            alert.severity
                          )}`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{alert.deviceName}</p>
                              <p className="text-xs opacity-75">{alert.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Magnitude: {alert.magnitude.toFixed(4)}</span>
                            <Badge variant="secondary" className="capitalize">
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {recentAlerts.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent alerts</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

            </div>
        </div>
    );
}