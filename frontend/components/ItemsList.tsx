import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Calendar, DollarSign } from "lucide-react";
import { LostItem, FoundItem, Category, SearchFilters } from "@/types/LostFound";
import { itemsService } from "@/utils/itemsService";
import { useToast } from "@/components/ui/use-toast";

interface ItemsListProps {
  refreshTrigger: number;
}

export function ItemsList({ refreshTrigger }: ItemsListProps) {
  const [activeTab, setActiveTab] = useState("lost");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    category_id: undefined,
    page: 1,
    per_page: 20,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [refreshTrigger, filters, activeTab]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await itemsService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "lost") {
        const response = await itemsService.getLostItems(filters);
        setLostItems(response.items);
      } else {
        const response = await itemsService.getFoundItems(filters);
        setFoundItems(response.items);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters(prev => ({ ...prev, category_id: categoryId, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const ItemCard = ({ item, type }: { item: LostItem | FoundItem; type: 'lost' | 'found' }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {item.category.icon} {item.category.name}
            </span>
            {item.distance && (
              <span className="text-gray-500">• {item.distance} km away</span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          type === 'lost' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {type === 'lost' ? 'Lost' : 'Found'}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

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
          <div className="flex items-center gap-1">
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
              className="w-full h-20 object-cover rounded"
            />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          By {item.user?.username} • {formatDate(item.created_at)}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {type === 'lost' ? 'I Found This' : 'Contact Owner'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for items..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={filters.category_id || ""}
              onChange={handleCategoryFilter}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lost" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : lostItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lostItems.map(item => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600 mb-2">No lost items found</h3>
                <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="found" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : foundItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {foundItems.map(item => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600 mb-2">No found items</h3>
                <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}