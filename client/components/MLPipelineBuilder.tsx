import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Workflow, 
  Plus, 
  Settings, 
  Play, 
  Save, 
  Download,
  Upload,
  Database,
  Cpu,
  BarChart3,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface PipelineNode {
  id: string;
  type: 'data_source' | 'preprocessing' | 'model' | 'evaluation' | 'deployment';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface PipelineConnection {
  id: string;
  from: string;
  to: string;
}

interface MLPipeline {
  id: string;
  name: string;
  description: string;
  nodes: PipelineNode[];
  connections: PipelineConnection[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: string;
  lastRun: string;
}

const MLPipelineBuilder: React.FC = () => {
  const [pipelines, setPipelines] = useState<MLPipeline[]>([
    {
      id: '1',
      name: 'Construction Progress Prediction',
      description: 'End-to-end pipeline for predicting project completion dates',
      nodes: [
        {
          id: 'data-1',
          type: 'data_source',
          name: 'Project Data',
          config: { source: 'database', table: 'projects' },
          position: { x: 100, y: 100 },
          status: 'completed'
        },
        {
          id: 'prep-1',
          type: 'preprocessing',
          name: 'Data Cleaning',
          config: { method: 'standardization' },
          position: { x: 300, y: 100 },
          status: 'completed'
        },
        {
          id: 'model-1',
          type: 'model',
          name: 'Random Forest',
          config: { algorithm: 'random_forest', n_estimators: 100 },
          position: { x: 500, y: 100 },
          status: 'completed'
        },
        {
          id: 'eval-1',
          type: 'evaluation',
          name: 'Model Evaluation',
          config: { metrics: ['accuracy', 'precision', 'recall'] },
          position: { x: 700, y: 100 },
          status: 'completed'
        }
      ],
      connections: [
        { id: 'conn-1', from: 'data-1', to: 'prep-1' },
        { id: 'conn-2', from: 'prep-1', to: 'model-1' },
        { id: 'conn-3', from: 'model-1', to: 'eval-1' }
      ],
      status: 'completed',
      createdAt: '2024-01-15',
      lastRun: '2024-01-20'
    },
    {
      id: '2',
      name: 'Quality Assessment Pipeline',
      description: 'Automated quality control using computer vision',
      nodes: [
        {
          id: 'data-2',
          type: 'data_source',
          name: 'Image Dataset',
          config: { source: 'files', format: 'images' },
          position: { x: 100, y: 100 },
          status: 'pending'
        },
        {
          id: 'prep-2',
          type: 'preprocessing',
          name: 'Image Processing',
          config: { resize: '224x224', normalize: true },
          position: { x: 300, y: 100 },
          status: 'pending'
        },
        {
          id: 'model-2',
          type: 'model',
          name: 'CNN Model',
          config: { architecture: 'resnet50', pretrained: true },
          position: { x: 500, y: 100 },
          status: 'pending'
        }
      ],
      connections: [
        { id: 'conn-4', from: 'data-2', to: 'prep-2' },
        { id: 'conn-5', from: 'prep-2', to: 'model-2' }
      ],
      status: 'draft',
      createdAt: '2024-01-18',
      lastRun: 'Never'
    }
  ]);

  const [selectedPipeline, setSelectedPipeline] = useState<MLPipeline | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [newPipeline, setNewPipeline] = useState({
    name: '',
    description: ''
  });

  const nodeTypes = [
    { type: 'data_source', name: 'Data Source', icon: Database, color: 'bg-blue-500' },
    { type: 'preprocessing', name: 'Preprocessing', icon: Settings, color: 'bg-green-500' },
    { type: 'model', name: 'Model', icon: Cpu, color: 'bg-purple-500' },
    { type: 'evaluation', name: 'Evaluation', icon: BarChart3, color: 'bg-orange-500' },
    { type: 'deployment', name: 'Deployment', icon: Upload, color: 'bg-red-500' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePipeline = () => {
    const pipeline: MLPipeline = {
      id: Date.now().toString(),
      name: newPipeline.name,
      description: newPipeline.description,
      nodes: [],
      connections: [],
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastRun: 'Never'
    };

    setPipelines([...pipelines, pipeline]);
    setNewPipeline({ name: '', description: '' });
  };

  const handleRunPipeline = async (pipelineId: string) => {
    setPipelines(pipelines.map(p => 
      p.id === pipelineId ? { ...p, status: 'running' } : p
    ));

    // Simulate pipeline execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPipelines(pipelines.map(p => 
      p.id === pipelineId 
        ? { 
            ...p, 
            status: 'completed',
            lastRun: new Date().toISOString().split('T')[0],
            nodes: p.nodes.map(node => ({ ...node, status: 'completed' }))
          }
        : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-600" />
            ML Pipeline Builder
          </h2>
          <p className="text-muted-foreground">
            Design, build, and execute machine learning pipelines visually
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pipeline</DialogTitle>
              <DialogDescription>
                Set up a new machine learning pipeline for your construction data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pipeline-name">Pipeline Name</Label>
                <Input
                  id="pipeline-name"
                  value={newPipeline.name}
                  onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
                  placeholder="Enter pipeline name"
                />
              </div>
              <div>
                <Label htmlFor="pipeline-description">Description</Label>
                <Input
                  id="pipeline-description"
                  value={newPipeline.description}
                  onChange={(e) => setNewPipeline({ ...newPipeline, description: e.target.value })}
                  placeholder="Describe the pipeline's purpose"
                />
              </div>
              <Button onClick={handleCreatePipeline} disabled={!newPipeline.name}>
                Create Pipeline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipelines List */}
      <div className="grid gap-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{pipeline.name}</h3>
                  <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {pipeline.createdAt} • Last run: {pipeline.lastRun}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(pipeline.status)}>
                    {pipeline.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedPipeline(pipeline)}
                  >
                    Edit
                  </Button>
                  {pipeline.status !== 'running' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleRunPipeline(pipeline.id)}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Run
                    </Button>
                  )}
                </div>
              </div>

              {/* Pipeline Visualization */}
              <div className="relative bg-gray-50 rounded-lg p-4 min-h-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Pipeline Flow</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Pipeline Nodes */}
                <div className="relative">
                  {pipeline.nodes.map((node) => {
                    const NodeIcon = nodeTypes.find(t => t.type === node.type)?.icon || Settings;
                    return (
                      <div
                        key={node.id}
                        className="absolute flex items-center gap-2 bg-white border rounded-lg p-3 shadow-sm min-w-[120px]"
                        style={{
                          left: node.position.x,
                          top: node.position.y
                        }}
                      >
                        <NodeIcon className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{node.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {node.type.replace('_', ' ')}
                          </p>
                        </div>
                        {getStatusIcon(node.status)}
                      </div>
                    );
                  })}

                  {/* Pipeline Connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {pipeline.connections.map((conn) => {
                      const fromNode = pipeline.nodes.find(n => n.id === conn.from);
                      const toNode = pipeline.nodes.find(n => n.id === conn.to);
                      if (!fromNode || !toNode) return null;

                      return (
                        <line
                          key={conn.id}
                          x1={fromNode.position.x + 120}
                          y1={fromNode.position.y + 20}
                          x2={toNode.position.x}
                          y2={toNode.position.y + 20}
                          stroke="#d1d5db"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#d1d5db"
                        />
                      </marker>
                    </defs>
                  </svg>
                </div>

                {pipeline.nodes.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No nodes in pipeline</p>
                      <p className="text-xs">Click "Edit" to add nodes</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Node Types Available */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Available Node Types:</p>
                <div className="flex flex-wrap gap-2">
                  {nodeTypes.map((nodeType) => {
                    const Icon = nodeType.icon;
                    return (
                      <Badge key={nodeType.type} variant="outline" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${nodeType.color}`} />
                        <Icon className="h-3 w-3" />
                        {nodeType.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Builder Modal */}
      {selectedPipeline && (
        <Dialog open={!!selectedPipeline} onOpenChange={() => setSelectedPipeline(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPipeline.name}</DialogTitle>
              <DialogDescription>
                Build your machine learning pipeline by adding and connecting nodes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Node Palette */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Add Nodes</h4>
                <div className="grid grid-cols-5 gap-2">
                  {nodeTypes.map((nodeType) => {
                    const Icon = nodeType.icon;
                    return (
                      <Button
                        key={nodeType.type}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto p-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{nodeType.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Pipeline Canvas */}
              <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Pipeline Canvas</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Save className="h-3 w-3 mr-1" />
                      Save Pipeline
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleRunPipeline(selectedPipeline.id)}
                      disabled={selectedPipeline.nodes.length === 0}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Pipeline
                    </Button>
                  </div>
                </div>
                
                <div className="text-center text-muted-foreground py-8">
                  <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Drag nodes from the palette to build your pipeline</p>
                  <p className="text-xs">Connect nodes by dragging from output to input ports</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MLPipelineBuilder;
