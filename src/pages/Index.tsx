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

    // Create CSV content with proper formatting
    const csvRows = [];
    
    // Basic Information Headers
    csvRows.push('BASIC INFORMATION');
    csvRows.push('Timestamp,Sample Number,Date & Time,Vehicle Number,Manifest ID,Producer Name,Source District,Waste Type,Sample Weight (kg),Vehicle Type');
    
    // Add basic information for each reading
    dataReadings.forEach(reading => {
      const data = reading.readings;
      csvRows.push([
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
      ].join(','));
    });
    
    csvRows.push(''); // Empty row for separation
    
    // Bin Measurements Section
    csvRows.push('BIN MEASUREMENTS');
    csvRows.push('Bin Number,Weight (kg),Volume (m³),Bulk Density (kg/m³)');
    
    dataReadings.forEach(reading => {
      const data = reading.readings;
      const binWeights = data.binWeights || [];
      const binVolumes = data.binVolumes || [];
      
      binWeights.forEach((weight, index) => {
        const volume = binVolumes[index] || 1;
        const bulkDensity = volume > 0 ? (weight / volume).toFixed(2) : '0.00';
        csvRows.push([
          index + 1,
          weight || 0,
          volume,
          bulkDensity
        ].join(','));
      });
    });
    
    csvRows.push(''); // Empty row for separation
    
    // Sorting Sample Weights
    csvRows.push('SORTING SAMPLE WEIGHTS');
    csvRows.push('Sample 1,Sample 2,Sample 3,Sample 4,Sample 5,Sample 6,Sample 7,Additional Samples...,Total');
    
    dataReadings.forEach(reading => {
      const data = reading.readings;
      const sortingWeights = data.sortingWeights || [];
      const row = [];
      
      // Add all sorting weights
      sortingWeights.forEach(weight => {
        row.push(weight || 0);
      });
      
      // Add total
      row.push(data.sortingTotal || 0);
      csvRows.push(row.join(','));
    });
    
    csvRows.push(''); // Empty row for separation
    
    // Waste Category Breakdown
    csvRows.push('WASTE CATEGORY BREAKDOWN');
    csvRows.push('Main Category,Sub Category,Empty Bin Weight (kg),Weight with Waste (kg),Net Weight (kg),Percentage (%)');
    
    dataReadings.forEach(reading => {
      const data = reading.readings;
      const wasteBreakdown = data.wasteBreakdown || [];
      
      wasteBreakdown.forEach(category => {
        csvRows.push([
          `"${category.primary || ''}"`,
          `"${category.secondary || ''}"`,
          category.emptyBin || 0,
          category.weightWithWaste || 0,
          category.netWeight || 0,
          category.percentage || '0.00'
        ].join(','));
      });
    });
    
    csvRows.push(''); // Empty row for separation
    
    // Summary Information
    csvRows.push('SUMMARY CALCULATIONS');
    csvRows.push('Sample Number,Sorting Sample Total (kg),Waste Category Total (kg),Sampling/Moisture Loss (kg),Percentage Loss (%),Remarks');
    
    dataReadings.forEach(reading => {
      const data = reading.readings;
      csvRows.push([
        `"${data.sampleNumber || ''}"`,
        data.sortingTotal || 0,
        data.totalWeight || 0,
        data.samplingMoistureLoss || 0,
        data.percentageLoss || '0.00',
        `"${data.remarks || ''}"`
      ].join(','));
    });

    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `organized-waste-audit-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Organized waste audit data has been exported to CSV file.",
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
