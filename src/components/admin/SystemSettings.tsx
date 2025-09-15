import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Brain, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SystemSettings: React.FC = () => {
  const [mlConfig, setMlConfig] = useState({
    attendance_weight: 0.25,
    marks_weight: 0.25,
    assignments_weight: 0.20,
    sentiment_weight: 0.30,
    low_risk_threshold: 0.33,
    high_risk_threshold: 0.66
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMLConfig();
  }, []);

  const fetchMLConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ml_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching ML config:', error);
        return;
      }

      if (data) {
        setMlConfig({
          attendance_weight: data.attendance_weight || 0.25,
          marks_weight: data.marks_weight || 0.25,
          assignments_weight: data.assignments_weight || 0.20,
          sentiment_weight: data.sentiment_weight || 0.30,
          low_risk_threshold: data.low_risk_threshold || 0.33,
          high_risk_threshold: data.high_risk_threshold || 0.66
        });
      }
    } catch (error) {
      console.error('Error fetching ML config:', error);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ml_config')
        .insert({
          ...mlConfig,
          updated_by: 'admin-001' // Admin user ID
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "ML configuration updated successfully. BRI scores will be recalculated."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWeight = (field: string, value: number[]) => {
    setMlConfig(prev => ({ ...prev, [field]: value[0] }));
  };

  const totalWeight = mlConfig.attendance_weight + mlConfig.marks_weight + 
                     mlConfig.assignments_weight + mlConfig.sentiment_weight;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Settings className="w-8 h-8 text-purple-600" />
          System Settings
        </h1>
        <p className="text-gray-600">Configure ML algorithms and system parameters</p>
      </div>

      {/* ML Configuration */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            ML Algorithm Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weight Configuration */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Burnout Risk Index Weights</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Attendance Weight</Label>
                  <span className="text-sm font-medium">{(mlConfig.attendance_weight * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[mlConfig.attendance_weight]}
                  onValueChange={(value) => updateWeight('attendance_weight', value)}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Marks Weight</Label>
                  <span className="text-sm font-medium">{(mlConfig.marks_weight * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[mlConfig.marks_weight]}
                  onValueChange={(value) => updateWeight('marks_weight', value)}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Assignments Weight</Label>
                  <span className="text-sm font-medium">{(mlConfig.assignments_weight * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[mlConfig.assignments_weight]}
                  onValueChange={(value) => updateWeight('assignments_weight', value)}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Sentiment Weight</Label>
                  <span className="text-sm font-medium">{(mlConfig.sentiment_weight * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[mlConfig.sentiment_weight]}
                  onValueChange={(value) => updateWeight('sentiment_weight', value)}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>
            </div>

            {/* Weight Validation */}
            <div className={`p-3 rounded-lg border ${
              Math.abs(totalWeight - 1) < 0.01 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${
                  Math.abs(totalWeight - 1) < 0.01 ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`text-sm font-medium ${
                  Math.abs(totalWeight - 1) < 0.01 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Total Weight: {(totalWeight * 100).toFixed(0)}%
                  {Math.abs(totalWeight - 1) >= 0.01 && ' (Should equal 100%)'}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Thresholds */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Risk Level Thresholds</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Low Risk Threshold</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={mlConfig.low_risk_threshold}
                    onChange={(e) => setMlConfig(prev => ({ 
                      ...prev, 
                      low_risk_threshold: parseFloat(e.target.value) || 0 
                    }))}
                  />
                  <span className="text-sm text-gray-500">({(mlConfig.low_risk_threshold * 100).toFixed(0)}%)</span>
                </div>
              </div>

              <div>
                <Label>High Risk Threshold</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={mlConfig.high_risk_threshold}
                    onChange={(e) => setMlConfig(prev => ({ 
                      ...prev, 
                      high_risk_threshold: parseFloat(e.target.value) || 0 
                    }))}
                  />
                  <span className="text-sm text-gray-500">({(mlConfig.high_risk_threshold * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveConfig} 
            disabled={loading || Math.abs(totalWeight - 1) >= 0.01}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Configuration & Recalculate BRI'}
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">v2.1.0</p>
              <p className="text-sm text-gray-500">System Version</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">99.9%</p>
              <p className="text-sm text-gray-500">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">ML v1.3</p>
              <p className="text-sm text-gray-500">Algorithm Version</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">Active</p>
              <p className="text-sm text-gray-500">System Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;