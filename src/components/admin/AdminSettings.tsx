import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Brain, TrendingUp, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MLConfig {
  attendance_weight: number;
  marks_weight: number;
  assignments_weight: number;
  sentiment_weight: number;
  low_risk_threshold: number;
  high_risk_threshold: number;
}

const AdminSettings: React.FC = () => {
  const [config, setConfig] = useState<MLConfig>({
    attendance_weight: 0.25,
    marks_weight: 0.25,
    assignments_weight: 0.20,
    sentiment_weight: 0.30,
    low_risk_threshold: 0.33,
    high_risk_threshold: 0.66
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMLConfig();
  }, []);

  const fetchMLConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ml_config')
        .select('*')
        .single();

      if (error) throw error;
      
      if (data) {
        setConfig({
          attendance_weight: data.attendance_weight,
          marks_weight: data.marks_weight,
          assignments_weight: data.assignments_weight,
          sentiment_weight: data.sentiment_weight,
          low_risk_threshold: data.low_risk_threshold,
          high_risk_threshold: data.high_risk_threshold
        });
      }
    } catch (error) {
      console.error('Error fetching ML config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);

      // Validate weights sum to 1.0
      const totalWeight = config.attendance_weight + config.marks_weight + 
                         config.assignments_weight + config.sentiment_weight;
      
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        toast({
          title: "Error",
          description: "Weights must sum to 1.0 (100%)",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('ml_config')
        .update(config)
        .eq('id', (await supabase.from('ml_config').select('id').single()).data?.id);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "ML configuration updated successfully. BRI scores will be recalculated."
      });

      // Trigger BRI recalculation for all students
      const { data: students } = await supabase
        .from('students')
        .select('id');

      if (students) {
        // Trigger BRI recalculation in background
        students.forEach(async (student) => {
          await supabase.functions.invoke('ml-bri-calculation', {
            body: { student_id: student.id }
          });
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      attendance_weight: 0.25,
      marks_weight: 0.25,
      assignments_weight: 0.20,
      sentiment_weight: 0.30,
      low_risk_threshold: 0.33,
      high_risk_threshold: 0.66
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ML Configuration</h1>
        <p className="text-gray-600">Configure machine learning parameters for BRI calculation</p>
      </div>

      {/* Weight Configuration */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            BRI Calculation Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Attendance Weight: {(config.attendance_weight * 100).toFixed(0)}%</Label>
                <Slider
                  value={[config.attendance_weight]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, attendance_weight: value }))}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Academic Marks Weight: {(config.marks_weight * 100).toFixed(0)}%</Label>
                <Slider
                  value={[config.marks_weight]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, marks_weight: value }))}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Assignment Completion Weight: {(config.assignments_weight * 100).toFixed(0)}%</Label>
                <Slider
                  value={[config.assignments_weight]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, assignments_weight: value }))}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Sentiment Analysis Weight: {(config.sentiment_weight * 100).toFixed(0)}%</Label>
                <Slider
                  value={[config.sentiment_weight]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, sentiment_weight: value }))}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total Weight:</strong> {((config.attendance_weight + config.marks_weight + config.assignments_weight + config.sentiment_weight) * 100).toFixed(1)}%
              {Math.abs((config.attendance_weight + config.marks_weight + config.assignments_weight + config.sentiment_weight) - 1.0) > 0.01 && (
                <span className="text-red-600 ml-2">⚠️ Must equal 100%</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Thresholds */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Risk Classification Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Low Risk Threshold: {(config.low_risk_threshold * 100).toFixed(0)}%</Label>
              <Slider
                value={[config.low_risk_threshold]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, low_risk_threshold: value }))}
                max={1}
                min={0}
                step={0.01}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Students below this threshold are classified as Low Risk</p>
            </div>
            <div>
              <Label>High Risk Threshold: {(config.high_risk_threshold * 100).toFixed(0)}%</Label>
              <Slider
                value={[config.high_risk_threshold]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, high_risk_threshold: value }))}
                max={1}
                min={0}
                step={0.01}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Students above this threshold are classified as High Risk</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Risk Classification:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-green-600 font-medium">Low Risk:</span> 0% - {(config.low_risk_threshold * 100).toFixed(0)}%</p>
              <p><span className="text-yellow-600 font-medium">At Risk:</span> {(config.low_risk_threshold * 100).toFixed(0)}% - {(config.high_risk_threshold * 100).toFixed(0)}%</p>
              <p><span className="text-red-600 font-medium">High Risk:</span> {(config.high_risk_threshold * 100).toFixed(0)}% - 100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={resetToDefaults} variant="outline" className="flex-1">
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveConfig} disabled={saving} className="flex-1">
          {saving ? (
            <>
              <Settings className="w-4 h-4 mr-2 animate-spin" />
              Saving & Recalculating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {/* Information Panel */}
      <Card className="dashboard-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🧠 How BRI Calculation Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Input Factors</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• <strong>Attendance:</strong> Class attendance percentage</li>
                <li>• <strong>Academic Marks:</strong> Test and exam performance</li>
                <li>• <strong>Assignments:</strong> On-time submission rate</li>
                <li>• <strong>Sentiment:</strong> Chat and feedback analysis</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Output</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• <strong>BRI Score:</strong> 0-100 burnout risk index</li>
                <li>• <strong>Risk Level:</strong> Low, At Risk, or High</li>
                <li>• <strong>Contributing Factors:</strong> Top 3 risk drivers</li>
                <li>• <strong>Trend Analysis:</strong> Weekly progression</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;