import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LostItemForm } from "@/components/LostItemForm";
import { FoundItemForm } from "@/components/FoundItemForm";
import { ItemsList } from "@/components/ItemsList";
import { MyItems } from "@/components/MyItems";
import { User } from "@/types/LostFound";

interface LostFoundTabsProps {
  user: User;
}

export function LostFoundTabs({ user }: LostFoundTabsProps) {
  const [activeTab, setActiveTab] = useState("browse");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleItemCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="browse">Browse Items</TabsTrigger>
        <TabsTrigger value="report-lost">Report Lost</TabsTrigger>
        <TabsTrigger value="report-found">Report Found</TabsTrigger>
        <TabsTrigger value="my-items">My Items</TabsTrigger>
      </TabsList>
      
      <TabsContent value="browse" className="mt-6">
        <ItemsList refreshTrigger={refreshTrigger} />
      </TabsContent>
      
      <TabsContent value="report-lost" className="mt-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Report a Lost Item</h2>
            <p className="text-gray-600 mb-6">
              Help us help you find your lost item by providing as much detail as possible.
            </p>
            <LostItemForm onSuccess={handleItemCreated} />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="report-found" className="mt-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Report a Found Item</h2>
            <p className="text-gray-600 mb-6">
              Help reunite someone with their lost belongings by reporting what you found.
            </p>
            <FoundItemForm onSuccess={handleItemCreated} />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="my-items" className="mt-6">
        <MyItems user={user} refreshTrigger={refreshTrigger} />
      </TabsContent>
    </Tabs>
  );
}