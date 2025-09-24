import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, ConnectionLineType, Edge, EdgeChange, Node, NodeChange, ReactFlow, NodeTypes, EdgeTypes, EdgeLabelRenderer, getIncomers, getOutgoers, getConnectedEdges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { WorkflowData, WorkflowEdge, WorkflowNode, ActionNodeData, AddStepNodeData } from '../../app/(dashboard)/campaigns/create-campaign/page';
import { ActionNode } from '../workflow/ActionNode';
import { AddStepNode } from '../workflow/AddStepNode';
import DelayEdge from '../workflow/DelayEdge';
import { NodeConfigurationDrawer } from '../workflow/NodeConfigurationDrawer';
import { BaseConfig } from '../../app/(dashboard)/campaigns/create-campaign/page';

// Convert WorkflowNode to React Flow Node
const convertWorkflowNodeToReactFlowNode = (workflowNode: WorkflowNode): Node => ({
    id: workflowNode.id,
    type: workflowNode.type,
    position: workflowNode.position,
    data: workflowNode.data as unknown as Record<string, unknown>,
    selected: workflowNode.selected,
    draggable: false,
    deletable: workflowNode.deletable,
    // Provide default dimensions but let nodes expand as needed
    width: workflowNode.measured?.width || 200,
    height: workflowNode.measured?.height || 100,
});

// Convert WorkflowEdge to React Flow Edge
const convertWorkflowEdgeToReactFlowEdge = (workflowEdge: WorkflowEdge, onDelayUpdate?: (edgeId: string, delayConfig: { delay: number; unit: string }) => void): Edge => ({
    id: workflowEdge.id,
    source: workflowEdge.source,
    target: workflowEdge.target,
    type: 'delay',
    animated: workflowEdge.animated,
    selected: workflowEdge.selected,
    deletable: workflowEdge.deletable,
    data: {
        ...workflowEdge.data,
        onDelayUpdate
    }
});

// Convert React Flow Node back to WorkflowNode
const convertReactFlowNodeToWorkflowNode = (reactFlowNode: Node): WorkflowNode => ({
    id: reactFlowNode.id,
    type: reactFlowNode.type as 'action' | 'addStep',
    position: reactFlowNode.position,
    data: reactFlowNode.data as unknown as ActionNodeData | AddStepNodeData,
    selected: reactFlowNode.selected,
    measured: {
        width: reactFlowNode.measured?.width || reactFlowNode.width || 200,
        height: reactFlowNode.measured?.height || reactFlowNode.height || 100,
    },
    deletable: reactFlowNode.deletable ?? false,
});

// Convert React Flow Edge back to WorkflowEdge
const convertReactFlowEdgeToWorkflowEdge = (reactFlowEdge: Edge): WorkflowEdge => ({
    id: reactFlowEdge.id,
    source: reactFlowEdge.source,
    target: reactFlowEdge.target,
    type: reactFlowEdge.type || 'default',
    animated: reactFlowEdge.animated || false,
    selected: reactFlowEdge.selected,
    data: (reactFlowEdge.data as WorkflowEdge['data']) || {
        delayData: null,
    },
    deletable: reactFlowEdge.deletable ?? false,
});

const ReactFlowCard = ({
    workflow,
    setWorkflow,
    onAddStepClick,
    onDelayUpdate,
    onNodeClick,
    onDeleteNode
}: {
    workflow: WorkflowData,
    setWorkflow: (workflow: WorkflowData) => void,
    onAddStepClick?: (nodeId: string) => void,
    onDelayUpdate?: (edgeId: string, delayConfig: { delay: number; unit: string }) => void,
    onNodeClick?: (nodeData: ActionNodeData) => void,
    onDeleteNode?: (nodeId: string) => void
}) => {

    const [nodes, setNodes] = useState<Node[]>(
        workflow.nodes.map(convertWorkflowNodeToReactFlowNode)
    );
    const [edges, setEdges] = useState<Edge[]>(
        workflow.edges.map(edge => convertWorkflowEdgeToReactFlowEdge(edge, onDelayUpdate))
    );

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState<ActionNodeData | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Handle node click to open drawer
    const handleNodeClick = (nodeData: ActionNodeData) => {
        setSelectedNodeData(nodeData);
        setIsDrawerOpen(true);
        // Also call the parent's onNodeClick if provided
        onNodeClick?.(nodeData);
    };

    // Handle configuration changes
    const handleConfigChange = (nodeId: string, config: BaseConfig) => {
        setNodes((currentNodes) =>
            currentNodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: config
                        }
                    };
                }
                return node;
            })
        );

        // Also update the parent workflow
        const updatedWorkflowNodes = workflow.nodes.map((workflowNode) => {
            if (workflowNode.id === nodeId) {
                return {
                    ...workflowNode,
                    data: {
                        ...workflowNode.data,
                        config: config
                    }
                };
            }
            return workflowNode;
        });

        setWorkflow({
            ...workflow,
            nodes: updatedWorkflowNodes
        });
    };

    const nodeTypes = useMemo<NodeTypes>(() => ({
        action: (props) => (
            <ActionNode
                data={props.data as ActionNodeData}
                selected={props.selected}
                onNodeClick={(nodeData) => {
                    setSelectedNodeId(props.id);
                    handleNodeClick(nodeData);
                }}
                onDeleteNode={() => onDeleteNode?.(props.id)}
            />
        ),
        addStep: (props) => (
            <AddStepNode
                data={props.data as AddStepNodeData}
                selected={props.selected}
                nodeId={props.id}
                onNodeClick={onAddStepClick}
            />
        ),
    }), [onAddStepClick, handleNodeClick]);

    const edgeTypes = useMemo<EdgeTypes>(() => ({
        delay: DelayEdge,
        conditional: DelayEdge,
        buttonedge: DelayEdge,
    }), []);

    // Track if we're updating from parent to prevent infinite loops
    const isUpdatingFromParent = useRef(false);

    useEffect(() => {
        isUpdatingFromParent.current = true;
        setNodes(workflow.nodes.map(convertWorkflowNodeToReactFlowNode));
        setEdges(workflow.edges.map(edge => convertWorkflowEdgeToReactFlowEdge(edge, onDelayUpdate)));
        // Reset flag after state updates
        setTimeout(() => {
            isUpdatingFromParent.current = false;
        }, 0);
    }, [workflow, onDelayUpdate]);

    // Debug: Log workflow changes
    useEffect(() => {
        console.log('🔄 Workflow changed:', workflow);
    }, [workflow]);

    // Update parent workflow state when local nodes/edges change (but not when updating from parent)
    // Only update for structural changes, not selection changes
    const prevNodesRef = useRef<Node[]>([]);
    const prevEdgesRef = useRef<Edge[]>([]);

    useEffect(() => {
        if (!isUpdatingFromParent.current) {
            // Check if this is just a selection change by comparing structural properties
            const structuralNodeChange = nodes.length !== prevNodesRef.current.length ||
                nodes.some((node, index) => {
                    const prevNode = prevNodesRef.current[index];
                    return !prevNode ||
                           node.id !== prevNode.id ||
                           node.type !== prevNode.type ||
                           node.position.x !== prevNode.position.x ||
                           node.position.y !== prevNode.position.y;
                });

            const structuralEdgeChange = edges.length !== prevEdgesRef.current.length ||
                edges.some((edge, index) => {
                    const prevEdge = prevEdgesRef.current[index];
                    return !prevEdge ||
                           edge.id !== prevEdge.id ||
                           edge.source !== prevEdge.source ||
                           edge.target !== prevEdge.target;
                });

            // Only update parent if there are structural changes, not just selection changes
            if (structuralNodeChange || structuralEdgeChange) {
                const workflowNodes = nodes.map(convertReactFlowNodeToWorkflowNode);
                const workflowEdges = edges.map(convertReactFlowEdgeToWorkflowEdge);
                setWorkflow({ nodes: workflowNodes, edges: workflowEdges });
            }

            // Update refs for next comparison
            prevNodesRef.current = [...nodes];
            prevEdgesRef.current = [...edges];
        }
    }, [nodes, edges, setWorkflow]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
        },
        [],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
        },
        [],
    );

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
        },
        [],
    );

    const onNodesDelete = useCallback(
        (deleted: Node[]) => {
            let remainingNodes = [...nodes];
            setEdges(
                deleted.reduce((acc, node) => {
                    // Skip reconnection for non-deletable nodes or AddStepNodes
                    if (!node.deletable || node.type === 'addStep') {
                        return acc;
                    }

                    const incomers = getIncomers(node, remainingNodes, acc);
                    const outgoers = getOutgoers(node, remainingNodes, acc);
                    const connectedEdges = getConnectedEdges([node], acc);

                    const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

                    // Create new edges connecting incomers to outgoers
                    const createdEdges = incomers.flatMap((incomer) =>
                        outgoers.map((outgoer) => ({
                            id: `${incomer.id}-${outgoer.id}-reconnect`,
                            source: incomer.id,
                            target: outgoer.id,
                            type: 'conditional',
                            animated: true,
                            selected: false,
                            deletable: true,
                            data: {
                                delay: '0',
                                delayData: { delay: 0, unit: 'm' }
                            }
                        }))
                    );

                    remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

                    return [...remainingEdges, ...createdEdges];
                }, edges),
            );
        },
        [nodes, edges],
    );

    return (
        <div style={{ width: '100%', height: '70vh' }} className="relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onNodesDelete={onNodesDelete}
                connectionLineType={ConnectionLineType.SmoothStep}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodesDraggable={false}
                nodesConnectable={true}
                nodesFocusable={true}
                edgesFocusable={true}
                elementsSelectable={true}
                className='border rounded-lg'
                style={{
                    borderRadius: '0.5rem'
                }}
            >
                <Background color="skyblue" variant={BackgroundVariant.Dots} />
            </ReactFlow>
            {selectedNodeId && (
                <NodeConfigurationDrawer
                    nodeId={selectedNodeId}
                    isOpen={isDrawerOpen}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setSelectedNodeData(null);
                        setSelectedNodeId(null);
                    }}
                    nodeData={selectedNodeData}
                    onConfigChange={handleConfigChange}
                />
            )}
        </div>
    )
}
export default ReactFlowCard