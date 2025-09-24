import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddStepNodeData, ActionNodeData } from '@/app/(dashboard)/campaigns/create-campaign/page';
import { hasConditionalPaths } from '@/config/workflow-nodes';

interface AddStepNodeProps {
    data: AddStepNodeData;
    selected?: boolean;
    onAddStep?: (pathType: AddStepNodeData['pathType']) => void;
    onNodeClick?: (nodeId: string) => void;
    nodeId?: string;
}

export const AddStepNode = ({ data, selected, onAddStep, onNodeClick, nodeId }: AddStepNodeProps) => {
    const { getNodes, getEdges } = useReactFlow();

    const handleAddStep = () => {
        if (nodeId && onNodeClick) {
            onNodeClick(nodeId);
        } else {
            onAddStep?.(data.pathType);
        }
    };

    const getPathLabel = () => {
        switch (data.pathType) {
            case 'accepted':
                return 'Accepted';
            case 'not-accepted':
                return 'Not Accepted';
            default:
                return '';
        }
    };

    const getPathColor = () => {
        switch (data.pathType) {
            case 'accepted':
                return 'border-green-300 hover:border-green-500 text-green-700';
            case 'not-accepted':
                return 'border-red-300 hover:border-red-500 text-red-700';
            default:
                return 'border-gray-300 hover:border-gray-500';
        }
    };

    // Check if the parent node (source of incoming edge) is conditional
    const shouldShowPathLabel = () => {
        if (!nodeId) return false;

        const edges = getEdges();
        const nodes = getNodes();

        // Find the edge that leads to this AddStep node
        const incomingEdge = edges.find(edge => edge.target === nodeId);
        if (!incomingEdge) return false;

        // Find the source node (parent)
        const parentNode = nodes.find(node => node.id === incomingEdge.source);
        if (!parentNode || parentNode.type !== 'action') return false;

        // Check if parent node has conditional paths
        const parentNodeData = parentNode.data as unknown as ActionNodeData;
        return hasConditionalPaths(parentNodeData.type);
    };

    return (
        <div className="relative bg-transparent border-none flex flex-col items-center justify-center">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#6b7280',
                    border: '2px solid white',
                    borderRadius: '50%'
                }}
            />

            {/* Path label - only show when parent node is conditional */}
            {shouldShowPathLabel() && (data.pathType === 'accepted' || data.pathType === 'not-accepted') && (
                <div className={`text-xs font-medium mb-1 px-2 py-1 rounded ${
                    data.pathType === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {getPathLabel()}
                </div>
            )}

            <div className='flex items-center justify-center w-40'>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    className={`flex items-center gap-2 border-dashed border-2 hover:border-solid transition-all w-full ${getPathColor()}`}
                >
                    <Plus className="h-4 w-4" />
                    Add Step
                </Button>
            </div>
        </div>
    );
};
