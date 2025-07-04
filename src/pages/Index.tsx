
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryForm } from "@/components/DataEntryForm";
import { DataManager } from "@/components/DataManager";
import { Recycle, Database, Download } from "lucide-react";
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

    // Create comprehensive CSV headers for waste audit data
    const headers = [
      'Timestamp', 'Sample Number', 'Date & Time', 'Vehicle Number', 'Source District',
      'Waste Type', 'Sample Weight', 'Vehicle Type', 'Total Weight', 'Remarks'
    ];
    
    // Create CSV rows
    const csvContent = [
      headers.join(','),
      ...dataReadings.map(reading => {
        const data = reading.readings;
        return [
          new Date(reading.timestamp).toLocaleString(),
          data.sampleNumber || '',
          data.dateTime || '',
          data.vehicleNumber || '',
          data.sourceDistrict || '',
          data.wasteType || '',
          data.sampleWeight || '',
          data.vehicleType || '',
          data.totalWeight || '',
          `"${data.remarks || ''}"`
        ].join(',');
      })
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waste-audit-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Waste audit data has been exported to CSV file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Waste Collection Data Entry System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Digital waste audit and collection data management system for efficient environmental monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <Recycle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Waste Audit</CardTitle>
              <CardDescription>
                Comprehensive waste categorization and weight measurement tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <Database className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Data Management</CardTitle>
              <CardDescription>
                View, analyze, and manage all waste collection records
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <Download className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Export Reports</CardTitle>
              <CardDescription>
                Generate CSV reports for environmental compliance and analysis
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Waste Audit Data Center</CardTitle>
                <CardDescription>
                  {dataReadings.length} waste collection records
                </CardDescription>
              </div>
              <Button 
                onClick={exportToCSV}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={dataReadings.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entry" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="entry" className="text-lg py-3">
                  Waste Audit Entry
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-lg py-3">
                  Manage Records ({dataReadings.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="entry" className="space-y-6">
                <DataEntryForm 
                  fields={fields}
                  setFields={setFields}
                  onSubmit={addDataReading}
                />
              </TabsContent>
              
              <TabsContent value="manage" className="space-y-6">
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
