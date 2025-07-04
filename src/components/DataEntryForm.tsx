
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Save, Calculator, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataReading } from "@/pages/Index";

interface DataEntryFormProps {
  fields: string[];
  setFields: (fields: string[]) => void;
  onSubmit: (reading: Omit<DataReading, 'id' | 'timestamp'>) => void;
}

interface WasteCategory {
  primary: string;
  secondary: string;
  emptyBin: number;
  weightWithWaste: number;
  binNumber?: number;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ fields, setFields, onSubmit }) => {
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

  // Bin measurements (7 bins + average)
  const [binWeights, setBinWeights] = useState<number[]>(new Array(7).fill(0));
  const [binVolumes, setBinVolumes] = useState<number[]>(new Array(7).fill(240));
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

  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalWeight = getTotalWeight();
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
      binVolumes: binVolumes.map(v => v || 240),
      binAverages: {
        weight: getBinAverage(binWeights),
        volume: getBinAverage(binVolumes),
        bulkDensity: getBinAverage(binWeights.map((w, i) => parseFloat(getBulkDensity(w, binVolumes[i]))))
      },
      
      // Sorting weights
      sortingWeights: sortingWeights.map(w => w || 0),
      sortingTotal: sortingWeights.reduce((a, b) => a + b, 0),
      
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
      remarks
    };

    onSubmit({
      location: sourceDistrict,
      operator: producerName,
      readings: processedData
    });

    toast({
      title: "Waste Audit Data Saved",
      description: `Sample ${sampleNumber} has been recorded successfully.`,
    });
  };

  const clearForm = () => {
    setSampleNumber('');
    setDateTime(new Date().toISOString().slice(0, 16));
    setVehicleNumber('');
    setSourceDistrict('');
    setSampleWeight('');
    setVehicleType('');
    setBinWeights(new Array(7).fill(0));
    setSortingWeights(new Array(7).fill(0));
    setWasteCategories(prev => prev.map(cat => ({ ...cat, emptyBin: 0, weightWithWaste: 0 })));
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">Waste Collection Data Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sampleNumber">Sample Number *</Label>
                  <Input
                    id="sampleNumber"
                    value={sampleNumber}
                    onChange={(e) => setSampleNumber(e.target.value)}
                    placeholder="Enter sample number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTime">Date & Time *</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="Sampling vehicle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manifestId">Manifest ID</Label>
                  <Input
                    id="manifestId"
                    value={manifestId}
                    onChange={(e) => setManifestId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producerName">Producer's Name - ESP</Label>
                  <Input
                    id="producerName"
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceDistrict">Source District *</Label>
                  <Input
                    id="sourceDistrict"
                    value={sourceDistrict}
                    onChange={(e) => setSourceDistrict(e.target.value)}
                    placeholder="District name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wasteType">Type of Waste</Label>
                  <Input
                    id="wasteType"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sampleWeight">Sample Weight (kg)</Label>
                  <Input
                    id="sampleWeight"
                    type="number"
                    step="0.01"
                    value={sampleWeight}
                    onChange={(e) => setSampleWeight(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Input
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="Type of vehicle"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Bin Measurements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">Bin Measurements</h3>
              
              {/* Bin Weights */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Bin Weight (kg)</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {binWeights.map((weight, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">{index < 7 ? `Bin ${index + 1}` : 'Avg'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={index < 7 ? weight || '' : getBinAverage(binWeights)}
                        onChange={(e) => {
                          if (index < 7) {
                            const newWeights = [...binWeights];
                            newWeights[index] = parseFloat(e.target.value) || 0;
                            setBinWeights(newWeights);
                          }
                        }}
                        disabled={index >= 7}
                        className={index >= 7 ? 'bg-gray-100' : ''}
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bin Volumes */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Bin Volume (m³)</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {binVolumes.map((volume, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">{index < 7 ? `Bin ${index + 1}` : 'Avg'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={index < 7 ? volume || '' : getBinAverage(binVolumes)}
                        onChange={(e) => {
                          if (index < 7) {
                            const newVolumes = [...binVolumes];
                            newVolumes[index] = parseFloat(e.target.value) || 240;
                            setBinVolumes(newVolumes);
                          }
                        }}
                        disabled={index >= 7}
                        className={index >= 7 ? 'bg-gray-100' : ''}
                        placeholder="240.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk Density */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Bulk Density (kg/m³)</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {binWeights.map((weight, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">{index < 7 ? `Bin ${index + 1}` : 'Avg'}</Label>
                      <Input
                        type="text"
                        value={index < 7 ? getBulkDensity(weight, binVolumes[index]) : getBinAverage(binWeights.map((w, i) => parseFloat(getBulkDensity(w, binVolumes[i]))))}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sorting Sample Weight */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Sorting Sample Weight</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {sortingWeights.map((weight, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">{index < 7 ? `${index + 1}` : 'Total'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={index < 7 ? weight || '' : sortingWeights.reduce((a, b) => a + b, 0)}
                        onChange={(e) => {
                          if (index < 7) {
                            const newWeights = [...sortingWeights];
                            newWeights[index] = parseFloat(e.target.value) || 0;
                            setSortingWeights(newWeights);
                          }
                        }}
                        disabled={index >= 7}
                        className={index >= 7 ? 'bg-gray-100' : ''}
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Waste Category Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-600">Waste Category Breakdown</h3>
                <div className="text-sm text-gray-600">
                  Total Weight: <span className="font-bold text-purple-600">{getTotalWeight().toFixed(2)} kg</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Primary Category</th>
                      <th className="border border-gray-300 p-2 text-left">Secondary Category</th>
                      <th className="border border-gray-300 p-2 text-center">Empty Bin</th>
                      <th className="border border-gray-300 p-2 text-center">Weight with Waste</th>
                      <th className="border border-gray-300 p-2 text-center">Net Weight</th>
                      <th className="border border-gray-300 p-2 text-center">Percentage</th>
                      <th className="border border-gray-300 p-2 text-center">Bin #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteCategories.map((category, index) => {
                      const netWeight = calculateNetWeight(category.emptyBin, category.weightWithWaste);
                      const percentage = calculatePercentage(netWeight, getTotalWeight());
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">{category.primary}</td>
                          <td className="border border-gray-300 p-2">{category.secondary}</td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={category.emptyBin || ''}
                              onChange={(e) => updateWasteCategory(index, 'emptyBin', e.target.value)}
                              className="w-20 text-center"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={category.weightWithWaste || ''}
                              onChange={(e) => updateWasteCategory(index, 'weightWithWaste', e.target.value)}
                              className="w-20 text-center"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="border border-gray-300 p-2 text-center font-medium">
                            {netWeight.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {percentage}%
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {category.binNumber || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* Remarks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any additional observations or notes..."
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button"
                onClick={clearForm}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Form
              </Button>
              
              <Button 
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Waste Audit Data
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
