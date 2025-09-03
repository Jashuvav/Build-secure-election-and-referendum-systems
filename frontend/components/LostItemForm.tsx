import { useState, useEffect } from "react";
import { MapPin, Calendar, DollarSign, Upload, X, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { itemsService } from "@/utils/itemsService";
import { Category, LostItemForm as LostItemFormData } from "@/types/LostFound";

interface LostItemFormProps {
  onSuccess: () => void;
}

export function LostItemForm({ onSuccess }: LostItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<LostItemFormData>({
    title: "",
    description: "",
    category_id: 0,
    location_lost: "",
    latitude: undefined,
    longitude: undefined,
    date_lost: "",
    reward_amount: undefined,
    contact_info: "",
    tags: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await itemsService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' ? parseInt(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const { valid, errors } = itemsService.validateImages(e.target.files);
      
      if (errors.length > 0) {
        toast({
          title: "Image Upload Error",
          description: errors.join('\n'),
          variant: "destructive",
        });
        return;
      }

      setImages(prev => [...prev, ...valid]);
      
      // Create previews
      valid.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await itemsService.getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      toast({
        title: "Location captured",
        description: "Current location has been added to your report",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your current location. You can enter it manually.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await itemsService.createLostItem(formData, images);
      toast({
        title: "Item Reported",
        description: "Your lost item has been reported successfully!",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category_id: 0,
        location_lost: "",
        latitude: undefined,
        longitude: undefined,
        date_lost: "",
        reward_amount: undefined,
        contact_info: "",
        tags: [],
      });
      setImages([]);
      setImagePreviews([]);
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to report lost item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Black iPhone 13"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where did you lose it? *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="location_lost"
                required
                value={formData.location_lost}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Central Park, NYC"
              />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {locationLoading ? "Getting location..." : "📍 Use current location"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When did you lose it?
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="datetime-local"
                name="date_lost"
                value={formData.date_lost}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward Amount (Optional)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                name="reward_amount"
                min="0"
                step="0.01"
                value={formData.reward_amount || ""}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Provide detailed description including color, size, distinguishing features, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <textarea
              name="contact_info"
              rows={2}
              value={formData.contact_info}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="How should people contact you? (email, phone, etc.)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., leather, black, wallet, cards"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (up to 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 mb-2">Click to upload images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Upload size={16} />
                Select Images
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Reporting..." : "Report Lost Item"}
        </button>
      </div>
    </form>
  );
}