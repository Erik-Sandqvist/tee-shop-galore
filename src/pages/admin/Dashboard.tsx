// src/pages/admin/Dashboard.tsx
import { Card } from "@/components/ui/card";

export const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Total Products</h3>
          <p className="text-3xl font-bold mt-2">24</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium">Orders</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium">Revenue</h3>
          <p className="text-3xl font-bold mt-2">3,240</p>
        </Card>
      </div>
    </div>
  );
};