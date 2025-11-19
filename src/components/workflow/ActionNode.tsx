import { Handle, Position, Node } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, User, X } from 'lucide-react';
import { ActionNodeData } from '@/app/(dashboard)/campaigns/create-campaign/page';
import { getNodeConfig, getNodeLabel, hasConditionalPaths, WorkflowNodeType } from '@/config/workflow-nodes';

export const ActionNode = ({ data, selected, onNodeClick, onDeleteNode }: { data: ActionNodeData; selected?: boolean; onNodeClick?: (nodeData: ActionNodeData) => void; onDeleteNode?: () => void }) => {
    const nodeConfig = getNodeConfig(data.type);
    const Icon = nodeConfig?.icon || User;
    const colorClass = nodeConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200';
    const label = data.label || getNodeLabel(data.type);

    return (
        <div className="relative bg-transparent border-none">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#6b7280',
                    border: '2px solid white',
                    borderRadius: '50%',
                }}
            />

            <Card className={`min-w-[200px] transition-all duration-200 overflow-hidden py-2 gap-0 cursor-pointer ${selected ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm hover:shadow-md'}`} onClick={() => onNodeClick?.(data)}>
                <CardContent className="px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${colorClass}`}>
                                <Icon className="h-3 w-3" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{label}</span>
                                {hasConditionalPaths(data.type) && <span className="text-xs text-muted-foreground">Conditional</span>}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            onClick={e => {
                                e.stopPropagation();
                                onDeleteNode?.();
                            }}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* <div className="flex items-center justify-between">
                        <Badge
                            variant={data.isConfigured ? "default" : "secondary"}
                            className="text-xs"
                        >
                            {data.isConfigured ? 'Configured' : 'Not Configured'}
                        </Badge>

                        {data.config.useAI && (
                            <Badge variant="outline" className="text-xs">
                                AI Enabled
                            </Badge>
                        )}
                    </div> */}
                </CardContent>
            </Card>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#6b7280',
                    border: '2px solid white',
                    borderRadius: '50%',
                }}
            />
        </div>
    );
};
