
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Search, Calendar, MapPin, User } from "lucide-react";
import { DataReading } from "@/pages/Index";

interface DataManagerProps {
  dataReadings: DataReading[];
  fields: string[];
  onDelete: (id: string) => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ dataReadings, fields, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'location' | 'operator'>('timestamp');

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
          <Card key={reading.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(reading.timestamp).toLocaleString()}
                  </div>
                  {reading.location && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {reading.location}
                    </Badge>
                  )}
                  {reading.operator && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {reading.operator}
                    </Badge>
                  )}
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
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
            </CardHeader>
            
            <CardContent className="pt-0">
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
