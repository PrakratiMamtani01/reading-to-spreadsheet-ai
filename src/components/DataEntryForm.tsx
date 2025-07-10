import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataReading } from "@/types";

interface DataEntryFormProps {
  fields: string[];
  setFields: (fields: string[]) => void;
  onSubmit: (reading: Omit<DataReading, 'id' | 'timestamp'>) => void;
  editingData?: DataReading | null;
  onCancelEdit?: () => void;
}

interface WasteCategory {
  primary: string;
  secondary: string;
  emptyBin: number;
  weightWithWaste: number;
  binNumber?: number;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  fields, 
  setFields, 
  onSubmit, 
  editingData = null, 
  onCancelEdit 
}) => {
  // Basic Information
  const [sampleNumber, setSampleNumber] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [manifestId, setManifestId] = useState('NA');
  const [producerName, setProducerName] = useState("bea'h \\ collection");
  const [sourceDistrict, setSourceDistrict] = useState('');
  const [wasteType, setWasteType] = useState('Bin');
  const [sampleWeight, setSampleWeight] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  // Dynamic bin count (start with 7 bins)
  const [binCount, setBinCount] = useState(7);
  const [binWeights, setBinWeights] = useState<number[]>(new Array(7).fill(0));
  const [binVolumes, setBinVolumes] = useState<number[]>(new Array(7).fill(1)); // Changed default from 240 to 1
  const [sortingWeights, setSortingWeights] = useState<number[]>(new Array(7).fill(0));

  // Waste categories with their specific items
  const [wasteCategories, setWasteCategories] = useState<WasteCategory[]>([
    // Paper
    { primary: 'Paper', secondary: 'Mixed Paper (newspapers, office paper)', emptyBin: 0, weightWithWaste: 0, binNumber: 1 },
    { primary: 'Paper', secondary: 'High-Grade Paper (clean, high-quality)', emptyBin: 0, weightWithWaste: 0, binNumber: 2 },
    { primary: 'Paper', secondary: 'Cardboard (clean and dry)', emptyBin: 0, weightWithWaste: 0, binNumber: 3 },
    { primary: 'Paper', secondary: 'Tissue Paper (tissues, paper towels)', emptyBin: 0, weightWithWaste: 0 },
    { primary: 'Paper', secondary: 'Coated Paper (magazines, glossy)', emptyBin: 0, weightWithWaste: 0 },
    
    // Plastics
    { primary: 'Plastics', secondary: 'PVC (Floor/wall paper)', emptyBin: 0, weightWithWaste: 0, binNumber: 4 },
    { primary: 'Plastics', secondary: 'PET bottles and containers', emptyBin: 0, weightWithWaste: 0, binNumber: 5 },
    { primary: 'Plastics', secondary: 'HDPE bottles and containers', emptyBin: 0, weightWithWaste: 0, binNumber: 6 },
    { primary: 'Plastics', secondary: 'LDPE (All films)', emptyBin: 0, weightWithWaste: 0, binNumber: 7 },
    { primary: 'Plastics', secondary: 'PP Polypropylene (yogurt containers)', emptyBin: 0, weightWithWaste: 0, binNumber: 8 },
    { primary: 'Plastics', secondary: 'Other plastic', emptyBin: 0, weightWithWaste: 0, binNumber: 9 },
    { primary: 'Plastics', secondary: 'PS Polystyrene, Styrofoam', emptyBin: 0, weightWithWaste: 0, binNumber: 10 },
    { primary: 'Plastics', secondary: 'Single-use plastic (films, straws, utensils)', emptyBin: 0, weightWithWaste: 0, binNumber: 11 },
    
    // Metals
    { primary: 'Metals', secondary: 'Ferrous Metals', emptyBin: 0, weightWithWaste: 0, binNumber: 12 },
    { primary: 'Metals', secondary: 'Non-Ferrous Metals', emptyBin: 0, weightWithWaste: 0 },
    { primary: 'Metals', secondary: 'Mix of ferrous and non-ferrous', emptyBin: 0, weightWithWaste: 0 },
    
    // Glass
    { primary: 'Glass', secondary: 'Clear Glass', emptyBin: 0, weightWithWaste: 0, binNumber: 13 },
    { primary: 'Glass', secondary: 'Colored Glass', emptyBin: 0, weightWithWaste: 0, binNumber: 14 },
    { primary: 'Glass', secondary: 'Specialty Glass (mirrors, windows)', emptyBin: 0, weightWithWaste: 0 },
    
    // Continue with other categories...
    { primary: 'Textiles', secondary: 'Reusable Textiles (good condition)', emptyBin: 0, weightWithWaste: 0, binNumber: 15 },
    { primary: 'Textiles', secondary: 'Non-Reusable Textiles', emptyBin: 0, weightWithWaste: 0, binNumber: 16 },
    
    { primary: 'Rubbers', secondary: 'Tires', emptyBin: 0, weightWithWaste: 0, binNumber: 17 },
    { primary: 'Rubbers', secondary: 'Rubber Products', emptyBin: 0, weightWithWaste: 0, binNumber: 18 },
    
    { primary: 'Liquid Waste', secondary: 'Leachate, access water, liquids', emptyBin: 0, weightWithWaste: 0, binNumber: 19 },
    
    { primary: 'Animal Waste', secondary: 'Domestic animal waste', emptyBin: 0, weightWithWaste: 0, binNumber: 20 },
    { primary: 'Animal Waste', secondary: 'Dead animals', emptyBin: 0, weightWithWaste: 0, binNumber: 21 },
    
    { primary: 'PPE', secondary: 'Face Masks/Gloves', emptyBin: 0, weightWithWaste: 0, binNumber: 22 },
    { primary: 'WEEE', secondary: 'Electrical and Electronic Equipment', emptyBin: 0, weightWithWaste: 0, binNumber: 23 },
    { primary: 'Food Waste', secondary: 'Food Waste', emptyBin: 0, weightWithWaste: 0, binNumber: 24 },
    
    { primary: 'Fines', secondary: 'Fines (<30 cm)', emptyBin: 0, weightWithWaste: 0, binNumber: 25 },
    { primary: 'Diapers', secondary: 'Diapers', emptyBin: 0, weightWithWaste: 0, binNumber: 26 },
    { primary: 'Wood Waste', secondary: 'Wooden items (chairs, brooms)', emptyBin: 0, weightWithWaste: 0, binNumber: 27 },
    
    { primary: 'Hazardous', secondary: 'Household Hazardous (batteries, chemicals)', emptyBin: 0, weightWithWaste: 0, binNumber: 28 },
    { primary: 'Hazardous', secondary: 'Medical Waste (sharps, pharmaceuticals)', emptyBin: 0, weightWithWaste: 0, binNumber: 29 },
    
    { primary: 'Aluminum', secondary: 'Cans', emptyBin: 0, weightWithWaste: 0, binNumber: 30 },
    { primary: 'Aluminum', secondary: 'Foils', emptyBin: 0, weightWithWaste: 0 },
    { primary: 'Aluminum', secondary: 'Other Aluminum', emptyBin: 0, weightWithWaste: 0, binNumber: 31 },
    
    { primary: 'Miscellaneous', secondary: 'Other Miscellaneous Waste', emptyBin: 0, weightWithWaste: 0, binNumber: 32 },
  ]);

  // New state for adding custom waste categories
  const [newCategoryPrimary, setNewCategoryPrimary] = useState('');
  const [newCategorySecondary, setNewCategorySecondary] = useState('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);

  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  // Effect to populate form when editing
  useEffect(() => {
    if (editingData) {
      const readings = editingData.readings;
      setSampleNumber(readings.sampleNumber || '');
      setDateTime(readings.dateTime || new Date().toISOString().slice(0, 16));
      setVehicleNumber(readings.vehicleNumber || '');
      setManifestId(readings.manifestId || 'NA');
      setProducerName(readings.producerName || "bea'h \\ collection");
      setSourceDistrict(readings.sourceDistrict || '');
      setWasteType(readings.wasteType || 'Bin');
      setSampleWeight(readings.sampleWeight?.toString() || '');
      setVehicleType(readings.vehicleType || '');
      
      if (readings.binWeights) {
        setBinWeights(readings.binWeights);
        setBinCount(readings.binWeights.length);
      }
      if (readings.binVolumes) {
        setBinVolumes(readings.binVolumes);
      }
      if (readings.sortingWeights) {
        setSortingWeights(readings.sortingWeights);
      }
      if (readings.wasteBreakdown) {
        setWasteCategories(readings.wasteBreakdown.map((item: any) => ({
          primary: item.primary,
          secondary: item.secondary,
          emptyBin: item.emptyBin,
          weightWithWaste: item.weightWithWaste,
          binNumber: item.binNumber
        })));
      }
      setRemarks(readings.remarks || '');
    }
  }, [editingData]);

  const addBin = () => {
    setBinCount(prev => prev + 1);
    setBinWeights(prev => [...prev, 0]);
    setBinVolumes(prev => [...prev, 1]); // Changed default from 240 to 1
    setSortingWeights(prev => [...prev, 0]);
  };

  const removeBin = (index: number) => {
    if (binCount <= 1) return;
    setBinCount(prev => prev - 1);
    setBinWeights(prev => prev.filter((_, i) => i !== index));
    setBinVolumes(prev => prev.filter((_, i) => i !== index));
    setSortingWeights(prev => prev.filter((_, i) => i !== index));
  };

  const calculateNetWeight = (emptyBin: number, weightWithWaste: number) => {
    return Math.max(0, weightWithWaste - emptyBin);
  };

  const calculatePercentage = (netWeight: number, totalWeight: number) => {
    return totalWeight > 0 ? (netWeight / totalWeight * 100).toFixed(2) : '0.00';
  };

  const getTotalWeight = () => {
    return wasteCategories.reduce((total, category) => 
      total + calculateNetWeight(category.emptyBin, category.weightWithWaste), 0
    );
  };

  const getBinAverage = (values: number[]) => {
    const validValues = values.filter(v => v > 0);
    return validValues.length > 0 ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2) : '0.00';
  };

  const getBulkDensity = (weight: number, volume: number) => {
    return volume > 0 ? (weight / volume).toFixed(2) : '0.00';
  };

  const updateWasteCategory = (index: number, field: 'emptyBin' | 'weightWithWaste', value: string) => {
    const newCategories = [...wasteCategories];
    newCategories[index][field] = parseFloat(value) || 0;
    setWasteCategories(newCategories);
  };

  // New calculation functions for sampling/moisture loss
  const getSortingTotal = () => {
    return sortingWeights.reduce((a, b) => a + b, 0);
  };

  const getSamplingMoistureLoss = () => {
    return getSortingTotal() - getTotalWeight();
  };

  const getPercentageLoss = () => {
    const sortingTotal = getSortingTotal();
    const loss = getSamplingMoistureLoss();
    return sortingTotal > 0 ? (loss / sortingTotal * 100).toFixed(2) : '0.00';
  };

  // New function to add custom waste category
  const addCustomWasteCategory = () => {
    if (!newCategoryPrimary.trim() || !newCategorySecondary.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both main category and sub category.",
        variant: "destructive",
      });
      return;
    }

    const newCategory: WasteCategory = {
      primary: newCategoryPrimary.trim(),
      secondary: newCategorySecondary.trim(),
      emptyBin: 0,
      weightWithWaste: 0
    };

    setWasteCategories(prev => [...prev, newCategory]);
    setNewCategoryPrimary('');
    setNewCategorySecondary('');
    setShowAddCategoryForm(false);

    toast({
      title: "Category Added",
      description: `${newCategoryPrimary} - ${newCategorySecondary} has been added.`,
    });
  };

  const removeWasteCategory = (index: number) => {
    setWasteCategories(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Category Removed",
      description: "Waste category has been removed.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalWeight = getTotalWeight();
    const sortingTotal = getSortingTotal();
    const samplingMoistureLoss = getSamplingMoistureLoss();
    const percentageLoss = getPercentageLoss();
    
    const processedData = {
      // Basic info
      sampleNumber,
      dateTime,
      vehicleNumber,
      manifestId,
      producerName,
      sourceDistrict,
      wasteType,
      sampleWeight: parseFloat(sampleWeight) || 0,
      vehicleType,
      
      // Bin data
      binWeights: binWeights.map(w => w || 0),
      binVolumes: binVolumes.map(v => v || 1),
      binAverages: {
        weight: getBinAverage(binWeights),
        volume: getBinAverage(binVolumes),
        bulkDensity: getBinAverage(binWeights.map((w, i) => parseFloat(getBulkDensity(w, binVolumes[i]))))
      },
      
      // Sorting weights
      sortingWeights: sortingWeights.map(w => w || 0),
      sortingTotal,
      
      // Waste breakdown
      wasteBreakdown: wasteCategories.map(category => ({
        ...category,
        netWeight: calculateNetWeight(category.emptyBin, category.weightWithWaste),
        percentage: calculatePercentage(
          calculateNetWeight(category.emptyBin, category.weightWithWaste), 
          totalWeight
        )
      })),
      
      totalWeight,
      samplingMoistureLoss,
      percentageLoss,
      remarks
    };

    onSubmit({
      location: sourceDistrict,
      operator: producerName,
      readings: processedData
    });

    if (!editingData) {
      toast({
        title: "Waste Audit Data Saved",
        description: `Sample ${sampleNumber} has been recorded successfully.`,
      });
    }
  };

  const clearForm = () => {
    setSampleNumber('');
    setDateTime(new Date().toISOString().slice(0, 16));
    setVehicleNumber('');
    setSourceDistrict('');
    setSampleWeight('');
    setVehicleType('');
    setBinCount(7);
    setBinWeights(new Array(7).fill(0));
    setBinVolumes(new Array(7).fill(1)); // Changed default from 240 to 1
    setSortingWeights(new Array(7).fill(0));
    setWasteCategories(prev => prev.map(cat => ({ ...cat, emptyBin: 0, weightWithWaste: 0 })));
    setRemarks('');
    setShowAddCategoryForm(false);
    setNewCategoryPrimary('');
    setNewCategorySecondary('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-center flex-1">
              {editingData ? 'Edit Waste Audit Record' : 'Waste Collection Data Entry'}
            </CardTitle>
            {editingData && onCancelEdit && (
              <Button 
                type="button"
                onClick={onCancelEdit}
                variant="outline"
                size="sm"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-blue-600">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sampleNumber" className="text-sm">Sample Number *</Label>
                  <Input
                    id="sampleNumber"
                    value={sampleNumber}
                    onChange={(e) => setSampleNumber(e.target.value)}
                    placeholder="Enter sample number"
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-sm">Date & Time *</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber" className="text-sm">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="Sampling vehicle"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manifestId" className="text-sm">Manifest ID</Label>
                  <Input
                    id="manifestId"
                    value={manifestId}
                    onChange={(e) => setManifestId(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="producerName" className="text-sm">Producer's Name - ESP</Label>
                  <Input
                    id="producerName"
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceDistrict" className="text-sm">Source District *</Label>
                  <Input
                    id="sourceDistrict"
                    value={sourceDistrict}
                    onChange={(e) => setSourceDistrict(e.target.value)}
                    placeholder="District name"
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wasteType" className="text-sm">Type of Waste</Label>
                  <Input
                    id="wasteType"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sampleWeight" className="text-sm">Sample Weight (kg)</Label>
                  <Input
                    id="sampleWeight"
                    type="number"
                    step="0.01"
                    value={sampleWeight}
                    onChange={(e) => setSampleWeight(e.target.value)}
                    placeholder="0.00"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType" className="text-sm">Vehicle Type</Label>
                  <Input
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="Type of vehicle"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Bin Measurements */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-green-600">Bin Measurements</h3>
                <Button 
                  type="button"
                  onClick={addBin}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Bin
                </Button>
              </div>
              
              {/* Bin Weights */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Bin Weight (kg)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {binWeights.map((weight, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Bin {index + 1}</Label>
                        {index >= 7 && (
                          <Button
                            type="button"
                            onClick={() => removeBin(index)}
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 text-red-500"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={weight || ''}
                        onChange={(e) => {
                          const newWeights = [...binWeights];
                          newWeights[index] = parseFloat(e.target.value) || 0;
                          setBinWeights(newWeights);
                        }}
                        placeholder="0.00"
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs">Avg</Label>
                    <Input
                      type="text"
                      value={getBinAverage(binWeights)}
                      disabled
                      className="bg-gray-100 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Bin Volumes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Bin Volume (m³)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {binVolumes.map((volume, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">Bin {index + 1}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={volume || ''}
                        onChange={(e) => {
                          const newVolumes = [...binVolumes];
                          newVolumes[index] = parseFloat(e.target.value) || 0;
                          setBinVolumes(newVolumes);
                        }}
                        onBlur={(e) => {
                          // Check if volume is valid after user finishes editing
                          const value = parseFloat(e.target.value);
                          if (value <= 0) {
                            const newVolumes = [...binVolumes];
                            newVolumes[index] = 1; // Reset to default if invalid
                            setBinVolumes(newVolumes);
                          }
                        }}
                        placeholder="1.00"
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs">Avg</Label>
                    <Input
                      type="text"
                      value={getBinAverage(binVolumes)}
                      disabled
                      className="bg-gray-100 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Density */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Bulk Density (kg/m³)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {binWeights.map((weight, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">Bin {index + 1}</Label>
                      <Input
                        type="text"
                        value={getBulkDensity(weight, binVolumes[index])}
                        disabled
                        className="bg-gray-100 h-8 text-sm"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs">Avg</Label>
                    <Input
                      type="text"
                      value={getBinAverage(binWeights.map((w, i) => parseFloat(getBulkDensity(w, binVolumes[i]))))}
                      disabled
                      className="bg-gray-100 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sorting Sample Weight */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Sorting Sample Weight</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sortingWeights.map((weight, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">{index + 1}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={weight || ''}
                        onChange={(e) => {
                          const newWeights = [...sortingWeights];
                          newWeights[index] = parseFloat(e.target.value) || 0;
                          setSortingWeights(newWeights);
                        }}
                        placeholder="0.00"
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="text"
                      value={getSortingTotal().toFixed(2)}
                      disabled
                      className="bg-gray-100 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Waste Category Breakdown - Updated without bin number tags */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-purple-600">Waste Category Breakdown</h3>
                  <Button 
                    type="button"
                    onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Category
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total Weight: <span className="font-bold text-purple-600">{getTotalWeight().toFixed(2)} kg</span>
                </div>
              </div>

              {/* Add Category Form */}
              {showAddCategoryForm && (
                <Card className="p-4 border-2 border-dashed border-purple-300 bg-purple-50">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-purple-700">Add New Waste Category</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Main Category</Label>
                        <Input
                          value={newCategoryPrimary}
                          onChange={(e) => setNewCategoryPrimary(e.target.value)}
                          placeholder="e.g., Paper, Plastic, Metal"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Sub Category</Label>
                        <Input
                          value={newCategorySecondary}
                          onChange={(e) => setNewCategorySecondary(e.target.value)}
                          placeholder="e.g., Mixed Paper, PET bottles"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={addCustomWasteCategory}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Add Category
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowAddCategoryForm(false)}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              <div className="space-y-3">
                {wasteCategories.map((category, index) => {
                  const netWeight = calculateNetWeight(category.emptyBin, category.weightWithWaste);
                  const percentage = calculatePercentage(netWeight, getTotalWeight());
                  
                  return (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{category.primary}</h4>
                            <p className="text-xs text-gray-600">{category.secondary}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-medium">{netWeight.toFixed(2)} kg</div>
                              <div className="text-xs text-gray-500">{percentage}%</div>
                            </div>
                            {index >= 32 && ( // Only show remove button for custom categories
                              <Button
                                type="button"
                                onClick={() => removeWasteCategory(index)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Empty Bin</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={category.emptyBin || ''}
                              onChange={(e) => updateWasteCategory(index, 'emptyBin', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Weight with Waste</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={category.weightWithWaste || ''}
                              onChange={(e) => updateWasteCategory(index, 'weightWithWaste', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Updated Sampling/Moisture Loss Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-orange-600">Sampling/Moisture Loss</h3>
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="space-y-4">
                  {/* First Row: Totals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Sorting Sample Total</div>
                      <div className="font-bold text-lg text-blue-600">{getSortingTotal().toFixed(2)} kg</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Waste Category Total</div>
                      <div className="font-bold text-lg text-purple-600">{getTotalWeight().toFixed(2)} kg</div>
                    </div>
                  </div>
                  
                  {/* Second Row: Loss and Percentage */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Sampling/Moisture Loss</div>
                      <div className="font-bold text-lg text-orange-600">{getSamplingMoistureLoss().toFixed(2)} kg</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Percentage Loss</div>
                      <div className="font-bold text-lg text-red-600">{getPercentageLoss()}%</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Separator />

            {/* Remarks */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-orange-600">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any additional observations or notes..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button 
                type="button"
                onClick={clearForm}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Clear Form
              </Button>
              
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                {editingData ? 'Update Waste Audit Data' : 'Save Waste Audit Data'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
