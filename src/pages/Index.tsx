import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryForm } from "@/components/DataEntryForm";
import { DataManager } from "@/components/DataManager";
import { useToast } from "@/hooks/use-toast";
import { DataReading } from "@/types/index";

const Index = () => {
  const [dataReadings, setDataReadings] = useState<DataReading[]>([]);
  const [fields, setFields] = useState<string[]>(["Sample Number", "Vehicle Number", "Source District"]);
  const [editingReading, setEditingReading] = useState<DataReading | null>(null);
  const [activeTab, setActiveTab] = useState("entry");
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

  const updateDataReading = (updatedReading: Omit<DataReading, 'id' | 'timestamp'>) => {
    if (!editingReading) return;
    
    const updated: DataReading = {
      ...editingReading,
      ...updatedReading,
    };
    
    setDataReadings(prev => prev.map(reading => 
      reading.id === editingReading.id ? updated : reading
    ));
    
    setEditingReading(null);
    setActiveTab("manage");
    
    toast({
      title: "Record Updated",
      description: "Waste audit data has been successfully updated.",
    });
  };

  const deleteReading = (id: string) => {
    setDataReadings(prev => prev.filter(reading => reading.id !== id));
    
    toast({
      title: "Record Deleted",
      description: "Waste audit data has been removed.",
    });
  };

  const handleEditReading = (reading: DataReading) => {
    setEditingReading(reading);
    setActiveTab("entry");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-2">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="text-center">
              <CardTitle className="text-xl">Waste Audit Data Center</CardTitle>
              <CardDescription className="text-sm">
                {dataReadings.length} waste collection records
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="entry" className="text-sm py-2">
                  {editingReading ? 'Edit Record' : 'Waste Audit Entry'}
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-sm py-2">
                  Records ({dataReadings.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="entry" className="space-y-4">
                <DataEntryForm 
                  fields={fields}
                  setFields={setFields}
                  onSubmit={editingReading ? updateDataReading : addDataReading}
                  editingData={editingReading}
                  onCancelEdit={() => {
                    setEditingReading(null);
                    setActiveTab("manage");
                  }}
                />
              </TabsContent>
              
              <TabsContent value="manage" className="space-y-4">
                <DataManager 
                  dataReadings={dataReadings}
                  fields={fields}
                  onDelete={deleteReading}
                  onEdit={handleEditReading}
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
