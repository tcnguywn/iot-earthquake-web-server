import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { AlertTriangle, Activity, MapPin, Loader2 } from "lucide-react";
// Bỏ Badge, Wifi, WifiOff, Progress (vì chúng chỉ dùng cho Alerts)

// === 1. ĐỊNH NGHĨA INTERFACE (Phần đang chạy) ===

interface ApiDevice {
    _id: string;
    deviceId: string;
    name: string;
    location: string;
    createdAt: string;
}

interface Device {
    id: string;
    name: string;
    location: string;
    addedDate: string;
}

// === PHẦN CẦN THÊM CHO ALERTS (ĐANG COMMENT) ===
/*
// (Cần import: import { Badge } from "./ui/badge";)

// Interface cho API Alerts (giả định)
interface ApiAlert {
  id: string;
  deviceName: string;
  severity: "low" | "moderate" | "high";
  magnitude: number;
  time: string; // Backend nên xử lý "2 days ago"
}

// Hàm helper để tạo màu
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
*/
// ===============================================

const transformApiDeviceToUi = (apiDevice: ApiDevice): Device => ({
    id: apiDevice.deviceId,
    name: apiDevice.name,
    location: apiDevice.location,
    addedDate: new Date(apiDevice.createdAt).toLocaleDateString(),
});

export function DashboardPage() {
    // === 2. THIẾT LẬP STATE ===
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // === PHẦN CẦN THÊM CHO ALERTS (ĐANG COMMENT) ===
    /*
    const [recentAlerts, setRecentAlerts] = useState<ApiAlert[]>([]);
    */
    // ===============================================

    const { getToken } = useAuth();

    // === 3. GỌI API (Chỉ gọi /api/devices) ===
    useEffect(() => {
        const loadDevices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) throw new Error("Chưa xác thực");

                const authHeader = { Authorization: `Bearer ${token}` };
                const baseUrl = "http://localhost:5001";

                const response = await fetch(`${baseUrl}/api/devices`, { headers: authHeader });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách thiết bị");
                }

                const apiDevices: ApiDevice[] = await response.json();
                setDevices(apiDevices.map(transformApiDeviceToUi));

            } catch (err: any) {
                setError(err.message);
                toast.error(err.message, { duration: 5000 });
            } finally {
                setIsLoading(false);
            }
        };

        loadDevices();
    }, [getToken]);

    // === PHẦN CẦN THÊM CHO ALERTS (ĐANG COMMENT) ===
    /*
    useEffect(() => {
      // Hàm này sẽ lấy alerts (chạy song song với hàm lấy devices)
      const loadAlerts = async () => {
        try {
          const token = await getToken();
          if (!token) return; // Không cần báo lỗi, chỉ âm thầm thất bại

          const authHeader = { Authorization: `Bearer ${token}` };
          const baseUrl = "http://localhost:5001";

          const res = await fetch(`${baseUrl}/api/alerts/recent`, { headers: authHeader });
          if (!res.ok) return;

          const data: ApiAlert[] = await res.json();
          setRecentAlerts(data);

        } catch (err) {
          // Không làm gì nếu lỗi, vì đây là phần phụ
          console.error("Failed to load alerts", err);
        }
      };

      loadAlerts();
    }, [getToken]);
    */
    // ===============================================

    // === 4. HIỂN THỊ TRẠNG THÁI LOADING / ERROR ===
    if (isLoading) {
        // ... (Giữ nguyên code loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg text-gray-600">Đang tải dữ liệu Dashboard...</p>
            </div>
        );
    }

    if (error) {
        // ... (Giữ nguyên code error)
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
                <p className="text-gray-500">Monitor your earthquake detection devices</p>
            </div>

            {/* Stats Grid */}
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
                {/* Đã xóa 3 thẻ Stats còn lại */}
            </div>

            {/* Sửa đổi layout:
        - Thêm 'lg:grid-cols-3' để chia cột
        - Bọc 'Your Devices' trong 'lg:col-span-2'
      */}
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

                {/* === PHẦN CẦN THÊM CHO ALERTS (ĐANG COMMENT) === */}
                {/* Cột 2: Cảnh báo gần đây (CHIẾM 1 PHẦN) */}
                {/*
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Recent Alerts</h2>
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
                      <p className="text-sm">{alert.deviceName}</p>
                      <p className="text-xs opacity-75">{alert.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Magnitude: {alert.magnitude}</span>
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
        */}
                {/* =============================================== */}

            </div>
        </div>
    );
}