import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, DollarSign, Eye } from "lucide-react";
import { LostItem, FoundItem } from "@/types/LostFound";
import { itemsService } from "@/utils/itemsService";
import { useToast } from "@/components/ui/use-toast";

export function MyItems({ refreshTrigger }: { refreshTrigger: number }) {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    loadMyItems();
  }, [refreshTrigger]);

  const loadMyItems = async () => {
    setLoading(true);
    try {
      const response = await itemsService.getMyItems();
      setLostItems(response.lost_items);
      setFoundItems(response.found_items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId: number, status: string) => {
    try {
      await itemsService.updateLostItemStatus(itemId, status);
      toast({
        title: "Status Updated",
        description: "Item status has been updated successfully",
      });
      loadMyItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string, type: 'lost' | 'found') => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    if (type === 'lost') {
      switch (status) {
        case 'active':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'found':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'closed':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'available':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'claimed':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'returned':
          return `${baseClasses} bg-purple-100 text-purple-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  const ItemCard = ({ item, type }: { item: LostItem | FoundItem; type: 'lost' | 'found' }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {item.category.icon} {item.category.name}
            </span>
          </div>
        </div>
        <span className={getStatusBadge(item.status, type)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{type === 'lost' ? (item as LostItem).location_lost : (item as FoundItem).location_found}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{formatDate(type === 'lost' ? (item as LostItem).date_lost || item.created_at : (item as FoundItem).date_found || item.created_at)}</span>
        </div>
        {type === 'lost' && (item as LostItem).reward_amount && (
          <div className="flex items-center gap-1 col-span-2">
            <DollarSign size={14} />
            <span>Reward: ${(item as LostItem).reward_amount}</span>
          </div>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.map(tag => (
            <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {item.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {item.images.slice(0, 3).map((image, index) => (
            <img
              key={index}
              src={`/api/uploads/${image}`}
              alt={`${item.title} ${index + 1}`}
              className="w-full h-16 object-cover rounded"
            />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xs text-gray-500">
          Posted {formatDate(item.created_at)}
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors" title="View Details">
            <Eye size={16} />
          </button>
          {type === 'lost' && item.status === 'active' && (
            <select
              onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              <option value="found">Mark as Found</option>
              <option value="closed">Close Listing</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Items</h2>
        <p className="text-gray-600 mb-6">
          Manage your lost and found item reports.
        </p>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">
              Lost Items ({lostItems.length})
            </TabsTrigger>
            <TabsTrigger value="found">
              Found Items ({foundItems.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lost" className="mt-6">
            {lostItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lostItems.map(item => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600 mb-2">No lost items reported</h3>
                <p className="text-gray-500">When you report a lost item, it will appear here.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="found" className="mt-6">
            {foundItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {foundItems.map(item => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600 mb-2">No found items reported</h3>
                <p className="text-gray-500">When you report a found item, it will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}