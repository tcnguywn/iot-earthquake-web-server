import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/clerk-react"; // Bỏ comment khi sẵn sàng
// import { toast } from "sonner"; // Bỏ comment khi sẵn sàng
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, Activity, AlertTriangle, Calendar, Loader2 } from "lucide-react";

// 1. INTERFACE CHO DỮ LIỆU (Đã comment)
/*
// Interface cho 4 thẻ Summary
interface ApiSummaryStats {
  totalAlerts: number;
  avgMagnitude: number;
  peakMagnitude: number;
  peakMagnitudeDate: string;
  activeDays: number;
  totalDays: number;
  trend: number; // vd: -0.12 cho 12% less
}

// Interface cho Biểu đồ đường
interface ApiTrendData {
  month: string;
  alerts: number;
}

// Interface cho Biểu đồ tròn
interface ApiSeverityData {
  name: string;
  value: number;
  color: string;
}

// Interface cho Thẻ Notable
interface ApiNotableEvent {
  title: string;
  subTitle: string;
  badge: string;
  color: "red" | "orange" | "blue" | "gray";
}
*/

export function StatisticsPage() {
    // 2. STATE (Khởi tạo rỗng, đã comment)
    const [isLoading, setIsLoading] = useState(true); // Luôn cần
    // const [error, setError] = useState<string | null>(null); // Bỏ comment khi sẵn sàng
    // const { getToken } = useAuth(); // Bỏ comment khi sẵn sàng

    // State cho từng phần dữ liệu (đã comment)
    /*
    const [summaryStats, setSummaryStats] = useState<ApiSummaryStats | null>(null);
    const [trendsData, setTrendsData] = useState<ApiTrendData[]>([]);
    const [severityData, setSeverityData] = useState<ApiSeverityData[]>([]);
    const [notableEvents, setNotableEvents] = useState<ApiNotableEvent[]>([]);
    */

    // State rỗng (dùng khi bị comment)
    const [summaryStats, setSummaryStats] = useState<any>(null);
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [severityData, setSeverityData] = useState<any[]>([]);
    const [notableEvents, setNotableEvents] = useState<any[]>([]);

    // 3. LOGIC LẤY DỮ LIỆU (Đã comment)
    /*
    useEffect(() => {
      const loadStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = await getToken();
          if (!token) throw new Error("Chưa xác thực");

          const authHeader = { Authorization: `Bearer ${token}` };
          const baseUrl = "http://localhost:5001";

          // Gọi 4 API song song
          const [summaryRes, trendsRes, severityRes, notableRes] = await Promise.all([
            fetch(`${baseUrl}/api/stats/summary`, { headers: authHeader }),
            fetch(`${baseUrl}/api/stats/trends`, { headers: authHeader }),
            fetch(`${baseUrl}/api/stats/severity`, { headers: authHeader }),
            fetch(`${baseUrl}/api/stats/notable`, { headers: authHeader }),
          ]);

          if (!summaryRes.ok || !trendsRes.ok || !severityRes.ok || !notableRes.ok) {
            throw new Error("Không thể tải dữ liệu thống kê.");
          }

          // Parse JSON
          const summaryData = await summaryRes.json();
          const trendsData = await trendsRes.json();
          const severityData = await severityRes.json();
          const notableData = await notableRes.json();

          // Cập nhật state
          setSummaryStats(summaryData);
          setTrendsData(trendsData);
          setSeverityData(severityData);
          setNotableEvents(notableData);

        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      loadStats();
    }, [getToken]);
    */

    // *** Giả lập trạng thái Loading (Xóa khi bỏ comment ở trên) ***
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500); // Giả vờ tải
        return () => clearTimeout(timer);
    }, []);

    // 4. HIỂN THỊ LOADING
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg text-gray-600">Đang tải thống kê...</p>
            </div>
        );
    }

    // (JSX cho Error state nên được thêm ở đây nếu bạn bỏ comment)

    // 5. JSX (Đọc từ state rỗng)
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Statistics & Analytics</h1>
                <p className="text-gray-500">
                    Analyze seismic activity patterns and trends
                </p>
            </div>

            {/* Summary Stats (Đọc từ state `summaryStats`, mặc định là 0) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Total Alerts (6mo)</p>
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl mb-1">{summaryStats?.totalAlerts ?? 0}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>{Math.abs(summaryStats?.trend ?? 0) * 100}% less than last period</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Avg Magnitude</p>
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl mb-1">{summaryStats?.avgMagnitude ?? 0}</p>
                    <p className="text-xs text-gray-500">Richter scale</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Peak Magnitude</p>
                        <Activity className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl mb-1">{summaryStats?.peakMagnitude ?? 0}</p>
                    <p className="text-xs text-gray-500">{summaryStats?.peakMagnitudeDate ?? "N/A"}</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Active Days</p>
                        <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl mb-1">{summaryStats?.activeDays ?? 0}</p>
                    <p className="text-xs text-gray-500">Out of {summaryStats?.totalDays ?? 0} days</p>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Alerts Trend (Đọc từ state `trendsData`) */}
                <Card className="p-6">
                    <div className="mb-4">
                        <h2 className="text-gray-900 mb-1">Alert Trends</h2>
                        <p className="text-sm text-gray-500">Monthly alert frequency</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        {trendsData.length > 0 ? (
                            <LineChart data={trendsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                                <Legend />
                                <Line type="monotone" dataKey="alerts" stroke="#f97316" strokeWidth={2} name="Alerts" />
                            </LineChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No trend data available.
                            </div>
                        )}
                    </ResponsiveContainer>
                </Card>

                {/* Severity Distribution (Đọc từ state `severityData`) */}
                <Card className="p-6">
                    <div className="mb-4">
                        <h2 className="text-gray-900 mb-1">Severity Distribution</h2>
                        <p className="text-sm text-gray-500">Alert classification breakdown</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            {severityData.length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No severity data available.
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>
                    {severityData.length > 0 && (
                        <div className="flex items-center justify-center gap-6 mt-4">
                            {severityData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Charts Row 2 (ĐÃ XÓA)
        - Device Activity (ĐÃ XÓA)
        - Detection Patterns (ĐÃ XÓA)
      */}

            {/* Recent Notable Events (Đọc từ state `notableEvents`) */}
            <Card className="p-6 mt-6">
                <h2 className="text-gray-900 mb-4">Notable Events</h2>
                <div className="space-y-3">
                    {notableEvents.length > 0 ? (
                        notableEvents.map((event, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 bg-${event.color}-50 border border-${event.color}-200 rounded-lg`}
                            >
                                <div>
                                    <p className="text-sm">{event.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{event.subTitle}</p>
                                </div>
                                <Badge className={`bg-${event.color}-600`}>{event.badge}</Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-400">
                            No notable events to display.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}