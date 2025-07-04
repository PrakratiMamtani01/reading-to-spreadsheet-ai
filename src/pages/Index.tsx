
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryForm } from "@/components/DataEntryForm";
import { DataManager } from "@/components/DataManager";
import { FileText, Database, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DataReading {
  id: string;
  timestamp: string;
  location?: string;
  operator?: string;
  readings: { [key: string]: string | number };
}

const Index = () => {
  const [dataReadings, setDataReadings] = useState<DataReading[]>([]);
  const [fields, setFields] = useState<string[]>(["Temperature", "Pressure", "Flow Rate"]);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dataReadings');
    const savedFields = localStorage.getItem('dataFields');
    
    if (savedData) {
      setDataReadings(JSON.parse(savedData));
    }
    if (savedFields) {
      setFields(JSON.parse(savedFields));
    }
  }, []);

  // Save data to localStorage whenever dataReadings change
  useEffect(() => {
    localStorage.setItem('dataReadings', JSON.stringify(dataReadings));
  }, [dataReadings]);

  // Save fields to localStorage whenever fields change
  useEffect(() => {
    localStorage.setItem('dataFields', JSON.stringify(fields));
  }, [fields]);

  const addDataReading = (reading: Omit<DataReading, 'id' | 'timestamp'>) => {
    const newReading: DataReading = {
      ...reading,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setDataReadings(prev => [newReading, ...prev]);
    
    toast({
      title: "Reading Added",
      description: "Data reading has been successfully recorded.",
    });
  };

  const deleteReading = (id: string) => {
    setDataReadings(prev => prev.filter(reading => reading.id !== id));
    
    toast({
      title: "Reading Deleted",
      description: "Data reading has been removed.",
    });
  };

  const exportToCSV = () => {
    if (dataReadings.length === 0) {
      toast({
        title: "No Data",
        description: "No readings available to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV headers
    const headers = ['Timestamp', 'Location', 'Operator', ...fields];
    
    // Create CSV rows
    const csvContent = [
      headers.join(','),
      ...dataReadings.map(reading => [
        new Date(reading.timestamp).toLocaleString(),
        reading.location || '',
        reading.operator || '',
        ...fields.map(field => reading.readings[field] || '')
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-readings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Data has been exported to CSV file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Digital Data Entry System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your manual data collection process with this modern, efficient digital solution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Quick Entry</CardTitle>
              <CardDescription>
                Fast and accurate data input with real-time validation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <Database className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Data Management</CardTitle>
              <CardDescription>
                View, edit, and organize all your readings in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <Download className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Excel Export</CardTitle>
              <CardDescription>
                Export your data to CSV format for Excel compatibility
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Data Collection Center</CardTitle>
                <CardDescription>
                  {dataReadings.length} readings recorded
                </CardDescription>
              </div>
              <Button 
                onClick={exportToCSV}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
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
                  Data Entry
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-lg py-3">
                  Manage Data ({dataReadings.length})
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
