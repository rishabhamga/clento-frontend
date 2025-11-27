'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { WorkflowNodeType, getNodeLabel, hasConditionalPaths } from '@/config/workflow-nodes';
import { useAuth } from '@clerk/nextjs';
import { getConnectedEdges, getIncomers, getOutgoers } from '@xyflow/react';
import { Loader2, Settings, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ActionDispatch, useReducer, useState } from 'react';
import { toast } from 'sonner';
import ReactFlowCard from '../../../../components/ui/react-flow';
import { NodeSelectionModal } from '../../../../components/workflow/NodeSelectionModal';
import { ConnectedAccount, useConnectedAccounts } from '../../../../hooks/useConnectedAccounts';
import { useLeadLists } from '../../../../hooks/useLeadLists';
import { CheckNever, makeAuthenticatedRequest } from '../../../../lib/axios-utils';
import { getTimezoneOptionsByRegion, getUserTimezone } from '../../../../lib/timezone-utils';
import { isNodeConfigured, validateWorkflow as validateWorkflowUtil } from '../../../../lib/workflow-validation';
import { LeadList } from '../../../../types/lead-list';
import { Webhook } from '../../integrations/webhooks/page';

// Function to get default configuration for each node type
export const getDefaultConfigForNodeType = (nodeType: WorkflowNodeType): BaseConfig => {
    switch (nodeType) {
        case 'like_post':
            return {
                numberOfPosts: 1,
                recentPostDays: 7,
            };
        case 'comment_post':
            return {
                numberOfPosts: 1,
                recentPostDays: 7,
                configureWithAI: false,
                commentLength: 'medium',
                tone: 'professional',
                language: 'english',
                customGuidelines: '',
            };
        case 'send_connection_request':
            return {
                useAI: false,
                tone: 'moderate',
                formality: 'approachable',
                approach: 'diplomatic',
                focus: 'relational',
                intention: 'networking',
                callToAction: 'confident',
                personalization: 'specific',
                language: 'english',
                engageWithRecentActivity: false,
                customGuidelines: '',
            };
        case 'send_inmail':
        case 'send_followup':
        case 'withdraw_request':
            return {
                smartFollowups: false,
                aiWritingAssistant: false,
                messageLength: 'medium',
                tone: 'professional',
                language: 'english',
                engageWithRecentActivity: false,
                messagePurpose: '',
            };
        case 'webhook':
            return {
                webhookId: undefined,
            };
        default:
            return {};
    }
};

export enum CampaignTabs {
    DETAILS = 'DETAILS',
    FLOW = 'FLOW',
}

export interface CampaignDetailsState {
    name: string;
    description: string;
    senderAccount: string;
    prospectList: string;
    startDate: string | null;
    leadsPerDay: number | null;
    startTime: string | null;
    endTime: string | null;
    timezone: string;
}

export type PathType = 'accepted' | 'not-accepted';

export interface BaseConfig {
    useAI?: boolean;
    // Comment configuration options
    numberOfPosts?: number;
    recentPostDays?: number;
    configureWithAI?: boolean;
    commentLength?: 'short' | 'medium' | 'long';
    tone?: 'professional' | 'friendly' | 'casual' | 'enthusiastic' | 'supportive' | 'cold' | 'moderate' | 'warm';
    language?: 'english' | 'spanish' | 'french' | 'german' | 'portuguese';
    customGuidelines?: string;
    customComment?: string;
    customMessage?: string;
    // Connection request configuration options
    formality?: 'casual' | 'approachable' | 'professional';
    approach?: 'direct' | 'diplomatic' | 'indirect';
    focus?: 'personal' | 'relational' | 'business';
    intention?: 'networking' | 'partnership' | 'collaboration';
    callToAction?: 'strong' | 'confident' | 'subtle';
    personalization?: 'specific' | 'generic';
    engageWithRecentActivity?: boolean;
    // Message configuration options
    smartFollowups?: boolean;
    aiWritingAssistant?: boolean;
    messageLength?: 'short' | 'medium' | 'long';
    messagePurpose?: string;
    webhookId?: string;
}

export type DelayUnit = 's' | 'm' | 'h' | 'd' | 'w';

export interface ActionNodeData {
    type: WorkflowNodeType;
    label: string;
    isConfigured: boolean;
    config: BaseConfig;
    pathType: PathType;
}

export interface AddStepNodeData extends ActionNodeData {
    pathType: PathType;
}

export interface WorkflowNode {
    id: string;
    type: 'action' | 'addStep';
    position: {
        x: number;
        y: number;
    };
    data: ActionNodeData;
    measured: {
        width: number;
        height: number;
    };
    selected?: boolean;
    deletable: boolean;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type: 'buttonedge' | 'conditional' | string;
    animated: boolean;
    selected?: boolean;
    data: {
        delay?: string; // "15m", "1d", etc
        delayData?: {
            delay: number;
            unit: DelayUnit;
        };
        isPositive?: boolean;
        isConditionalPath?: boolean;
    };
    deletable?: boolean;
}

export interface WorkflowData {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export type CampaignDetailsAction = { type: 'SET_FIELD'; field: keyof CampaignDetailsState; value: string | number } | { type: 'RESET' };

const CreateCampaignPage = () => {
    const { data: connectedAccounts, isLoading: isLoadingAccounts } = useConnectedAccounts();
    const router = useRouter();

    const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isAddingStepNode, setIsAddingStepNode] = useState(false);
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const { getToken } = useAuth();

    // Function to export workflow JSON in the exact reference format
    const exportWorkflowJSON = () => {
        if (!workflow) return null;

        const cleanNodes = workflow.nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
            measured: node.measured,
            selected: node.selected || false,
            ...(node.deletable !== undefined && { deletable: node.deletable }),
        }));

        const cleanEdges = workflow.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            animated: edge.animated,
            data: edge.data,
            ...(edge.selected !== undefined && { selected: edge.selected }),
            ...(edge.deletable !== undefined && { deletable: edge.deletable }),
        }));

        return {
            nodes: cleanNodes,
            edges: cleanEdges,
            timestamp: new Date().toISOString(),
        };
    };

    // Function to import workflow from JSON file
    const importWorkflowJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const jsonContent = e.target?.result as string;
                const importedWorkflow = JSON.parse(jsonContent);

                // Validate the imported workflow structure
                if (importedWorkflow.nodes && Array.isArray(importedWorkflow.nodes) && importedWorkflow.edges && Array.isArray(importedWorkflow.edges)) {
                    // Ensure all nodes have default configs if missing
                    const nodesWithDefaults = importedWorkflow.nodes.map((node: any) => {
                        if (node.data && node.data.type && !node.data.config) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    config: getDefaultConfigForNodeType(node.data.type),
                                },
                            };
                        }
                        return node;
                    });

                    setWorkflow({
                        nodes: nodesWithDefaults,
                        edges: importedWorkflow.edges,
                    });

                    toast.success('Workflow imported successfully!');
                } else {
                    toast.error('Invalid workflow file format. Please check the file structure.');
                }
            } catch (error) {
                toast.error('Error importing workflow: Invalid JSON format.');
                console.error('Import error:', error);
            }

            // Reset the file input so the same file can be imported again
            event.target.value = '';
        };
        reader.readAsText(file);
    };

    // Function to download workflow as JSON file
    const downloadWorkflowJSON = () => {
        const cleanJSON = exportWorkflowJSON();
        if (!cleanJSON) return;

        const dataStr = JSON.stringify(cleanJSON, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `workflow-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const verifyDetailPage = (): boolean => {
        type RequiredField = 'name' | 'description' | 'prospectList' | 'senderAccount' | 'leadsPerDay' | 'startTime' | 'endTime' | 'timezone';
        const requiredFields: RequiredField[] = ['name', 'description', 'prospectList', 'senderAccount', 'leadsPerDay', 'startTime', 'endTime', 'timezone'];

        // Helper function to check if a field is empty (including trimmed strings)
        const isFieldEmpty = (field: RequiredField): boolean => {
            const value = detailsState[field];
            if (value === null || value === undefined) return true;

            // For string fields, also check if trimmed value is empty
            if (typeof value === 'string') {
                return value.trim() === '';
            }

            return !value;
        };

        const firstMissingField = requiredFields.find(field => isFieldEmpty(field));

        if (firstMissingField) {
            switch (firstMissingField) {
                case 'name':
                    toast.error('Campaign Name is required');
                    break;
                case 'prospectList':
                    toast.error('Prospect List is required');
                    break;
                case 'senderAccount':
                    toast.error('Sender Account is required');
                    break;
                case 'leadsPerDay':
                    toast.error('Lead Per Day is required');
                    break;
                case 'startTime':
                    toast.error('Start Time is required');
                    break;
                case 'endTime':
                    toast.error('End Time is required');
                    break;
                case 'timezone':
                    toast.error('Timezone is required');
                    break;
                case 'description':
                    toast.error('Description is required');
                    break;
                default:
                    CheckNever(firstMissingField);
            }
            return false;
        }

        return true;
    };

    /**
     * Validates the entire workflow to ensure all nodes are properly configured
     */
    const verifyWorkflow = (): boolean => {
        const validationResult = validateWorkflowUtil(workflow);

        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                toast.error(error);
            });
            return false;
        }

        return true;
    };

    const handleCreateCampaign = async () => {
        if (!verifyDetailPage()) {
            return;
        }
        if (!verifyWorkflow()) {
            return;
        }
        const cleanJSON = exportWorkflowJSON();
        const reqBody = {
            detail: detailsState,
            flow: cleanJSON,
        };
        const token = await getToken();
        if (!token) {
            toast.error('Please login to create a campaign');
            return;
        }
        try {
            setIsCreatingCampaign(true);
            const res = await makeAuthenticatedRequest('POST', '/campaigns/create', reqBody, token);
            toast.success('Campaign created successfully!');
            // Redirect to campaigns page on successful creation
            router.push('/campaigns');
        } catch (error) {
            console.error('Error creating campaign:', error);
        } finally {
            setIsCreatingCampaign(false);
        }
    };

    // Function to delete a node and clean up connected edges intelligently
    const handleDeleteNode = (nodeId: string) => {
        if (!workflow) return;

        // Find the node to delete
        const nodeToDelete = workflow.nodes.find(node => node.id === nodeId);
        if (!nodeToDelete) return;

        // Convert to React Flow format for utility functions
        const reactFlowNodes = workflow.nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data as unknown as Record<string, unknown>,
        }));

        const reactFlowEdges = workflow.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            animated: edge.animated,
            data: edge.data,
        }));

        // Convert the node to delete to React Flow format
        const reactFlowNodeToDelete = {
            id: nodeToDelete.id,
            type: nodeToDelete.type,
            position: nodeToDelete.position,
            data: nodeToDelete.data as unknown as Record<string, unknown>,
        };

        // Use React Flow utilities to find connected nodes and edges
        const incomers = getIncomers(reactFlowNodeToDelete, reactFlowNodes, reactFlowEdges);
        const outgoers = getOutgoers(reactFlowNodeToDelete, reactFlowNodes, reactFlowEdges);
        const connectedEdges = getConnectedEdges([reactFlowNodeToDelete], reactFlowEdges);

        // Remove the node
        const updatedNodes = workflow.nodes.filter(node => node.id !== nodeId);

        // Remove edges connected to the deleted node
        const remainingEdges = workflow.edges.filter(edge => !connectedEdges.some(connectedEdge => connectedEdge.id === edge.id));

        // Create new edges connecting incomers to outgoers
        const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => {
                // Find the original edge to copy its properties
                const originalEdge = workflow.edges.find(edge => edge.source === nodeId && edge.target === target);

                return {
                    id: `e-${source}-${target}`,
                    source,
                    target,
                    type: originalEdge?.type || 'buttonedge',
                    animated: originalEdge?.animated || true,
                    data: {
                        ...originalEdge?.data,
                        delay: originalEdge?.data?.delay || '15m',
                        delayData: originalEdge?.data?.delayData || {
                            delay: 15,
                            unit: 'm',
                        },
                    },
                };
            }),
        );

        // Clean up any truly orphaned AddStep nodes (nodes with no connections at all)
        const allEdgesAfterReconnection = [...remainingEdges, ...createdEdges];

        const orphanedAddStepNodes = updatedNodes.filter(node => {
            if (node.type !== 'addStep') return false;

            // Check if this AddStep node has any connections (incoming or outgoing)
            const hasAnyConnections = allEdgesAfterReconnection.some(edge => edge.source === node.id || edge.target === node.id);

            // Only remove if it has no connections at all (truly orphaned)
            return !hasAnyConnections;
        });

        const finalNodes = updatedNodes.filter(node => !orphanedAddStepNodes.some(addStepNode => addStepNode.id === node.id));

        // Reposition nodes to fill the gap left by the deleted node
        const repositionedNodes = finalNodes.map(node => {
            // If this node is positioned below the deleted node, move it up
            if (node.position.y > nodeToDelete.position.y) {
                const newPosition = {
                    x: node.position.x,
                    y: node.position.y - 200, // Move up by 200px (standard node spacing)
                };
                return {
                    ...node,
                    position: newPosition,
                };
            }
            return node;
        });

        const finalEdges = [...remainingEdges, ...createdEdges];

        setWorkflow({
            nodes: repositionedNodes,
            edges: finalEdges,
        });
    };

    const handleAddFirstNodeClick = () => {
        setIsModalOpen(true);
    };

    const handleAddStepClick = (nodeId: string) => {
        setSelectedNodeId(nodeId);
        setIsAddingStepNode(true);
        setIsModalOpen(true);
    };

    const handleDelayUpdate = (edgeId: string, delayConfig: { delay: number; unit: DelayUnit }) => {
        if (!workflow) return;

        const updatedEdges = workflow.edges.map(edge => {
            if (edge.id === edgeId) {
                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        delay: delayConfig.delay === 0 ? '0' : `${delayConfig.delay}${delayConfig.unit}`,
                        delayData: delayConfig,
                    },
                };
            }
            return edge;
        });

        setWorkflow({
            ...workflow,
            edges: updatedEdges,
        });
    };

    const handleSelectNodeType = (nodeType: WorkflowNodeType) => {
        if (isAddingStepNode && workflow && selectedNodeId) {
            addStepToWorkflow(nodeType);
        } else {
            createFirstNode(nodeType);
        }
    };

    const createFirstNode = (nodeType: WorkflowNodeType) => {
        const timestamp = Date.now();
        const firstNodeId = `${nodeType}-${timestamp}`;

        const defaultConfig = getDefaultConfigForNodeType(nodeType);
        const firstNodeData: ActionNodeData = {
            type: nodeType,
            label: getNodeLabel(nodeType),
            isConfigured: false, // Will be validated below
            config: defaultConfig,
            pathType: 'accepted',
        };

        const firstNode: WorkflowNode = {
            id: firstNodeId,
            type: 'action',
            position: {
                x: 100,
                y: 100,
            },
            data: firstNodeData,
            measured: {
                width: 220,
                height: 54,
            },
            deletable: false,
        };

        // Set isConfigured based on validation
        firstNodeData.isConfigured = isNodeConfigured(firstNode);

        let nodes: WorkflowNode[] = [firstNode];
        let edges: WorkflowEdge[] = [];

        if (hasConditionalPaths(nodeType)) {
            // Create two AddStep nodes for accepted and not-accepted paths
            const acceptedAddStepNodeId = `add-step-accepted-${firstNodeId}`;
            const acceptedAddStepNode: WorkflowNode = {
                id: acceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: 300,
                    y: 150,
                },
                data: {
                    pathType: 'accepted',
                    type: nodeType,
                    label: getNodeLabel(nodeType),
                    isConfigured: true,
                    config: {},
                },
                measured: {
                    width: 220,
                    height: 40,
                },
                deletable: false,
            };

            const notAcceptedAddStepNodeId = `add-step-not-accepted-${firstNodeId}`;
            const notAcceptedAddStepNode: WorkflowNode = {
                id: notAcceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: -100,
                    y: 150,
                },
                data: {
                    pathType: 'not-accepted',
                    type: nodeType,
                    label: getNodeLabel(nodeType),
                    isConfigured: true,
                    config: {},
                },
                measured: {
                    width: 220,
                    height: 40,
                },
                deletable: false,
            };

            nodes = [firstNode, acceptedAddStepNode, notAcceptedAddStepNode];
            edges = [
                {
                    id: `e-${firstNodeId}-accepted`,
                    source: firstNodeId,
                    target: acceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: '15m',
                        delayData: {
                            delay: 15,
                            unit: 'm',
                        },
                        isPositive: true,
                        isConditionalPath: true,
                    },
                } as WorkflowEdge,
                {
                    id: `e-${firstNodeId}-not-accepted`,
                    source: firstNodeId,
                    target: notAcceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: '15m',
                        delayData: {
                            delay: 15,
                            unit: 'm',
                        },
                        isPositive: false,
                        isConditionalPath: true,
                    },
                } as WorkflowEdge,
            ];
        } else {
            // Single path for non-conditional nodes
            const addStepNodeId = `add-step-${firstNodeId}`;
            const addStepNode: WorkflowNode = {
                id: addStepNodeId,
                type: 'addStep',
                position: {
                    x: 100,
                    y: 300,
                },
                data: {
                    pathType: 'accepted',
                    type: nodeType,
                    label: getNodeLabel(nodeType),
                    isConfigured: true,
                    config: {},
                },
                measured: {
                    width: 220,
                    height: 40,
                },
                deletable: false,
            };

            nodes = [firstNode, addStepNode];
            edges = [
                {
                    id: `e0-1`,
                    source: firstNodeId,
                    target: addStepNodeId,
                    type: 'buttonedge',
                    animated: true,
                    data: {
                        delay: '15m',
                        delayData: {
                            delay: 15,
                            unit: 'm',
                        },
                    },
                },
            ];
        }

        setWorkflow({
            nodes,
            edges,
        });
    };

    const addStepToWorkflow = (nodeType: WorkflowNodeType) => {
        if (!workflow || !selectedNodeId) return;

        // Find the clicked AddStepNode
        const clickedAddStepNode = workflow.nodes.find(node => node.id === selectedNodeId);
        if (!clickedAddStepNode) return;

        const clickedPathType = clickedAddStepNode.data.pathType;

        // Remove ONLY the clicked AddStepNode, preserve all other nodes including other AddStep nodes
        const nodesWithoutClickedAddStep = workflow.nodes.filter(node => node.id !== selectedNodeId);
        const edgesWithoutClickedAddStep = workflow.edges.filter(edge => edge.target !== selectedNodeId);

        // Generate new node ID in the reference format
        const timestamp = Date.now();
        const newNodeId = `${nodeType}-${timestamp}`;

        // Create new action node at the position of the clicked AddStep node
        const defaultConfig = getDefaultConfigForNodeType(nodeType);
        const newActionNodeData: ActionNodeData = {
            type: nodeType,
            label: getNodeLabel(nodeType),
            isConfigured: false, // Will be validated below
            config: defaultConfig,
            pathType: clickedPathType,
        };

        const newActionNode: WorkflowNode = {
            id: newNodeId,
            type: 'action',
            position: {
                x: clickedAddStepNode.position.x,
                y: clickedAddStepNode.position.y,
            },
            data: newActionNodeData,
            measured: {
                width: 220,
                height: 54,
            },
            deletable: true,
        };

        // Set isConfigured based on validation
        newActionNodeData.isConfigured = isNodeConfigured(newActionNode);

        // Find the edge that was leading to the clicked AddStepNode
        const sourceEdge = workflow.edges.find(edge => edge.target === selectedNodeId);
        const sourceNodeId = sourceEdge?.source || '1';

        let nodes: WorkflowNode[] = [...nodesWithoutClickedAddStep, newActionNode];
        let edges: WorkflowEdge[] = [
            ...edgesWithoutClickedAddStep,
            // Edge from source to new action node (replace the edge that went to AddStep)
            {
                id: `e-${newNodeId}-${sourceNodeId}`,
                source: sourceNodeId,
                target: newNodeId,
                type: sourceEdge?.data?.isConditionalPath ? 'conditional' : 'buttonedge',
                animated: true,
                data: {
                    delay: sourceEdge?.data?.delay || '15m',
                    delayData: sourceEdge?.data?.delayData || {
                        delay: 15,
                        unit: 'm',
                    },
                    isPositive: sourceEdge?.data?.isPositive,
                    isConditionalPath: sourceEdge?.data?.isConditionalPath,
                },
            } as WorkflowEdge,
        ];

        if (hasConditionalPaths(nodeType)) {
            // Create two AddStep nodes for accepted and not-accepted paths
            const acceptedAddStepNodeId = `add-step-accepted-${newNodeId}`;
            const notAcceptedAddStepNodeId = `add-step-not-accepted-${newNodeId}`;

            const acceptedAddStepNode: WorkflowNode = {
                id: acceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: clickedAddStepNode.position.x + 150,
                    y: clickedAddStepNode.position.y + 220,
                },
                data: {
                    pathType: 'accepted',
                    type: nodeType,
                    label: getNodeLabel(nodeType),
                    isConfigured: true,
                    config: {},
                },
                measured: {
                    width: 220,
                    height: 40,
                },
                deletable: true,
            };

            const notAcceptedAddStepNode: WorkflowNode = {
                id: notAcceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: clickedAddStepNode.position.x - 150,
                    y: clickedAddStepNode.position.y + 220,
                },
                data: {
                    pathType: 'not-accepted',
                    type: nodeType,
                    label: getNodeLabel(nodeType),
                    isConfigured: true,
                    config: {},
                },
                measured: {
                    width: 220,
                    height: 40,
                },
                deletable: true,
            };

            nodes.push(acceptedAddStepNode, notAcceptedAddStepNode);
            edges.push(
                {
                    id: `e-${acceptedAddStepNodeId}-${newNodeId}`,
                    source: newNodeId,
                    target: acceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: '15m',
                        delayData: {
                            delay: 15,
                            unit: 'm',
                        },
                        isPositive: true,
                        isConditionalPath: true,
                    },
                } as WorkflowEdge,
                {
                    id: `e-${notAcceptedAddStepNodeId}-${newNodeId}`,
                    source: newNodeId,
                    target: notAcceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: '15m',
                        delayData: {
                            delay: 15,
                            unit: 'm',
                        },
                        isPositive: false,
                        isConditionalPath: true,
                    },
                } as WorkflowEdge,
            );
        } else {
            // Single path for non-conditional nodes - continue the same path type
            const newAddStepNodeId = `add-step-${clickedPathType}-${newNodeId}`;
            const newAddStepNode: WorkflowNode = {
                id: newAddStepNodeId,
                type: 'addStep',
                position: {
                    x: clickedAddStepNode.position.x,
                    y: clickedAddStepNode.position.y + 200,
                },
                data: {
                    pathType: clickedPathType, // Maintain the same path type (accepted or not-accepted)
                    type: nodeType,
                    label: getNodeLabel(nodeType),
                    isConfigured: true,
                    config: {},
                },
                measured: {
                    width: 220,
                    height: 40,
                },
                deletable: true,
            };

            nodes.push(newAddStepNode);
            edges.push({
                id: `e-${newAddStepNodeId}-${newNodeId}`,
                source: newNodeId,
                target: newAddStepNodeId,
                type: sourceEdge?.data?.isConditionalPath ? 'conditional' : 'buttonedge',
                animated: true,
                data: {
                    delay: '15m',
                    delayData: {
                        delay: 15,
                        unit: 'm',
                    },
                    isPositive: sourceEdge?.data?.isPositive,
                    isConditionalPath: sourceEdge?.data?.isConditionalPath,
                },
            } as WorkflowEdge);
        }

        setWorkflow({
            nodes,
            edges,
        });

        setIsAddingStepNode(false);
        setSelectedNodeId(null);
    };

    const { data: leadLists, isLoading: isLoadingLeadLists } = useLeadLists();
    const [tab, setTab] = useState<CampaignTabs>(CampaignTabs.DETAILS);

    const initialDetailsState: CampaignDetailsState = {
        name: '',
        description: '',
        senderAccount: '',
        prospectList: '',
        startDate: null,
        leadsPerDay: null,
        startTime: null,
        endTime: null,
        timezone: getUserTimezone(),
    };

    function campaignDetailsReducer(state: CampaignDetailsState, action: CampaignDetailsAction): CampaignDetailsState {
        switch (action.type) {
            case 'SET_FIELD':
                return {
                    ...state,
                    [action.field]: action.value,
                };
            case 'RESET':
                return initialDetailsState;
            default:
                return state;
        }
    }

    const [detailsState, dispatchDetails] = useReducer(campaignDetailsReducer, initialDetailsState);

    const tabs = [
        {
            id: CampaignTabs.DETAILS,
            label: 'Details',
            icon: Settings,
            description: 'Basic campaign information',
        },
        {
            id: CampaignTabs.FLOW,
            label: 'Flow',
            icon: Workflow,
            description: 'Campaign workflow and steps',
        },
    ];

    return (
        <div className="container mx-auto py-5 space-y-4">
            {/* Tabs */}
            <div className="border-b">
                <div className="flex row items-center justify-between">
                    <nav className="flex space-x-6">
                        {tabs.map(tabItem => {
                            const Icon = tabItem.icon;
                            return (
                                <button key={tabItem.id} onClick={() => setTab(tabItem.id)} className={`flex items-center space-x-1.5 py-3 px-1 border-b-2 font-medium text-xs transition-colors ${tab === tabItem.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    <Icon className="h-3.5 w-3.5" />
                                    <span>{tabItem.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <Button className="bg-gradient-purple hover-glow-purple text-sm" onClick={handleCreateCampaign} disabled={isCreatingCampaign}>
                        {isCreatingCampaign ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                        Create Campaign
                    </Button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-5">
                {tab === CampaignTabs.DETAILS &&
                    renderDetailsTab({
                        state: detailsState,
                        setState: dispatchDetails,
                        connectedAccounts,
                        isLoadingAccounts,
                        leadLists,
                        isLoadingLeadLists,
                    })}
                {tab === CampaignTabs.FLOW &&
                    renderFlowTab({
                        workflow,
                        setWorkflow,
                        onAddFirstNode: handleAddFirstNodeClick,
                        onAddStepClick: handleAddStepClick,
                        onDelayUpdate: handleDelayUpdate,
                        onExportJSON: downloadWorkflowJSON,
                        onImportJSON: importWorkflowJSON,
                        onDeleteNode: handleDeleteNode,
                        onResetWorkflow: () => setWorkflow(null),
                    })}
            </div>

            <NodeSelectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsAddingStepNode(false);
                    setSelectedNodeId(null);
                }}
                onSelectNodeType={handleSelectNodeType}
                currentWorkflowTypes={workflow?.nodes.filter(n => n.type === 'action').map(n => (n.data as ActionNodeData).type) || []}
            />
        </div>
    );
};

export default CreateCampaignPage;

const renderDetailsTab = ({
    state,
    setState,
    connectedAccounts,
    isLoadingAccounts,
    leadLists,
    isLoadingLeadLists,
}: {
    state: CampaignDetailsState;
    setState: ActionDispatch<[action: CampaignDetailsAction]>;
    connectedAccounts?: { data: ConnectedAccount[] };
    isLoadingAccounts: boolean;
    leadLists?: {
        data: LeadList[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        message: string;
    };
    isLoadingLeadLists: boolean;
}) => (
    <div className="space-y-4">
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Campaign Information</CardTitle>
                <CardDescription className="text-sm">Set up the basic details for your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">Campaign Name</Label>
                        <Input id="campaign-name" value={state.name} onChange={e => setState({ type: 'SET_FIELD', field: 'name', value: e.target.value })} placeholder="Enter campaign name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={state.description} onChange={e => setState({ type: 'SET_FIELD', field: 'description', value: e.target.value })} placeholder="Campaign description" />
                    </div>
                </div>
                <div className="space-y-2 w-80">
                    <Label htmlFor="sender-account">Sender Account</Label>
                    <Select value={state.senderAccount} onValueChange={value => setState({ type: 'SET_FIELD', field: 'senderAccount', value })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingAccounts ? (
                                <SelectItem value="loading" disabled>
                                    Loading accounts...
                                </SelectItem>
                            ) : connectedAccounts?.data && connectedAccounts.data.length > 0 ? (
                                connectedAccounts.data.map((account: ConnectedAccount) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.display_name} ({account.provider})
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-accounts" disabled>
                                    No accounts connected
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="prospect-list">Prospect List</Label>
                    <Select value={state.prospectList} onValueChange={value => setState({ type: 'SET_FIELD', field: 'prospectList', value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select prospect list" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingLeadLists ? (
                                <SelectItem value="loading" disabled>
                                    Loading lead lists...
                                </SelectItem>
                            ) : leadLists?.data && leadLists.data.length > 0 ? (
                                leadLists.data.map((list: LeadList) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        {list.name} ({list.total_leads} leads)
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-lists" disabled>
                                    No lead lists available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date (Optional)</Label>
                        <DatePicker id="start-date" value={state.startDate || ''} onChange={date => setState({ type: 'SET_FIELD', field: 'startDate', value: date?.toISOString() || '' })} />
                        <p className="text-sm text-muted-foreground">If not provided, the campaign will start immediately</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-date">Leads Per Day</Label>
                        <Input type="number" placeholder="Leads Per Day" onChange={e => setState({ type: 'SET_FIELD', field: 'leadsPerDay', value: e.target.value })} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <TimePicker
                            id="start-time"
                            value={state.startTime || ''}
                            onChange={time =>
                                setState({
                                    type: 'SET_FIELD',
                                    field: 'startTime',
                                    value: time || '',
                                })
                            }
                            placeholder="Select start time"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <TimePicker
                            id="end-time"
                            value={state.endTime || ''}
                            onChange={time =>
                                setState({
                                    type: 'SET_FIELD',
                                    field: 'endTime',
                                    value: time || '',
                                })
                            }
                            placeholder="Select end time"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={state.timezone} onValueChange={value => setState({ type: 'SET_FIELD', field: 'timezone', value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {Object.entries(getTimezoneOptionsByRegion()).map(([region, timezones]) => (
                                <div key={region}>
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{region}</div>
                                    {timezones.map(timezone => (
                                        <SelectItem key={timezone.value} value={timezone.value}>
                                            {timezone.label}
                                        </SelectItem>
                                    ))}
                                </div>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    </div>
);

const renderFlowTab = ({ workflow, setWorkflow, onAddFirstNode, onAddStepClick, onDelayUpdate, onExportJSON, onImportJSON, onDeleteNode, onResetWorkflow }: { workflow: WorkflowData | null; setWorkflow: (workflow: WorkflowData) => void; onAddFirstNode: () => void; onAddStepClick: (nodeId: string) => void; onDelayUpdate: (edgeId: string, delayConfig: { delay: number; unit: DelayUnit }) => void; onExportJSON: () => void; onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void; onDeleteNode: (nodeId: string) => void; onResetWorkflow: () => void }) => {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent>
                    {workflow ? (
                        <div className="relative">
                            {/* Hidden file input for import */}
                            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" id="import-workflow" />

                            {/* Floating action buttons over React Flow */}
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <Button variant="outline" size="sm" onClick={onResetWorkflow} className="bg-white shadow-md hover:shadow-lg">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">↻</span>
                                        Reset
                                    </div>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => document.getElementById('import-workflow')?.click()} className="bg-white shadow-md hover:shadow-lg">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">↓</span>
                                        Import
                                    </div>
                                </Button>
                                <Button variant="outline" size="sm" onClick={onExportJSON} className="bg-white shadow-md hover:shadow-lg">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">↑</span>
                                        Export
                                    </div>
                                </Button>
                            </div>

                            <ReactFlowCard workflow={workflow} setWorkflow={setWorkflow} onAddStepClick={onAddStepClick} onDelayUpdate={onDelayUpdate} onDeleteNode={onDeleteNode} />
                        </div>
                    ) : (
                        <div className="relative w-full" style={{ height: '70vh' }}>
                            {/* Hidden file input for import */}
                            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" id="import-workflow-empty" />

                            {/* Background with dotted pattern */}
                            <div
                                className="absolute inset-0 bg-gray-50 rounded-2xl"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                }}></div>

                            {/* Main content */}
                            <div className="relative flex flex-col items-center justify-center h-full space-y-4">
                                {/* Main action buttons */}
                                <div className="flex flex-col items-center space-y-4">
                                    <Button onClick={onAddFirstNode} variant="outline" className="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 bg-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-400 rounded-sm flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">+</span>
                                            </div>
                                            Add First Step
                                        </div>
                                    </Button>

                                    <div className="text-sm text-gray-500">OR</div>

                                    <Button variant="outline" className="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 bg-white" disabled>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-200 rounded-sm flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">📄</span>
                                            </div>
                                            Choose a Flow Template
                                        </div>
                                    </Button>

                                    <div className="text-sm text-gray-500">OR</div>

                                    <Button variant="outline" className="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 bg-white" onClick={() => document.getElementById('import-workflow-empty')?.click()}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-200 rounded-sm flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">📥</span>
                                            </div>
                                            Import flow
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
