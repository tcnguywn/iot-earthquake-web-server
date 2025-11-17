import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Trash2, Settings, Wifi, WifiOff, MapPin, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

// 1. Sửa Interface API: Phải khớp với những gì backend gửi
interface ApiDevice {
  _id: string;
  deviceId: string;
  name: string;
  location: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  // --- THÊM CÁC TRƯỜNG TỪ BACKEND ---
  status: "online" | "offline"; // Backend đã tính toán sẵn
  lastMagnitude: number;
  lastRssi: number;
}

// 2. Sửa Interface UI: Không cần gán cứng nữa
interface UiDevice {
  id: string; // Map từ deviceId
  name: string;
  location: string;
  status: "online" | "offline";
  lastReading: number; // Map từ lastMagnitude
  battery: number; // Map từ lastRssi
  addedDate: string; // Map từ createdAt
}

// 3. Helper chuyển RSSI (tín hiệu wifi) sang % pin (ước lượng)
// RSSI là số âm, càng gần 0 càng mạnh.
// Ví dụ: -30 (mạnh), -70 (trung bình), -90 (yếu)
const rssiToBattery = (rssi: number | null): number => {
    if (rssi == null || rssi === 0) return 0;
    if (rssi > -55) return 100; // Rất mạnh
    if (rssi > -65) return 75; // Tốt
    if (rssi > -75) return 50; // Trung bình
    if (rssi > -85) return 25; // Yếu
    return 10; // Rất yếu
};

// 4. Sửa hàm Transform: Đọc dữ liệu từ API, không gán cứng
const transformApiToUi = (apiDevice: ApiDevice): UiDevice => {
    return {
        id: apiDevice.deviceId,
        name: apiDevice.name,
        location: apiDevice.location,
        addedDate: new Date(apiDevice.createdAt).toLocaleDateString(),
        // --- SỬA LỖI Ở ĐÂY ---
        status: apiDevice.status, // Lấy status từ backend
        lastReading: apiDevice.lastMagnitude, // Lấy magnitude từ backend
        battery: rssiToBattery(apiDevice.lastRssi), // Tính pin từ RSSI
    };
};

export function DevicesPage() {
    const [devices, setDevices] = useState<UiDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newDeviceId, setNewDeviceId] = useState("");
    const [newDeviceName, setNewDeviceName] = useState("");
    const [newDeviceLocation, setNewDeviceLocation] = useState("");

    const { getToken } = useAuth();

    // 5. Cập nhật hàm Tải dữ liệu
    const fetchDevices = async (token: string | null) => {
        if (!token) {
            setError("Chưa xác thực");
            setIsLoading(false);
            return;
        }

        // Chỉ hiện loading xoay tròn lần đầu, các lần sau tự động refresh
        if (devices.length === 0) setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/devices", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách thiết bị");
            }

            const data: ApiDevice[] = await response.json();
            const uiData = data.map(transformApiToUi);
            setDevices(uiData);
            setError(null);

        } catch (err: any) {
            setError(err.message);
            // Chỉ toast lỗi khi không phải là lần đầu tải
            if (devices.length > 0) {
              toast.error(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 6. Dùng useEffect để TẢI và TỰ ĐỘNG LÀM MỚI (Polling)
    useEffect(() => {
        let isMounted = true; // Tránh memory leak
        let intervalId: NodeJS.Timeout | null = null;

        const loadInitialData = async () => {
            const token = await getToken();
            if (isMounted) {
                await fetchDevices(token);

                // Sau khi tải xong lần đầu, bắt đầu tự động làm mới
                intervalId = setInterval(async () => {
                    // console.log("Polling devices...");
                    const pollToken = await getToken();
                    if (isMounted) {
                        await fetchDevices(pollToken);
                    }
                }, 10000); // Làm mới mỗi 10 giây
            }
        };

        loadInitialData();

        // Cleanup: Dừng polling khi rời khỏi trang
        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [getToken]); // Chỉ chạy lại khi getToken thay đổi

    // Hàm `handleAddDevice` (Không đổi, đã đúng)
    const handleAddDevice = async () => {
        if (!newDeviceId || !newDeviceName) {
            toast.error("Vui lòng nhập ID và Tên thiết bị");
            return;
        }
        try {
            const token = await getToken();
            const response = await fetch("http://localhost:5001/api/devices/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    deviceId: newDeviceId,
                    name: newDeviceName,
                    location: newDeviceLocation,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Đăng ký thất bại");

            toast.success(result.message);
            const newUiDevice = transformApiToUi(result.device);
            // Gán pin 100% cho thiết bị mới (vì RSSI chưa có)
            newUiDevice.battery = 100;
            setDevices(prevDevices => [...prevDevices, newUiDevice]);

            setIsAddDialogOpen(false);
            setNewDeviceId("");
            setNewDeviceName("");
            setNewDeviceLocation("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // Hàm `handleDeleteDevice` (Không đổi, đã đúng)
    const handleDeleteDevice = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa thiết bị này?")) return;
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:5001/api/devices/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Không thể xóa thiết bị");
            }
            toast.success("Đã xóa thiết bị");
            setDevices(devices.filter((d) => d.id !== id));
        } catch (err: any) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // 7. Hiển thị Loading (Chỉ lần đầu)
    if (isLoading && devices.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    // 8. Hiển thị Lỗi (Chỉ lần đầu)
    if (error && devices.length === 0) {
        return (
            <Card className="m-8 p-12 text-center text-red-500">
                Lỗi: {error}
            </Card>
        );
    }

    // 9. Giao diện JSX (Không đổi, nhưng giờ sẽ hiển thị đúng)
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-gray-900 mb-2">Devices</h1>
                    <p className="text-gray-500">Manage your earthquake detection devices</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  {/* ... (Phần Dialog không đổi) ... */}
                  <DialogTrigger asChild>
                      <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Device
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Add New Device</DialogTitle>
                          <DialogDescription>
                              Register a new earthquake sensor to your account
                          </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                              <Label htmlFor="device-id">Device ID</Label>
                              <Input
                                  id="device-id"
                                  placeholder="(VD: 1A:2B:3C:4D:5E:6F)"
                                  value={newDeviceId}
                                  onChange={(e) => setNewDeviceId(e.target.value)}
                              />
                              <p className="text-xs text-gray-500">
                                  Đây là địa chỉ MAC của ESP32
                              </p>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="device-name">Device Name</Label>
                              <Input
                                  id="device-name"
                                  placeholder="Cảm biến phòng khách"
                                  value={newDeviceName}
                                  onChange={(e) => setNewDeviceName(e.target.value)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="device-location">Location</Label>
                              <Input
                                  id="device-location"
                                  placeholder="Hà Nội"
                                  value={newDeviceLocation}
                                  onChange={(e) => setNewDeviceLocation(e.target.value)}
                              />
                          </div>
                          <Button onClick={handleAddDevice} className="w-full">
                              Register Device
                          </Button>
                      </div>
                  </DialogContent>
                </Dialog>
            </div>

            {/* Stats (Giờ sẽ tự cập nhật) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Devices</p>
                    <p className="text-3xl">{devices.length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Online</p>
                    <p className="text-3xl text-green-600">
                        {devices.filter((d) => d.status === "online").length}
                    </p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Offline</p>
                    <p className="text-3xl text-gray-400">
                        {devices.filter((d) => d.status === "offline").length}
                    </p>
                </Card>
            </div>

            {/* Devices List (Giờ sẽ tự cập nhật) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {devices.map((device) => (
                    <Card key={device.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3>{device.name}</h3>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            device.status === "online"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                        }
                                    >
                                        {device.status === "online" ? (
                                            <Wifi className="w-3 h-3 mr-1" />
                                        ) : (
                                            <WifiOff className="w-3 h-3 mr-1" />
                                        )}
                                        {device.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {device.location || "Chưa có vị trí"}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {/*<Button variant="ghost" size="icon">*/}
                                {/* <Settings className="w-4 h-4" />*/}
                                {/*</Button>*/}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteDevice(device.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Device ID</p>
                                    <p className="text-sm">{device.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Added Date</p>
                                    <p className="text-sm">{device.addedDate}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Last Reading (Magnitude)</p>
                                <p className="text-sm">{device.lastReading.toFixed(4)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Signal Strength (RSSI)</p>
                                <div className="flex items-center gap-2">
                                    <Progress value={device.battery} className="h-2 flex-1" />
                                    <span className="text-sm">{device.battery}%</span>
                                </div>
                            </div>

                            {device.status === "offline" && (
                                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                                    Device is offline. Last seen was more than 1 minute ago.
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Màn hình trống */}
            {devices.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <Plus className="w-16 h-16 mx-auto mb-4" />
                        <p>No devices registered yet</p>
                        <p className="text-sm mt-2">Add your first earthquake sensor to get started</p>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Device
                    </Button>
                </Card>
            )}
        </div>
    );
}