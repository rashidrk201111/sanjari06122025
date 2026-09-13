import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { PricingRule, PricingOption } from "../context/AdminContext";
import { categories } from "../data/categories";
import { Plus, Trash2, DollarSign, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PricingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: PricingRule | null;
  onSave: (rule: PricingRule) => void;
}

export function PricingRuleDialog({ open, onOpenChange, rule, onSave }: PricingRuleDialogProps) {
  const [categorySlug, setCategorySlug] = useState(rule?.category || "");
  const [subcategory, setSubcategory] = useState(rule?.subcategory || "");
  const [basePrice, setBasePrice] = useState(rule?.basePrice.toString() || "");
  const [paperSizes, setPaperSizes] = useState<PricingOption[]>(rule?.paperSizes || []);
  const [colorTypes, setColorTypes] = useState(rule?.colorTypes || []);
  const [bindingTypes, setBindingTypes] = useState(rule?.bindingTypes || []);
  const [quantityDiscounts, setQuantityDiscounts] = useState(rule?.quantityDiscounts || [{ minQty: 1, discount: 0 }]);

  const selectedCategory = categories.find(c => c.slug === categorySlug);
  const subcategories = selectedCategory?.subcategories || [];

  // Reset form when rule changes
  useEffect(() => {
    if (rule) {
      setCategorySlug(rule.category);
      setSubcategory(rule.subcategory);
      setBasePrice(rule.basePrice.toString());
      setPaperSizes(rule.paperSizes || []);
      setColorTypes(rule.colorTypes || []);
      setBindingTypes(rule.bindingTypes || []);
      setQuantityDiscounts(rule.quantityDiscounts);
    } else {
      setCategorySlug("");
      setSubcategory("");
      setBasePrice("1.50");
      setPaperSizes([
        {
          name: "A4",
          enabled: true,
          isDefault: true,
          paperTypes: [
            {
              name: "75GSM - Normal Paper",
              enabled: true,
              isDefault: true,
              prices: { bw_single: 1.50, bw_double: 2.00, color_single: 5.00, color_double: 8.00, premium_single: 6.50, premium_double: 10.00 }
            },
            {
              name: "100GSM - Bond Paper",
              enabled: true,
              isDefault: false,
              prices: { bw_single: 2.50, bw_double: 3.50, color_single: 7.00, color_double: 10.00, premium_single: 8.50, premium_double: 12.00 }
            }
          ],
          bindingTypes: [
            { name: "No Binding", price: 0, enabled: true, isDefault: true },
            { name: "Spiral Binding", price: 40, enabled: true, isDefault: false },
            { name: "Soft Bind", price: 30, enabled: true, isDefault: false },
            { name: "Hard Bind", price: 80, enabled: true, isDefault: false },
            { name: "Staple", price: 5, enabled: true, isDefault: false },
          ],
          coverTypes: [
            { name: "No Cover", price: 0, enabled: true, isDefault: true },
            { name: "Transparent Front Cover", price: 10, enabled: true, isDefault: false },
            { name: "Front and Back Cover", price: 20, enabled: true, isDefault: false },
          ],
          laminationTypes: [
            { name: "Without Lamination", price: 0, enabled: true, isDefault: true },
            { name: "Matt Lamination", price: 5, enabled: true, isDefault: false },
            { name: "Glossy Lamination", price: 5, enabled: true, isDefault: false },
          ]
        },
        {
          name: "A3",
          enabled: true,
          isDefault: false,
          paperTypes: [
            {
              name: "75GSM - Normal Paper",
              enabled: true,
              isDefault: true,
              prices: { bw_single: 3.00, bw_double: 4.00, color_single: 10.00, color_double: 16.00, premium_single: 13.00, premium_double: 20.00 }
            },
            {
              name: "100GSM - Bond Paper",
              enabled: true,
              isDefault: false,
              prices: { bw_single: 5.00, bw_double: 7.00, color_single: 14.00, color_double: 20.00, premium_single: 17.00, premium_double: 24.00 }
            }
          ],
          bindingTypes: [
            { name: "No Binding", price: 0, enabled: true, isDefault: true },
            { name: "Spiral Binding", price: 60, enabled: true, isDefault: false },
            { name: "Soft Bind", price: 50, enabled: true, isDefault: false },
            { name: "Hard Bind", price: 120, enabled: true, isDefault: false },
          ],
          coverTypes: [
            { name: "No Cover", price: 0, enabled: true, isDefault: true },
            { name: "Transparent Front Cover", price: 20, enabled: true, isDefault: false },
            { name: "Front and Back Cover", price: 40, enabled: true, isDefault: false },
          ],
          laminationTypes: [
            { name: "Without Lamination", price: 0, enabled: true, isDefault: true },
            { name: "Matt Lamination", price: 10, enabled: true, isDefault: false },
            { name: "Glossy Lamination", price: 10, enabled: true, isDefault: false },
          ]
        }
      ]);
      const isCert = categorySlug === "certificate-cards" || (rule?.category === "certificate-cards") || subcategory.toLowerCase().includes("certificate");
      setColorTypes(isCert ? [
        { name: "Black and White", priceModifier: 0, enabled: true, isDefault: true },
        { name: "Ultracolor Pro", priceModifier: 4.5, enabled: true, isDefault: false },
      ] : [
        { name: "Black and White", priceModifier: 0, enabled: true, isDefault: true },
        { name: "Smartcolor Standard", priceModifier: 2.5, enabled: true, isDefault: false },
        { name: "Ultracolor Pro", priceModifier: 4.5, enabled: true, isDefault: false },
      ]);
      setBindingTypes([]);
      setQuantityDiscounts([
        { minQty: 1, discount: 0 },
        { minQty: 50, discount: 5 },
        { minQty: 100, discount: 10 },
        { minQty: 500, discount: 15 },
      ]);
    }
  }, [rule, open]);

  // Listen for pre-fill events from quick add
  useEffect(() => {
    const handlePrefill = (event: any) => {
      const { categorySlug: catSlug, subcategoryName } = event.detail;
      if (catSlug && subcategoryName) {
        setCategorySlug(catSlug);
        setSubcategory(subcategoryName);
      }
    };

    window.addEventListener('prefillPricingRule', handlePrefill);
    return () => window.removeEventListener('prefillPricingRule', handlePrefill);
  }, []);

  const handleSave = () => {
    // Validation
    if (!categorySlug || !subcategory || !basePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (paperSizes.some(s => !s.name)) {
      toast.error("Please fill in all paper size names");
      return;
    }

    const newRule: PricingRule = {
      id: rule?.id || `rule_${Date.now()}`,
      category: categorySlug,
      subcategory,
      basePrice: parseFloat(basePrice),
      paperSizes: paperSizes.filter(s => s.name),
      paperTypes: rule?.paperTypes || [], // Maintain legacy compatibility if needed
      colorTypes: colorTypes.filter(c => c.name),
      bindingTypes: bindingTypes.filter(b => b.name),
      quantityDiscounts: quantityDiscounts.filter(q => q.minQty > 0),
    };

    onSave(newRule);
    toast.success(rule ? "Pricing rule updated!" : "Pricing rule added!");
    onOpenChange(false);
  };

  const addPaperSize = () => {
    setPaperSizes([...paperSizes, { name: "", enabled: true, isDefault: paperSizes.length === 0, paperTypes: [] }]);
  };

  const removePaperSize = (index: number) => {
    setPaperSizes(paperSizes.filter((_, i) => i !== index));
  };

  const updatePaperSizeField = (index: number, field: string, value: any) => {
    setPaperSizes(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: value } : s));
  };

  const addPaperTypeToSize = (sizeIndex: number) => {
    setPaperSizes(prev => {
      const updated = prev.map((s, idx) => {
        if (idx !== sizeIndex) return s;
        const currentTypes = s.paperTypes || [];
        return {
          ...s,
          paperTypes: [
            ...currentTypes,
            {
              name: "",
              enabled: true,
              isDefault: currentTypes.length === 0,
              prices: { bw_single: 0, bw_double: 0, color_single: 0, color_double: 0, premium_single: 0, premium_double: 0 }
            }
          ]
        };
      });
      return updated;
    });
  };

  const removePaperTypeFromSize = (sizeIndex: number, typeIndex: number) => {
    setPaperSizes(prev => {
      const updated = prev.map((s, idx) => {
        if (idx !== sizeIndex) return s;
        const currentTypes = s.paperTypes || [];
        return {
          ...s,
          paperTypes: currentTypes.filter((_, i) => i !== typeIndex)
        };
      });
      return updated;
    });
  };

  const updatePaperTypeFieldInSize = (sizeIndex: number, typeIndex: number, field: string, value: any) => {
    setPaperSizes(prev => {
      const updated = prev.map((s, idx) => {
        if (idx !== sizeIndex) return s;
        const currentTypes = s.paperTypes || [];
        const updatedTypes = currentTypes.map((t, i) => {
          if (i !== typeIndex) return t;
          if (field === "prices") {
            return {
              ...t,
              prices: { ...t.prices, ...value }
            };
          } else {
            return {
              ...t,
              [field]: value
            };
          }
        });
        return {
          ...s,
          paperTypes: updatedTypes
        };
      });
      return updated;
    });
  };


  const addBindingTypeToSize = (sizeIndex: number) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      const list = s.bindingTypes || [];
      s.bindingTypes = [...list, { name: "", price: 0, enabled: true, isDefault: list.length === 0 }];
      return updated;
    });
  };

  const removeBindingTypeFromSize = (sizeIndex: number, bIndex: number) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      s.bindingTypes = (s.bindingTypes || []).filter((_, i) => i !== bIndex);
      return updated;
    });
  };

  const updateBindingTypeInSize = (sizeIndex: number, bIndex: number, field: string, value: any) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      const list = [...(s.bindingTypes || [])];
      list[bIndex] = { ...list[bIndex], [field]: value };
      if (field === "isDefault" && value === true) {
        list.forEach((item, i) => { item.isDefault = i === bIndex; });
      }
      s.bindingTypes = list;
      return updated;
    });
  };

  const addCoverTypeToSize = (sizeIndex: number) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      const list = s.coverTypes || [];
      s.coverTypes = [...list, { name: "", price: 0, enabled: true, isDefault: list.length === 0 }];
      return updated;
    });
  };

  const removeCoverTypeFromSize = (sizeIndex: number, cIndex: number) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      s.coverTypes = (s.coverTypes || []).filter((_, i) => i !== cIndex);
      return updated;
    });
  };

  const updateCoverTypeInSize = (sizeIndex: number, cIndex: number, field: string, value: any) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      const list = [...(s.coverTypes || [])];
      list[cIndex] = { ...list[cIndex], [field]: value };
      if (field === "isDefault" && value === true) {
        list.forEach((item, i) => { item.isDefault = i === cIndex; });
      }
      s.coverTypes = list;
      return updated;
    });
  };

  const addLaminationTypeToSize = (sizeIndex: number) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      const list = s.laminationTypes || [];
      s.laminationTypes = [...list, { name: "", price: 0, enabled: true, isDefault: list.length === 0 }];
      return updated;
    });
  };

  const removeLaminationTypeFromSize = (sizeIndex: number, lIndex: number) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      s.laminationTypes = (s.laminationTypes || []).filter((_, i) => i !== lIndex);
      return updated;
    });
  };

  const updateLaminationTypeInSize = (sizeIndex: number, lIndex: number, field: string, value: any) => {
    setPaperSizes(prev => {
      const updated = [...prev];
      const s = updated[sizeIndex];
      const list = [...(s.laminationTypes || [])];
      list[lIndex] = { ...list[lIndex], [field]: value };
      if (field === "isDefault" && value === true) {
        list.forEach((item, i) => { item.isDefault = i === lIndex; });
      }
      s.laminationTypes = list;
      return updated;
    });
  };

  const addBindingType = () => {
    setBindingTypes([...bindingTypes, { name: "", price: 0 }]);
  };

  const removeBindingType = (index: number) => {
    setBindingTypes(bindingTypes.filter((_, i) => i !== index));
  };

  const updateBindingType = (index: number, field: "name" | "price", value: string | number) => {
    const updated = [...bindingTypes];
    updated[index] = { ...updated[index], [field]: value };
    setBindingTypes(updated);
  };

  const addColorType = () => {
    setColorTypes([...colorTypes, { name: "", priceModifier: 0, enabled: true, isDefault: colorTypes.length === 0 }]);
  };

  const removeColorType = (index: number) => {
    setColorTypes(colorTypes.filter((_, i) => i !== index));
  };

  const updateColorType = (index: number, field: "name" | "priceModifier" | "enabled" | "isDefault", value: string | number | boolean) => {
    const updated = [...colorTypes];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "isDefault" && value === true) {
      updated.forEach((c, i) => { c.isDefault = i === index; });
    }
    setColorTypes(updated);
  };

  const addQuantityDiscount = () => {
    setQuantityDiscounts([...quantityDiscounts, { minQty: 0, discount: 0 }]);
  };

  const removeQuantityDiscount = (index: number) => {
    setQuantityDiscounts(quantityDiscounts.filter((_, i) => i !== index));
  };

  const updateQuantityDiscount = (index: number, field: "minQty" | "discount", value: number) => {
    const updated = [...quantityDiscounts];
    updated[index] = { ...updated[index], [field]: value };
    setQuantityDiscounts(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {rule ? "Edit Pricing Rule" : "Add New Pricing Rule"}
          </DialogTitle>
          <DialogDescription>
            Configure pricing for a product subcategory. Default values are pre-filled to help you get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category & Subcategory */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={categorySlug} onValueChange={(value) => {
                setCategorySlug(value);
                setSubcategory(""); // Reset subcategory when category changes
              }}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory *</Label>
              {subcategories.length > 0 ? (
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(sub => (
                      <SelectItem key={sub.slug} value={sub.name}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Enter subcategory name"
                  disabled={!categorySlug}
                />
              )}
              {categorySlug && subcategories.length === 0 && (
                <p className="text-xs text-gray-500">This category has no predefined subcategories. Enter a custom name.</p>
              )}
            </div>
          </div>

          {/* Base Price */}
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price (₹ per unit/page) *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="2.50"
            />
          </div>

          {/* Hierarchical Paper Sizes, Types & Printing Prices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <Label className="text-base font-semibold">Paper Sizes, Types & Printing Prices *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPaperSize}>
                <Plus className="w-4 h-4 mr-1" />
                Add Paper Size
              </Button>
            </div>
            
            {paperSizes.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No paper sizes configured. Click "Add Paper Size" to start.</p>
            ) : (
              <div className="space-y-6">
                {paperSizes.map((size, sizeIdx) => (
                  <div key={sizeIdx} className="border rounded-lg p-4 bg-gray-50/50 space-y-4">
                    {/* Size Header */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <Input
                          placeholder="Size Name (e.g. A4)"
                          value={size.name}
                          onChange={(e) => updatePaperSizeField(sizeIdx, "name", e.target.value)}
                          className="font-semibold text-base w-48 bg-white"
                        />
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={size.enabled !== false}
                            onChange={(e) => updatePaperSizeField(sizeIdx, "enabled", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                          <input
                            type="radio"
                            name="size_default_radio"
                            checked={Boolean(size.isDefault)}
                            onChange={() => {
                              const updated = paperSizes.map((s, idx) => ({ ...s, isDefault: idx === sizeIdx }));
                              setPaperSizes(updated);
                            }}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          Default
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addPaperTypeToSize(sizeIdx)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-9"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add Paper Type
                        </Button>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaperSize(sizeIdx)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Paper Types Nested List */}
                    <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                      {!size.paperTypes || size.paperTypes.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No paper types added for {size.name || "this size"}.</p>
                      ) : (
                        size.paperTypes.map((type, typeIdx) => (
                          <div key={typeIdx} className="bg-white border rounded-md p-3 space-y-3 shadow-sm">
                            <div className="flex items-center gap-3 justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Input
                                  placeholder="Paper Type Name (e.g. 75GSM - Normal)"
                                  value={type.name}
                                  onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "name", e.target.value)}
                                  className="h-8 text-sm flex-1 max-w-sm"
                                />
                                <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={type.enabled !== false}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "enabled", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  Active
                                </label>
                                <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                                  <input
                                    type="radio"
                                    name={`type_default_radio_${sizeIdx}`}
                                    checked={Boolean(type.isDefault)}
                                    onChange={() => {
                                      const updated = [...paperSizes];
                                      updated[sizeIdx].paperTypes = updated[sizeIdx].paperTypes?.map((t, idx) => ({
                                        ...t,
                                        isDefault: idx === typeIdx
                                      }));
                                      setPaperSizes(updated);
                                    }}
                                    className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                                  />
                                  Default
                                </label>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePaperTypeFromSize(sizeIdx, typeIdx)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Prices Grid */}
                            <div className="space-y-2 bg-gray-50/50 p-2.5 rounded border">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Per-page prices (4 color tiers × single/double sided)</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 block uppercase">B/W Single</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={type.prices?.bw_single ?? 0}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "prices", { bw_single: parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 block uppercase">B/W Double</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={type.prices?.bw_double ?? 0}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "prices", { bw_double: parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-blue-700 block uppercase">Standard Single</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={type.prices?.color_single ?? 0}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "prices", { color_single: parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs border-blue-200"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-blue-700 block uppercase">Standard Double</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={type.prices?.color_double ?? 0}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "prices", { color_double: parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs border-blue-200"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-purple-700 block uppercase">Premium Single</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={type.prices?.premium_single ?? 0}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "prices", { premium_single: parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs border-purple-200"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-purple-700 block uppercase">Premium Double</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={type.prices?.premium_double ?? 0}
                                    onChange={(e) => updatePaperTypeFieldInSize(sizeIdx, typeIdx, "prices", { premium_double: parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs border-purple-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                      {/* Per-size Binding Options */}
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            Binding Options for {size.name || "this size"}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addBindingTypeToSize(sizeIdx)}
                            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Binding
                          </Button>
                        </div>
                        {(!size.bindingTypes || size.bindingTypes.length === 0) ? (
                          <p className="text-[11px] text-gray-400 italic">No specific binding options configured for this size.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {size.bindingTypes.map((binding, bIdx) => (
                              <div key={bIdx} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded border border-gray-200">
                                <Input
                                  placeholder="Binding name (e.g. Spiral Binding)"
                                  value={binding.name}
                                  onChange={(e) => updateBindingTypeInSize(sizeIdx, bIdx, "name", e.target.value)}
                                  className="h-7 text-xs flex-1 bg-white"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price"
                                  value={binding.price ?? 0}
                                  onChange={(e) => updateBindingTypeInSize(sizeIdx, bIdx, "price", parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 bg-white"
                                />
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={binding.enabled !== false}
                                    onChange={(e) => updateBindingTypeInSize(sizeIdx, bIdx, "enabled", e.target.checked)}
                                    className="w-3 h-3 rounded text-blue-600"
                                  />
                                  Active
                                </label>
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                                  <input
                                    type="radio"
                                    name={`size_${sizeIdx}_binding_default`}
                                    checked={Boolean(binding.isDefault)}
                                    onChange={() => updateBindingTypeInSize(sizeIdx, bIdx, "isDefault", true)}
                                    className="w-3 h-3 text-blue-600"
                                  />
                                  Default
                                </label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBindingTypeFromSize(sizeIdx, bIdx)}
                                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Per-size Cover Options */}
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-orange-600" />
                            Cover Options for {size.name || "this size"}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addCoverTypeToSize(sizeIdx)}
                            className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Cover
                          </Button>
                        </div>
                        {(!size.coverTypes || size.coverTypes.length === 0) ? (
                          <p className="text-[11px] text-gray-400 italic">No specific cover options configured for this size.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {size.coverTypes.map((cover, cIdx) => (
                              <div key={cIdx} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded border border-gray-200">
                                <Input
                                  placeholder="Cover name (e.g. Transparent Front Cover)"
                                  value={cover.name}
                                  onChange={(e) => updateCoverTypeInSize(sizeIdx, cIdx, "name", e.target.value)}
                                  className="h-7 text-xs flex-1 bg-white"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price"
                                  value={cover.price ?? 0}
                                  onChange={(e) => updateCoverTypeInSize(sizeIdx, cIdx, "price", parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 bg-white"
                                />
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={cover.enabled !== false}
                                    onChange={(e) => updateCoverTypeInSize(sizeIdx, cIdx, "enabled", e.target.checked)}
                                    className="w-3 h-3 rounded text-orange-600"
                                  />
                                  Active
                                </label>
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                                  <input
                                    type="radio"
                                    name={`size_${sizeIdx}_cover_default`}
                                    checked={Boolean(cover.isDefault)}
                                    onChange={() => updateCoverTypeInSize(sizeIdx, cIdx, "isDefault", true)}
                                    className="w-3 h-3 text-orange-600"
                                  />
                                  Default
                                </label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCoverTypeFromSize(sizeIdx, cIdx)}
                                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Per-size Lamination Options */}
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Lamination Options for {size.name || "this size"} (Without, Matt, Glossy)
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addLaminationTypeToSize(sizeIdx)}
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Lamination
                          </Button>
                        </div>
                        {(!size.laminationTypes || size.laminationTypes.length === 0) ? (
                          <p className="text-[11px] text-gray-400 italic">No specific lamination options configured for this size.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {size.laminationTypes.map((lam, lIdx) => (
                              <div key={lIdx} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded border border-gray-200">
                                <Input
                                  placeholder="Lamination name (e.g. Matt Lamination)"
                                  value={lam.name}
                                  onChange={(e) => updateLaminationTypeInSize(sizeIdx, lIdx, "name", e.target.value)}
                                  className="h-7 text-xs flex-1 bg-white"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price"
                                  value={lam.price ?? 0}
                                  onChange={(e) => updateLaminationTypeInSize(sizeIdx, lIdx, "price", parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs w-24 bg-white"
                                />
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={lam.enabled !== false}
                                    onChange={(e) => updateLaminationTypeInSize(sizeIdx, lIdx, "enabled", e.target.checked)}
                                    className="w-3 h-3 rounded text-emerald-600"
                                  />
                                  Active
                                </label>
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                                  <input
                                    type="radio"
                                    name={`size_${sizeIdx}_lamination_default`}
                                    checked={Boolean(lam.isDefault)}
                                    onChange={() => updateLaminationTypeInSize(sizeIdx, lIdx, "isDefault", true)}
                                    className="w-3 h-3 text-emerald-600"
                                  />
                                  Default
                                </label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLaminationTypeFromSize(sizeIdx, lIdx)}
                                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Color Types (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Color Types (Optional)</Label>
                <p className="text-xs text-gray-500 mt-1">Define per-tier printing color options. Defaults: Black &amp; White, Smartcolor Standard, Ultracolor Pro.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addColorType}>
                <Plus className="w-4 h-4 mr-1" />
                Add Color Type
              </Button>
            </div>
            <div className="space-y-2">
              {colorTypes.map((color, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Color name (e.g., Smartcolor Standard)"
                    value={color.name}
                    onChange={(e) => updateColorType(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Addon"
                    title="Per-page price modifier"
                    value={color.priceModifier ?? 0}
                    onChange={(e) => updateColorType(index, "priceModifier", parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                  <label className="flex items-center gap-1 text-xs cursor-pointer select-none px-2">
                    <input
                      type="checkbox"
                      checked={color.enabled !== false}
                      onChange={(e) => updateColorType(index, "enabled", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer select-none px-2">
                    <input
                      type="radio"
                      name="color_default_radio"
                      checked={Boolean(color.isDefault)}
                      onChange={() => updateColorType(index, "isDefault", true)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    Default
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColorType(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Binding Types (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Binding Types (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBindingType}>
                <Plus className="w-4 h-4 mr-1" />
                Add Binding Type
              </Button>
            </div>
            <div className="space-y-2">
              {bindingTypes.map((binding, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Binding name (e.g., Spiral Binding)"
                    value={binding.name}
                    onChange={(e) => updateBindingType(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={binding.price}
                    onChange={(e) => updateBindingType(index, "price", parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBindingType(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Discounts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Quantity-Based Discounts *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuantityDiscount}>
                <Plus className="w-4 h-4 mr-1" />
                Add Discount Tier
              </Button>
            </div>
            <div className="space-y-2">
              {quantityDiscounts.map((discount, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-20">From</span>
                  <Input
                    type="number"
                    placeholder="Min Qty"
                    value={discount.minQty}
                    onChange={(e) => updateQuantityDiscount(index, "minQty", parseInt(e.target.value) || 0)}
                    className="w-28"
                  />
                  <span className="text-sm text-gray-600">units:</span>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Discount %"
                    value={discount.discount}
                    onChange={(e) => updateQuantityDiscount(index, "discount", parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                  <span className="text-sm text-gray-600">% off</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuantityDiscount(index)}
                    disabled={quantityDiscounts.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {rule ? "Update Rule" : "Add Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
