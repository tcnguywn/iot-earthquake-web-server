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
import { Plus, Trash2, Settings, Wifi, WifiOff, MapPin } from "lucide-react";
import { Progress } from "./ui/progress";

interface UiDevice {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastReading: number;
  battery: number;
  addedDate: string;
}

interface ApiDevice {
    _id: string;
    deviceId: string;
    name: string;
    location: string;
    owner: string;
    createdAt: string; // Mặc định Mongo sẽ có trường này
    updatedAt: string;
}

// export function DevicesPage() {
//   // const [devices, setDevices] = useState<Device[]>([
//   //   {
//   //     id: "ESP001",
//   //     name: "Living Room Sensor",
//   //     location: "San Francisco, CA",
//   //     status: "online",
//   //     lastReading: 0.2,
//   //     battery: 87,
//   //     addedDate: "2024-11-01",
//   //   },
//   //   {
//   //     id: "ESP002",
//   //     name: "Bedroom Sensor",
//   //     location: "San Francisco, CA",
//   //     status: "online",
//   //     lastReading: 0.15,
//   //     battery: 92,
//   //     addedDate: "2024-11-05",
//   //   },
//   //   {
//   //     id: "ESP003",
//   //     name: "Office Sensor",
//   //     location: "Oakland, CA",
//   //     status: "offline",
//   //     lastReading: 0.0,
//   //     battery: 45,
//   //     addedDate: "2024-10-20",
//   //   },
//   // ]);
//
//     const [devices, setDevices] = useState<Device[]>([]);
//     // const [loading, setLoading] = useState(true);
//     // const [error, setError] = useState<string | null>(null);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [newDeviceId, setNewDeviceId] = useState("");
//   const [newDeviceName, setNewDeviceName] = useState("");
//   const [newDeviceLocation, setNewDeviceLocation] = useState("");
//
//   const handleAddDevice = () => {
//     if (newDeviceId && newDeviceName && newDeviceLocation) {
//       const newDevice: Device = {
//         id: newDeviceId,
//         name: newDeviceName,
//         location: newDeviceLocation,
//         status: "offline",
//         lastReading: 0,
//         battery: 100,
//         addedDate: new Date().toISOString().split("T")[0],
//       };
//       setDevices([...devices, newDevice]);
//       setNewDeviceId("");
//       setNewDeviceName("");
//       setNewDeviceLocation("");
//       setIsAddDialogOpen(false);
//     }
//   };
//
//   const handleDeleteDevice = (id: string) => {
//     if (confirm("Are you sure you want to remove this device?")) {
//       setDevices(devices.filter((d) => d.id !== id));
//     }
//   };
//
//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-gray-900 mb-2">Devices</h1>
//           <p className="text-gray-500">Manage your earthquake detection devices</p>
//         </div>
//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Add Device
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Device</DialogTitle>
//               <DialogDescription>
//                 Register a new earthquake sensor to your account
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 mt-4">
//               <div className="space-y-2">
//                 <Label htmlFor="device-id">Device ID</Label>
//                 <Input
//                   id="device-id"
//                   placeholder="ESP001"
//                   value={newDeviceId}
//                   onChange={(e) => setNewDeviceId(e.target.value)}
//                 />
//                 <p className="text-xs text-gray-500">
//                   Enter the unique ID printed on your device
//                 </p>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="device-name">Device Name</Label>
//                 <Input
//                   id="device-name"
//                   placeholder="Living Room Sensor"
//                   value={newDeviceName}
//                   onChange={(e) => setNewDeviceName(e.target.value)}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="device-location">Location</Label>
//                 <Input
//                   id="device-location"
//                   placeholder="San Francisco, CA"
//                   value={newDeviceLocation}
//                   onChange={(e) => setNewDeviceLocation(e.target.value)}
//                 />
//               </div>
//               <Button onClick={handleAddDevice} className="w-full">
//                 Register Device
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//
//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <Card className="p-6">
//           <p className="text-sm text-gray-500 mb-1">Total Devices</p>
//           <p className="text-3xl">{devices.length}</p>
//         </Card>
//         <Card className="p-6">
//           <p className="text-sm text-gray-500 mb-1">Online</p>
//           <p className="text-3xl text-green-600">
//             {devices.filter((d) => d.status === "online").length}
//           </p>
//         </Card>
//         <Card className="p-6">
//           <p className="text-sm text-gray-500 mb-1">Offline</p>
//           <p className="text-3xl text-gray-400">
//             {devices.filter((d) => d.status === "offline").length}
//           </p>
//         </Card>
//       </div>
//
//       {/* Devices List */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {devices.map((device) => (
//           <Card key={device.id} className="p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <h3>{device.name}</h3>
//                   <Badge
//                     variant="secondary"
//                     className={
//                       device.status === "online"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-gray-100 text-gray-700"
//                     }
//                   >
//                     {device.status === "online" ? (
//                       <Wifi className="w-3 h-3 mr-1" />
//                     ) : (
//                       <WifiOff className="w-3 h-3 mr-1" />
//                     )}
//                     {device.status}
//                   </Badge>
//                 </div>
//                 <div className="flex items-center gap-1 text-sm text-gray-500">
//                   <MapPin className="w-3 h-3" />
//                   {device.location}
//                 </div>
//               </div>
//               <div className="flex gap-1">
//                 <Button variant="ghost" size="icon">
//                   <Settings className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => handleDeleteDevice(device.id)}
//                   className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//
//             <div className="space-y-3">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Device ID</p>
//                   <p className="text-sm">{device.id}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Added Date</p>
//                   <p className="text-sm">{device.addedDate}</p>
//                 </div>
//               </div>
//
//               <div>
//                 <p className="text-xs text-gray-500 mb-1">Current Reading</p>
//                 <p className="text-sm">{device.lastReading.toFixed(2)} m/s²</p>
//               </div>
//
//               <div>
//                 <p className="text-xs text-gray-500 mb-1">Battery Level</p>
//                 <div className="flex items-center gap-2">
//                   <Progress value={device.battery} className="h-2 flex-1" />
//                   <span className="text-sm">{device.battery}%</span>
//                 </div>
//               </div>
//
//               {device.status === "offline" && (
//                 <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
//                   Device is offline. Check power and internet connection.
//                 </div>
//               )}
//             </div>
//           </Card>
//         ))}
//       </div>
//
//       {devices.length === 0 && (
//         <Card className="p-12 text-center">
//           <div className="text-gray-400 mb-4">
//             <Plus className="w-16 h-16 mx-auto mb-4" />
//             <p>No devices registered yet</p>
//             <p className="text-sm mt-2">Add your first earthquake sensor to get started</p>
//           </div>
//           <Button onClick={() => setIsAddDialogOpen(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add Your First Device
//           </Button>
//         </Card>
//       )}
//     </div>
//   );
// }

export function DevicesPage() {
    const [devices, setDevices] = useState<UiDevice[]>([]); // State này giờ là UiDevice
    const [isLoading, setIsLoading] = useState(true); // 6. Dùng state loading/error
    const [error, setError] = useState<string | null>(null);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newDeviceId, setNewDeviceId] = useState("");
    const [newDeviceName, setNewDeviceName] = useState("");
    const [newDeviceLocation, setNewDeviceLocation] = useState("");

    const { getToken } = useAuth(); // 7. Lấy hàm getToken từ Clerk

    // 8. Hàm helper để "chuyển đổi" dữ liệu API thành dữ liệu UI
    const transformApiToUi = (apiDevice: ApiDevice): UiDevice => {
        return {
            id: apiDevice.deviceId, // Map `deviceId` (BE) sang `id` (FE)
            name: apiDevice.name,
            location: apiDevice.location,
            addedDate: new Date(apiDevice.createdAt).toLocaleDateString(),
            // Backend của bạn chưa có các trường này, nên ta gán mặc định
            status: "offline",
            lastReading: 0,
            battery: 0, // Gán tạm là 0% khi offline
        };
    };

    // 9. Dùng useEffect để TẢI (GET) danh sách thiết bị khi mở trang
    useEffect(() => {
        const fetchDevices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) throw new Error("Chưa xác thực");

                const response = await fetch("http://localhost:5001/api/devices", { // Gọi API GET
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách thiết bị");
                }

                const data: ApiDevice[] = await response.json();

                // Chuyển đổi dữ liệu API sang dữ liệu UI
                const uiData = data.map(transformApiToUi);
                setDevices(uiData);

            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDevices();
    }, [getToken]); // Chạy lại khi có token

    // 10. Sửa hàm `handleAddDevice` để gọi API POST
    const handleAddDevice = async () => {
        if (!newDeviceId || !newDeviceName) {
            toast.error("Vui lòng nhập ID và Tên thiết bị");
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch("http://localhost:5001/api/devices/register", { // Gọi API POST
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

            if (!response.ok) {
                throw new Error(result.message || "Đăng ký thất bại");
            }

            // Đăng ký thành công
            toast.success(result.message);

            // Thêm thiết bị mới (đã được chuyển đổi) vào state
            const newUiDevice = transformApiToUi(result.device);
            // Gán pin 100% cho thiết bị mới
            newUiDevice.battery = 100;
            setDevices(prevDevices => [...prevDevices, newUiDevice]);

            // Đóng và reset dialog
            setIsAddDialogOpen(false);
            setNewDeviceId("");
            setNewDeviceName("");
            setNewDeviceLocation("");

        } catch (err: any) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // 11. Sửa hàm `handleDeleteDevice` (Giả định bạn sẽ tạo API DELETE)
    const handleDeleteDevice = async (id: string) => {
        // `id` ở đây là `deviceId`
        if (!confirm("Bạn có chắc muốn xóa thiết bị này?")) {
            return;
        }

        try {
            const token = await getToken();
            // Giả định API của bạn là: DELETE /api/devices/:deviceId
            const response = await fetch(`http://localhost:5001/api/devices/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Không thể xóa thiết bị");
            }

            // Xóa thành công, cập nhật UI
            toast.success("Đã xóa thiết bị");
            setDevices(devices.filter((d) => d.id !== id));

        } catch (err: any) {
            console.error(err);
            toast.error(err.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                {/* ... (Phần Header và Dialog không đổi) ... */}
                <div>
                    <h1 className="text-gray-900 mb-2">Devices</h1>
                    <p className="text-gray-500">Manage your earthquake detection devices</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                                    placeholder="ESP001"
                                    value={newDeviceId}
                                    onChange={(e) => setNewDeviceId(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">
                                    Enter the unique ID printed on your device
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="device-name">Device Name</Label>
                                <Input
                                    id="device-name"
                                    placeholder="Living Room Sensor"
                                    value={newDeviceName}
                                    onChange={(e) => setNewDeviceName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="device-location">Location</Label>
                                <Input
                                    id="device-location"
                                    placeholder="San Francisco, CA"
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

            {/* 12. Hiển thị thông báo Loading và Error */}
            {isLoading && (
                <Card className="p-12 text-center text-gray-500">
                    Đang tải thiết bị...
                </Card>
            )}

            {error && (
                <Card className="p-12 text-center text-red-500">
                    Lỗi: {error}
                </Card>
            )}

            {/* Chỉ hiển thị phần còn lại khi không loading và không có lỗi */}
            {!isLoading && !error && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* ... (Phần Stats không đổi) ... */}
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

                    {/* Devices List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {devices.map((device) => (
                            <Card key={device.id} className="p-6">
                                {/* ... (Phần Device Card không đổi) ... */}
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
                                            {device.location}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteDevice(device.id)} // Sửa hàm onClick
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
                                        <p className="text-xs text-gray-500 mb-1">Current Reading</p>
                                        <p className="text-sm">{device.lastReading.toFixed(2)} m/s²</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Battery Level</p>
                                        <div className="flex items-center gap-2">
                                            <Progress value={device.battery} className="h-2 flex-1" />
                                            <span className="text-sm">{device.battery}%</span>
                                        </div>
                                    </div>

                                    {device.status === "offline" && (
                                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                                            Device is offline. Check power and internet connection.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Màn hình trống khi không có thiết bị */}
                    {devices.length === 0 && (
                        <Card className="p-12 text-center">
                            {/* ... (Phần màn hình trống không đổi) ... */}
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
                </>
            )}
        </div>
    );
}
