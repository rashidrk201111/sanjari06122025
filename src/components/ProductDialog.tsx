import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Product } from "../context/AdminContext";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const defaultProduct: Product = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  slug: "",
  isActive: true,
};

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState<Product>(defaultProduct);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ ...defaultProduct, id: crypto.randomUUID() });
    }
  }, [product, open]);

  const handleSave = () => {
    if (!formData.title.trim()) return;
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details and poster image." : "Add a new product to the showcase."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="productTitle">Product Title *</Label>
            <Input
              id="productTitle"
              placeholder="e.g. PDF Print"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDescription">Description</Label>
            <Textarea
              id="productDescription"
              placeholder="Short description shown on the product card"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productSlug">Product URL Slug</Label>
            <Input
              id="productSlug"
              placeholder="e.g. documents/pdf-print"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <p className="text-xs text-gray-500">Used for the "View Details" link: /products/&lt;slug&gt;</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productImageUrl">Poster / Image URL</Label>
            <Input
              id="productImageUrl"
              placeholder="https://example.com/image.jpg  (leave blank for default)"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Enter any public image URL. Leave blank to use the built-in default image for this product.
            </p>
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Preview:</p>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-32 w-full object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="productActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="productActive">Show on homepage</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.title.trim()}>
            {product ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
