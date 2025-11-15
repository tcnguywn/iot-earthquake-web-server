import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/clerk-react"; // Bỏ comment khi sẵn sàng
// import { toast } from "sonner"; // Bỏ comment khi sẵn sàng
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { AlertTriangle, MapPin, Clock, Activity, Search, Loader2 } from "lucide-react";

// 1. INTERFACE CHO UI (Hiển thị)
interface Alert {
    id: string; // Sẽ map từ `_id`
    deviceId: string;
    deviceName: string;
    location: string;
    severity: "low" | "moderate" | "high";
    magnitude: number;
    timestamp: string; // Đã được định dạng (vd: "2024-11-12 14:30:15")
    duration: number;
    peakAcceleration: number;
    read: boolean;
}

// 2. INTERFACE CHO API (Dữ liệu thô từ BE)
/*
interface ApiAlert {
  _id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  severity: "low" | "moderate" | "high";
  magnitude: number;
  timestamp: string; // Kiểu string ISO Date (vd: "2025-11-12T14:30:15.000Z")
  duration: number;
  peakAcceleration: number;
  read: boolean;
}

// Interface cho API Stats
interface ApiStats {
  totalAlerts: number;
  high: number;
  moderate: number;
  low: number;
}
*/

// 3. HÀM HELPER (Bỏ comment khi sẵn sàng)
/*
const transformApiAlert = (apiAlert: ApiAlert): Alert => ({
  id: apiAlert._id,
  deviceId: apiAlert.deviceId,
  deviceName: apiAlert.deviceName,
  location: apiAlert.location,
  severity: apiAlert.severity,
  magnitude: apiAlert.magnitude,
  // Định dạng lại ngày giờ
  timestamp: new Date(apiAlert.timestamp).toLocaleString(),
  duration: apiAlert.duration,
  peakAcceleration: apiAlert.peakAcceleration,
  read: apiAlert.read,
});
*/

export function AlertsPage() {
    // 4. STATE (Xóa mock data, khởi tạo rỗng)
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [stats, setStats] = useState<ApiStats | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Mặc định là true
    // const [error, setError] = useState<string | null>(null); // Bỏ comment khi sẵn sàng
    // const { getToken } = useAuth(); // Bỏ comment khi sẵn sàng

    const [filterSeverity, setFilterSeverity] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // 5. LOGIC LẤY DỮ LIỆU (Đã comment)
    /*
    useEffect(() => {
      const loadAlertsData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = await getToken();
          if (!token) throw new Error("Chưa xác thực");

          const authHeader = { Authorization: `Bearer ${token}` };
          const baseUrl = "http://localhost:5001";

          // Gọi song song 2 API
          const [alertsRes, statsRes] = await Promise.all([
            fetch(`${baseUrl}/api/alerts`, { headers: authHeader }),
            fetch(`${baseUrl}/api/alerts/stats`, { headers: authHeader }),
          ]);

          if (!alertsRes.ok || !statsRes.ok) {
            throw new Error("Không thể tải dữ liệu cảnh báo.");
          }

          const apiAlerts: ApiAlert[] = await alertsRes.json();
          const apiStats: ApiStats = await statsRes.json();

          // Cập nhật state
          setAlerts(apiAlerts.map(transformApiAlert));
          setStats(apiStats);

        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      loadAlertsData();
    }, [getToken]);
    */

    // *** Giả lập trạng thái Loading ***
    // Xóa dòng này khi bạn bỏ comment phần useEffect ở trên
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500); // Giả vờ tải
        return () => clearTimeout(timer);
    }, []);


    const filteredAlerts = alerts.filter((alert) => {
        const matchesSeverity =
            filterSeverity === "all" || alert.severity === filterSeverity;
        const matchesSearch =
            alert.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSeverity && matchesSearch;
    });

    // 6. HÀM CẬP NHẬT (Đã comment API)
    const markAsRead = async (id: string) => {
        // Cập nhật UI ngay lập tức
        setAlerts(
            alerts.map((alert) =>
                alert.id === id ? { ...alert, read: true } : alert
            )
        );

        // GỌI API (Đã comment)
        /*
        try {
          const token = await getToken();
          if (!token) throw new Error("Chưa xác thực");

          await fetch(`http://localhost:5001/api/alerts/${id}/read`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Không cần làm gì thêm vì UI đã cập nhật
        } catch (err: any) {
          toast.error("Không thể đánh dấu đã đọc. Đang hoàn tác...");
          // Hoàn tác nếu có lỗi
          setAlerts(
            alerts.map((alert) =>
              alert.id === id ? { ...alert, read: false } : alert
            )
          );
        }
        */
    };

    const getSeverityColor = (severity: string) => {
        // ... (Hàm này giữ nguyên)
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

    const getSeverityBadgeColor = (severity: string) => {
        // ... (Hàm này giữ nguyên)
        switch (severity) {
            case "high":
                return "bg-red-600 text-white";
            case "moderate":
                return "bg-orange-600 text-white";
            case "low":
                return "bg-yellow-600 text-white";
            default:
                return "bg-gray-600 text-white";
        }
    };

    // 7. HIỂN THỊ LOADING
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg text-gray-600">Đang tải cảnh báo...</p>
            </div>
        );
    }

    // 8. JSX (Cập nhật Stats để đọc từ state)
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Alert History</h1>
                <p className="text-gray-500">View and manage earthquake detection alerts</p>
            </div>

            {/* Stats (Đọc từ state `stats`, mặc định là 0) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Alerts</p>
                    <p className="text-3xl">{stats?.totalAlerts ?? 0}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">High Severity</p>
                    <p className="text-3xl text-red-600">{stats?.high ?? 0}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Moderate</p>
                    <p className="text-3xl text-orange-600">{stats?.moderate ?? 0}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Low Severity</p>
                    <p className="text-3xl text-yellow-600">{stats?.low ?? 0}</p>
                </Card>
            </div>

            {/* Filters (Giữ nguyên) */}
            <Card className="p-4 mb-6">
                {/* ... (Code JSX của Filters giữ nguyên) ... */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by device or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Alerts List (Giữ nguyên) */}
            <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                    <Card
                        key={alert.id}
                        className={`p-6 ${!alert.read ? "border-l-4 border-l-red-600" : ""}`}
                    >
                        {/* ... (Code JSX của Card giữ nguyên) ... */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div
                                    className={`p-3 rounded-lg ${getSeverityColor(
                                        alert.severity
                                    )}`}
                                >
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="text-gray-900 mb-1">{alert.deviceName}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {alert.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {alert.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={getSeverityBadgeColor(alert.severity)}>
                                            {alert.severity.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Magnitude</p>
                                            <div className="flex items-center gap-1">
                                                <Activity className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm">{alert.magnitude}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                                            <p className="text-sm">{alert.duration}s</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Peak Acceleration</p>
                                            <p className="text-sm">{alert.peakAcceleration} m/s²</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Device ID</p>
                                            <p className="text-sm">{alert.deviceId}</p>
                                        </div>
                                    </div>

                                    {!alert.read && (
                                        <div className="mt-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => markAsRead(alert.id)}
                                            >
                                                Mark as Read
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Trạng thái trống (Giữ nguyên) */}
            {/* (Vì alerts = [], nó sẽ hiển thị cái này) */}
            {filteredAlerts.length === 0 && (
                <Card className="p-12 text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400">No alerts found</p>
                    <p className="text-sm text-gray-400 mt-2">
                        {searchQuery || filterSeverity !== "all"
                            ? "Try adjusting your filters"
                            : "Your devices haven't detected any seismic activity"}
                    </p>
                </Card>
            )}
        </div>
    );
}