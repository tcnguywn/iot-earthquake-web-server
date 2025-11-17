import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react"; // Bỏ comment
import { toast } from "sonner"; // Bỏ comment
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
    level: number;
    read: boolean;
    // Bỏ duration và peakAcceleration vì model BE không có
}

// 2. INTERFACE CHO API (Dữ liệu thô từ BE)
// Backend (getAllAlerts) trả về DataEntry + populated device
interface ApiAlert {
    _id: string;
    device: {
        _id: string;
        name: string;
        location: string;
        deviceId: string; // MAC address
    };
    magnitude: number;
    level: number;
    receivedAt: string; // ISO Date
    read: boolean;
}

// Interface cho API Stats
interface ApiStats {
    totalAlerts: number;
    high: number;
    moderate: number;
    low: number;
    unreadCount: number;
}

// 3. HÀM HELPER
const levelToSeverity = (level: number): "low" | "moderate" | "high" => {
    if (level === 3) return "high";
    if (level === 2) return "moderate";
    return "low";
};

const transformApiAlert = (apiAlert: ApiAlert): Alert => ({
    id: apiAlert._id,
    deviceId: apiAlert.device.deviceId,
    deviceName: apiAlert.device.name,
    location: apiAlert.device.location || "N/A",
    severity: levelToSeverity(apiAlert.level),
    magnitude: apiAlert.magnitude,
    timestamp: new Date(apiAlert.receivedAt).toLocaleString(), // Định dạng lại ngày giờ
    level: apiAlert.level,
    read: apiAlert.read,
});


export function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]); // Danh sách gốc
    const [stats, setStats] = useState<ApiStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth(); // Bỏ comment

    const [filterSeverity, setFilterSeverity] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // 5. LOGIC LẤY DỮ LIỆU
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


    const filteredAlerts = alerts.filter((alert) => {
        const matchesSeverity =
            filterSeverity === "all" || alert.severity === filterSeverity;
        const matchesSearch =
            alert.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSeverity && matchesSearch;
    });

    // 6. HÀM CẬP NHẬT
    const markAsRead = async (id: string) => {
        // Cập nhật UI ngay lập tức
        const originalAlerts = [...alerts];
        setAlerts(
            alerts.map((alert) =>
                alert.id === id ? { ...alert, read: true } : alert
            )
        );

        // GỌI API
        try {
            const token = await getToken();
            if (!token) throw new Error("Chưa xác thực");

            const response = await fetch(`http://localhost:5001/api/alerts/${id}/read`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Lỗi máy chủ");

            // Cập nhật lại stats (đặc biệt là unreadCount)
            if (stats) {
                setStats({ ...stats, unreadCount: stats.unreadCount - 1 });
            }

        } catch (err: any) {
            toast.error("Không thể đánh dấu đã đọc. Đang hoàn tác...");
            // Hoàn tác nếu có lỗi
            setAlerts(originalAlerts);
        }
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

    const getSeverityBadgeColor = (severity: string) => {
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
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg text-gray-600">Đang tải cảnh báo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="m-8 p-12 text-center text-red-500">
                Lỗi: {error}
            </Card>
        );
    }

    // 8. JSX (Cập nhật Stats để đọc từ state)
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Alert History</h1>
                <p className="text-gray-500">View and manage earthquake detection alerts (Level {'>'} 0)</p>
            </div>

            {/* Stats */}
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

            {/* Filters */}
            <Card className="p-4 mb-6">
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
                            <SelectItem value="high">High (3)</SelectItem>
                            <SelectItem value="moderate">Moderate (2)</SelectItem>
                            <SelectItem value="low">Low (1)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                    <Card
                        key={alert.id}
                        className={`p-6 ${!alert.read ? "border-l-4 border-l-red-600" : ""}`}
                    >
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
                                            {alert.severity.toUpperCase()} (L{alert.level})
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Magnitude</p>
                                            <div className="flex items-center gap-1">
                                                <Activity className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm">{alert.magnitude.toFixed(4)}</p>
                                            </div>
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

            {/* Trạng thái trống */}
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