
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataReading } from "@/pages/Index";

interface DataEntryFormProps {
  fields: string[];
  setFields: (fields: string[]) => void;
  onSubmit: (reading: Omit<DataReading, 'id' | 'timestamp'>) => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ fields, setFields, onSubmit }) => {
  const [location, setLocation] = useState('');
  const [operator, setOperator] = useState('');
  const [readings, setReadings] = useState<{ [key: string]: string }>({});
  const [newField, setNewField] = useState('');
  const { toast } = useToast();

  const handleReadingChange = (field: string, value: string) => {
    setReadings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCustomField = () => {
    if (newField.trim() && !fields.includes(newField.trim())) {
      setFields([...fields, newField.trim()]);
      setNewField('');
      toast({
        title: "Field Added",
        description: `"${newField.trim()}" has been added to your data fields.`,
      });
    }
  };

  const removeField = (fieldToRemove: string) => {
    setFields(fields.filter(field => field !== fieldToRemove));
    setReadings(prev => {
      const updated = { ...prev };
      delete updated[fieldToRemove];
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one reading is provided
    const hasData = Object.values(readings).some(value => value.trim() !== '');
    
    if (!hasData) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one reading value.",
        variant: "destructive",
      });
      return;
    }

    // Convert numeric strings to numbers where possible
    const processedReadings: { [key: string]: string | number } = {};
    Object.entries(readings).forEach(([key, value]) => {
      const numValue = parseFloat(value);
      processedReadings[key] = isNaN(numValue) ? value : numValue;
    });

    onSubmit({
      location: location.trim(),
      operator: operator.trim(),
      readings: processedReadings
    });

    // Clear form after successful submission
    setReadings({});
    setLocation('');
    setOperator('');
  };

  return (
    <div className="space-y-6">
      {/* Custom Fields Management */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Customize Data Fields
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter new field name (e.g., Humidity, Speed)"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomField()}
              className="flex-1"
            />
            <Button onClick={addCustomField} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {fields.map((field) => (
              <Badge key={field} variant="secondary" className="text-sm py-1 px-3">
                {field}
                <button
                  onClick={() => removeField(field)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Enter New Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Building A, Room 101"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operator (Optional)</Label>
                <Input
                  id="operator"
                  placeholder="e.g., John Smith"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Dynamic Reading Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Measurement Readings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{field}</Label>
                    <Input
                      id={field}
                      type="text"
                      placeholder="Enter value"
                      value={readings[field] || ''}
                      onChange={(e) => handleReadingChange(field, e.target.value)}
                      className="text-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Reading
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
