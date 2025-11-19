import React from 'react';
import { EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { DelayPopover } from './DelayPopover';
import { hasConditionalPaths } from '@/config/workflow-nodes';
import { ActionNodeData } from '@/app/(dashboard)/campaigns/create-campaign/page';

interface DelayEdgeData {
    delay?: string;
    delayData?: {
        delay: number;
        unit: string;
    } | null;
    onDelayUpdate?: (edgeId: string, delayConfig: { delay: number; unit: string }) => void;
    isPositive?: boolean;
    isConditionalPath?: boolean;
}

export default function DelayEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, data, target, source }: EdgeProps) {
    const { setEdges, getNodes, getEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const formatDelayText = () => {
        const delayData = (data as DelayEdgeData)?.delayData || { delay: 15, unit: 'm' };
        if (!delayData) return 'Wait for 15 mins';

        const { delay, unit } = delayData;
        if (delay === 0) return 'No delay';

        const unitMap: { [key: string]: string } = {
            m: delay === 1 ? 'min' : 'mins',
            h: delay === 1 ? 'hour' : 'hours',
            d: delay === 1 ? 'day' : 'days',
        };

        return `Wait for ${delay} ${unitMap[unit] || unit}`;
    };

    const handleDelayUpdate = (delayConfig: { delay: number; unit: string }) => {
        const onDelayUpdate = (data as DelayEdgeData)?.onDelayUpdate;
        if (onDelayUpdate) {
            onDelayUpdate(id, delayConfig);
        }
    };

    // Check if target node is an "add step" node
    const nodes = getNodes();
    const targetNode = nodes.find(node => node.id === target);
    const isTargetAddStepNode = targetNode?.type === 'addStep';

    // Get edge color based on conditional path
    const getEdgeColor = () => {
        const edgeData = data as DelayEdgeData;
        const nodes = getNodes();

        // Check if source node has conditional paths
        const sourceNode = nodes.find(node => node.id === source);
        const isSourceConditional = sourceNode?.type === 'action' && hasConditionalPaths((sourceNode.data as unknown as ActionNodeData).type);

        if (edgeData?.isConditionalPath) {
            return edgeData?.isPositive ? '#22c55e' : '#ef4444'; // green for accepted, red for not-accepted
        }

        // For edges from conditional nodes, use green
        if (isSourceConditional) {
            return '#22c55e'; // green for edges from conditional nodes
        }
        return '#6b7280'; // default gray
    };

    // Get edge style - all edges are dashed
    const getEdgeStyle = () => {
        return 'dashed';
    };

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    stroke: getEdgeColor(),
                    strokeWidth: 2,
                    strokeDasharray: getEdgeStyle() === 'dashed' ? '5,5' : 'none',
                }}
                className="react-flow__edge-path"
                d={edgePath}
            />
            {!isTargetAddStepNode && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan">
                        <DelayPopover currentDelay={(data as DelayEdgeData)?.delayData || { delay: 15, unit: 'm' }} onSave={handleDelayUpdate}>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-6 px-2 py-1 text-xs bg-white border border-gray-300 shadow-sm hover:bg-gray-50 rounded-full"
                                onPointerDown={e => {
                                    e.stopPropagation();
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                }}>
                                {formatDelayText()}
                            </Button>
                        </DelayPopover>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
