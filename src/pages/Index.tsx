
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryForm } from "@/components/DataEntryForm";
import { DataManager } from "@/components/DataManager";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DataReading {
  id: string;
  timestamp: string;
  location?: string;
  operator?: string;
  readings: { [key: string]: string | number | any };
}

const Index = () => {
  const [dataReadings, setDataReadings] = useState<DataReading[]>([]);
  const [fields, setFields] = useState<string[]>(["Sample Number", "Vehicle Number", "Source District"]);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('wasteAuditData');
    const savedFields = localStorage.getItem('wasteAuditFields');
    
    if (savedData) {
      setDataReadings(JSON.parse(savedData));
    }
    if (savedFields) {
      setFields(JSON.parse(savedFields));
    }
  }, []);

  // Save data to localStorage whenever dataReadings change
  useEffect(() => {
    localStorage.setItem('wasteAuditData', JSON.stringify(dataReadings));
  }, [dataReadings]);

  // Save fields to localStorage whenever fields change
  useEffect(() => {
    localStorage.setItem('wasteAuditFields', JSON.stringify(fields));
  }, [fields]);

  const addDataReading = (reading: Omit<DataReading, 'id' | 'timestamp'>) => {
    const newReading: DataReading = {
      ...reading,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setDataReadings(prev => [newReading, ...prev]);
    
    toast({
      title: "Waste Audit Recorded",
      description: "Waste collection data has been successfully saved.",
    });
  };

  const deleteReading = (id: string) => {
    setDataReadings(prev => prev.filter(reading => reading.id !== id));
    
    toast({
      title: "Record Deleted",
      description: "Waste audit data has been removed.",
    });
  };

  const exportToCSV = () => {
    if (dataReadings.length === 0) {
      toast({
        title: "No Data",
        description: "No waste audit records available to export.",
        variant: "destructive",
      });
      return;
    }

    // Create comprehensive CSV headers for all waste audit data
    const basicHeaders = [
      'Timestamp', 'Sample Number', 'Date & Time', 'Vehicle Number', 'Manifest ID',
      'Producer Name', 'Source District', 'Waste Type', 'Sample Weight (kg)', 'Vehicle Type'
    ];

    // Bin measurement headers (dynamic based on bin count)
    const maxBins = Math.max(...dataReadings.map(r => r.readings.binWeights?.length || 7));
    const binHeaders = [];
    for (let i = 1; i <= maxBins; i++) {
      binHeaders.push(`Bin ${i} Weight (kg)`, `Bin ${i} Volume (m³)`, `Bin ${i} Bulk Density (kg/m³)`);
    }
    binHeaders.push('Avg Bin Weight', 'Avg Bin Volume', 'Avg Bulk Density');

    // Sorting sample headers
    const sortingHeaders = [];
    for (let i = 1; i <= maxBins; i++) {
      sortingHeaders.push(`Sorting Sample ${i} (kg)`);
    }
    sortingHeaders.push('Sorting Sample Total (kg)');

    // Waste category headers
    const wasteCategories = [
      'Paper - Mixed Paper', 'Paper - High-Grade Paper', 'Paper - Cardboard', 'Paper - Tissue Paper', 'Paper - Coated Paper',
      'Plastics - PVC', 'Plastics - PET bottles', 'Plastics - HDPE bottles', 'Plastics - LDPE films', 'Plastics - PP containers',
      'Plastics - Other plastic', 'Plastics - PS Styrofoam', 'Plastics - Single-use plastic',
      'Metals - Ferrous', 'Metals - Non-Ferrous', 'Metals - Mixed',
      'Glass - Clear', 'Glass - Colored', 'Glass - Specialty',
      'Textiles - Reusable', 'Textiles - Non-Reusable',
      'Rubbers - Tires', 'Rubbers - Products',
      'Liquid Waste', 'Animal Waste - Domestic', 'Animal Waste - Dead animals',
      'PPE - Masks/Gloves', 'WEEE - Electronics', 'Food Waste',
      'Fines (<30cm)', 'Diapers', 'Wood Waste',
      'Hazardous - Household', 'Hazardous - Medical',
      'Aluminum - Cans', 'Aluminum - Foils', 'Aluminum - Other',
      'Miscellaneous'
    ];

    const wasteCategoryHeaders = [];
    wasteCategories.forEach(category => {
      wasteCategoryHeaders.push(`${category} - Empty Bin (kg)`, `${category} - With Waste (kg)`, `${category} - Net Weight (kg)`, `${category} - Percentage (%)`);
    });

    // Summary calculation headers
    const summaryHeaders = [
      'Total Waste Weight (kg)', 'Sampling/Moisture Loss (kg)', 'Percentage Loss (%)', 'Remarks'
    ];

    const headers = [...basicHeaders, ...binHeaders, ...sortingHeaders, ...wasteCategoryHeaders, ...summaryHeaders];
    
    // Create CSV rows
    const csvContent = [
      headers.join(','),
      ...dataReadings.map(reading => {
        const data = reading.readings;
        const row = [];

        // Basic information
        row.push(
          `"${new Date(reading.timestamp).toLocaleString()}"`,
          `"${data.sampleNumber || ''}"`,
          `"${data.dateTime || ''}"`,
          `"${data.vehicleNumber || ''}"`,
          `"${data.manifestId || ''}"`,
          `"${data.producerName || ''}"`,
          `"${data.sourceDistrict || ''}"`,
          `"${data.wasteType || ''}"`,
          data.sampleWeight || 0,
          `"${data.vehicleType || ''}"`
        );

        // Bin measurements
        const binWeights = data.binWeights || [];
        const binVolumes = data.binVolumes || [];
        for (let i = 0; i < maxBins; i++) {
          const weight = binWeights[i] || 0;
          const volume = binVolumes[i] || 240;
          const bulkDensity = volume > 0 ? (weight / volume).toFixed(2) : '0.00';
          row.push(weight, volume, bulkDensity);
        }
        row.push(
          data.binAverages?.weight || '0.00',
          data.binAverages?.volume || '0.00',
          data.binAverages?.bulkDensity || '0.00'
        );

        // Sorting samples
        const sortingWeights = data.sortingWeights || [];
        for (let i = 0; i < maxBins; i++) {
          row.push(sortingWeights[i] || 0);
        }
        row.push(data.sortingTotal || 0);

        // Waste category breakdown
        const wasteBreakdown = data.wasteBreakdown || [];
        wasteCategories.forEach((_, index) => {
          const categoryData = wasteBreakdown[index];
          if (categoryData) {
            row.push(
              categoryData.emptyBin || 0,
              categoryData.weightWithWaste || 0,
              categoryData.netWeight || 0,
              categoryData.percentage || '0.00'
            );
          } else {
            row.push(0, 0, 0, '0.00');
          }
        });

        // Summary calculations
        row.push(
          data.totalWeight || 0,
          data.samplingMoistureLoss || 0,
          data.percentageLoss || '0.00',
          `"${data.remarks || ''}"`
        );

        return row.join(',');
      })
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprehensive-waste-audit-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Comprehensive waste audit data has been exported to CSV file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-2">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <CardTitle className="text-xl">Waste Audit Data Center</CardTitle>
                <CardDescription className="text-sm">
                  {dataReadings.length} waste collection records
                </CardDescription>
              </div>
              <Button 
                onClick={exportToCSV}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full"
                disabled={dataReadings.length === 0}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Comprehensive CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <Tabs defaultValue="entry" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="entry" className="text-sm py-2">
                  Waste Audit Entry
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-sm py-2">
                  Records ({dataReadings.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="entry" className="space-y-4">
                <DataEntryForm 
                  fields={fields}
                  setFields={setFields}
                  onSubmit={addDataReading}
                />
              </TabsContent>
              
              <TabsContent value="manage" className="space-y-4">
                <DataManager 
                  dataReadings={dataReadings}
                  fields={fields}
                  onDelete={deleteReading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
