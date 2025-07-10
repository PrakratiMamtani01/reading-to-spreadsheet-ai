import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Search, Calendar, MapPin, User, Download, Edit, MoreHorizontal } from "lucide-react";
import { DataReading } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataManagerProps {
  dataReadings: DataReading[];
  fields: string[];
  onDelete: (id: string) => void;
  onEdit: (reading: DataReading) => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ dataReadings, fields, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'location' | 'operator'>('timestamp');
  const { toast } = useToast();

  const exportSingleRecordToCSV = (reading: DataReading) => {
    const csvRows = [];
    const data = reading.readings;
    
    // Basic Information Headers
    csvRows.push('BASIC INFORMATION');
    csvRows.push('Timestamp,Sample Number,Date & Time,Vehicle Number,Manifest ID,Producer Name,Source District,Waste Type,Sample Weight (kg),Vehicle Type');
    
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
    
    csvRows.push(''); // Empty row for separation
    
    // Bin Measurements Section
    csvRows.push('BIN MEASUREMENTS');
    csvRows.push('Bin Number,Weight (kg),Volume (m³),Bulk Density (kg/m³)');
    
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
    
    csvRows.push(''); // Empty row for separation
    
    // Sorting Sample Weights
    csvRows.push('SORTING SAMPLE WEIGHTS');
    csvRows.push('Sample 1,Sample 2,Sample 3,Sample 4,Sample 5,Sample 6,Sample 7,Additional Samples...,Total');
    
    const sortingWeights = data.sortingWeights || [];
    const row = [];
    
    // Add all sorting weights
    sortingWeights.forEach(weight => {
      row.push(weight || 0);
    });
    
    // Add total
    row.push(data.sortingTotal || 0);
    csvRows.push(row.join(','));
    
    csvRows.push(''); // Empty row for separation
    
    // Waste Category Breakdown
    csvRows.push('WASTE CATEGORY BREAKDOWN');
    csvRows.push('Main Category,Sub Category,Empty Bin Weight (kg),Weight with Waste (kg),Net Weight (kg),Percentage (%)');
    
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
    
    csvRows.push(''); // Empty row for separation
    
    // Summary Information
    csvRows.push('SUMMARY CALCULATIONS');
    csvRows.push('Sample Number,Sorting Sample Total (kg),Waste Category Total (kg),Sampling/Moisture Loss (kg),Percentage Loss (%),Remarks');
    
    csvRows.push([
      `"${data.sampleNumber || ''}"`,
      data.sortingTotal || 0,
      data.totalWeight || 0,
      data.samplingMoistureLoss || 0,
      data.percentageLoss || '0.00',
      `"${data.remarks || ''}"`
    ].join(','));

    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waste-audit-${data.sampleNumber || 'record'}-${new Date(reading.timestamp).toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Individual waste audit record has been exported to CSV file.",
    });
  };

  const filteredReadings = dataReadings.filter(reading => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reading.location?.toLowerCase().includes(searchLower) ||
      reading.operator?.toLowerCase().includes(searchLower) ||
      Object.values(reading.readings).some(value => 
        value.toString().toLowerCase().includes(searchLower)
      ) ||
      new Date(reading.timestamp).toLocaleString().toLowerCase().includes(searchLower)
    );
  });

  const sortedReadings = filteredReadings.sort((a, b) => {
    switch (sortBy) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'location':
        return (a.location || '').localeCompare(b.location || '');
      case 'operator':
        return (a.operator || '').localeCompare(b.operator || '');
      default:
        return 0;
    }
  });

  if (dataReadings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Calendar className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No readings yet</h3>
        <p className="text-gray-500">Start by adding your first data reading in the Entry tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search readings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'location' | 'operator')}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
        >
          <option value="timestamp">Sort by Date</option>
          <option value="location">Sort by Location</option>
          <option value="operator">Sort by Operator</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{dataReadings.length}</div>
          <div className="text-sm text-blue-800">Total Readings</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {new Set(dataReadings.map(r => r.location).filter(Boolean)).size}
          </div>
          <div className="text-sm text-green-800">Locations</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(dataReadings.map(r => r.operator).filter(Boolean)).size}
          </div>
          <div className="text-sm text-purple-800">Operators</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{fields.length}</div>
          <div className="text-sm text-orange-800">Data Fields</div>
        </div>
      </div>

      {/* Readings List */}
      <div className="space-y-4">
        {sortedReadings.map((reading) => (
          <Card key={reading.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{new Date(reading.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reading.location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{reading.location}</span>
                      </Badge>
                    )}
                    {reading.operator && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{reading.operator}</span>
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Mobile: Use dropdown menu for actions */}
                <div className="flex items-center gap-2 sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSingleRecordToCSV(reading);
                        }}
                        className="text-blue-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(reading);
                        }}
                        className="text-green-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Record
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-600"
                      >
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div className="flex items-center w-full">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Record
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reading</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this reading? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDelete(reading.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop: Show individual buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSingleRecordToCSV(reading);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(reading);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reading</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this reading? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(reading.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0" onClick={() => onEdit(reading)}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fields.map((field) => (
                  <div key={field} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">{field}</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {reading.readings[field] || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReadings.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No readings match your search criteria.</p>
        </div>
      )}
    </div>
  );
};
