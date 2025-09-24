"use client"

import { Button } from "@/components/ui/button";
import { WorkflowNodeType, getNodeLabel, hasConditionalPaths } from "@/config/workflow-nodes";

// Function to get default configuration for each node type
const getDefaultConfigForNodeType = (nodeType: WorkflowNodeType): BaseConfig => {
    switch (nodeType) {
        case "like_post":
            return {
                numberOfPosts: 1,
                recentPostDays: 7
            };
        case "comment_post":
            return {
                numberOfPosts: 1,
                recentPostDays: 7,
                configureWithAI: false,
                commentLength: 'medium',
                tone: 'professional',
                language: 'english',
                customGuidelines: ''
            };
        case "send_connection_request":
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
                customGuidelines: ''
            };
        case "send_inmail":
        case "send_followup":
        case "send_invite":
        case "withdraw_request":
            return {
                smartFollowups: false,
                aiWritingAssistant: false,
                messageLength: 'medium',
                tone: 'professional',
                language: 'english',
                engageWithRecentActivity: false,
                messagePurpose: ''
            };
        default:
            return {};
    }
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Settings, Workflow } from "lucide-react";
import { ActionDispatch, useEffect, useReducer, useState } from "react";
import { useConnectedAccounts, ConnectedAccount } from "../../../../hooks/useConnectedAccounts";
import { useLeadLists } from "../../../../hooks/useLeadLists";
import { LeadList } from "../../../../types/lead-list";
import { getTimezoneOptionsByRegion, getUserTimezone } from "../../../../lib/timezone-utils";
import ReactFlowCard from "../../../../components/ui/react-flow";
import { NodeSelectionModal } from "../../../../components/workflow/NodeSelectionModal";

enum CampaignTabs {
    DETAILS = 'DETAILS',
    FLOW = 'FLOW'
}

interface CampaignDetailsState {
    name: string
    description: string
    senderAccount: string
    prospectList: string
    startDate: string | null
    endDate: string | null
    startTime: string | null
    endTime: string | null
    timezone: string
}

export type PathType = "accepted" | "not-accepted";

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
}

export interface ActionNodeData {
    type: WorkflowNodeType;
    label: string;
    isConfigured: boolean;
    config: BaseConfig;
    pathType?: PathType;
}

export interface AddStepNodeData {
    pathType: PathType;
}

export interface WorkflowNode {
    id: string;
    type: "action" | "addStep";
    position: {
        x: number;
        y: number;
    };
    data: ActionNodeData | AddStepNodeData;
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
    type: "buttonedge" | "conditional" | string;
    animated: boolean;
    selected?: boolean;
    data: {
        delay?: string; // "15m", "1d", etc
        delayData?: {
            delay: number;
            unit: "m" | "d" | string;
        };
        isPositive?: boolean;
        isConditionalPath?: boolean;
    };
    deletable?: boolean;
}


export interface WorkflowData {
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
}

type CampaignDetailsAction =
    | { type: 'SET_FIELD'; field: keyof CampaignDetailsState; value: string }
    | { type: 'RESET' }

const CreateCampaignPage = () => {
    const { data: connectedAccounts, isLoading: isLoadingAccounts } = useConnectedAccounts()

    const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [isAddingStepNode, setIsAddingStepNode] = useState(false)

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
            ...(node.deletable !== undefined && { deletable: node.deletable })
        }));

        const cleanEdges = workflow.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            animated: edge.animated,
            data: edge.data,
            ...(edge.selected !== undefined && { selected: edge.selected }),
            ...(edge.deletable !== undefined && { deletable: edge.deletable })
        }));

        return {
            nodes: cleanNodes,
            edges: cleanEdges,
            timestamp: new Date().toISOString()
        };
    };

    const handleAddFirstNodeClick = () => {
        setIsModalOpen(true)
    }

    const handleAddStepClick = (nodeId: string) => {
        setSelectedNodeId(nodeId)
        setIsAddingStepNode(true)
        setIsModalOpen(true)
    }

    const handleDelayUpdate = (edgeId: string, delayConfig: { delay: number; unit: string }) => {
        if (!workflow) return

        const updatedEdges = workflow.edges.map(edge => {
            if (edge.id === edgeId) {
                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        delay: delayConfig.delay === 0 ? '0' : `${delayConfig.delay}${delayConfig.unit}`,
                        delayData: delayConfig
                    }
                }
            }
            return edge
        })

        setWorkflow({
            ...workflow,
            edges: updatedEdges
        })
    }


    const handleSelectNodeType = (nodeType: WorkflowNodeType) => {
        if (isAddingStepNode && workflow && selectedNodeId) {
            addStepToWorkflow(nodeType)
        } else {
            createFirstNode(nodeType)
        }
    }

    const createFirstNode = (nodeType: WorkflowNodeType) => {
        const timestamp = Date.now()
        const firstNodeId = `${nodeType}-${timestamp}`

        const firstNode: WorkflowNode = {
            id: firstNodeId,
                type: 'action',
                position: {
                x: 100,
                y: 0
                },
                data: {
                    type: nodeType,
                label: getNodeLabel(nodeType),
                isConfigured: true,
                    config: {}
                } as ActionNodeData,
                measured: {
                width: 220,
                height: 54
            },
            deletable: false
        }

        let nodes: WorkflowNode[] = [firstNode]
        let edges: WorkflowEdge[] = []

        if (hasConditionalPaths(nodeType)) {
            // Create two AddStep nodes for accepted and not-accepted paths
            const acceptedAddStepNodeId = `add-step-accepted-${firstNodeId}`
            const acceptedAddStepNode: WorkflowNode = {
                id: acceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: 300,
                    y: 150
                },
                data: {
                    pathType: 'accepted'
                },
                measured: {
                    width: 220,
                    height: 40
                },
                deletable: false
            }

            const notAcceptedAddStepNodeId = `add-step-not-accepted-${firstNodeId}`
            const notAcceptedAddStepNode: WorkflowNode = {
                id: notAcceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: -100,
                    y: 150
                },
                data: {
                    pathType: 'not-accepted'
                },
                measured: {
                    width: 220,
                    height: 40
                },
                deletable: false
            }

            nodes = [firstNode, acceptedAddStepNode, notAcceptedAddStepNode]
            edges = [
                {
                    id: `e-${firstNodeId}-accepted`,
                    source: firstNodeId,
                    target: acceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: "15m",
                        delayData: {
                            delay: 15,
                            unit: "m"
                        },
                        isPositive: true,
                        isConditionalPath: true
                    }
                } as WorkflowEdge,
                {
                    id: `e-${firstNodeId}-not-accepted`,
                    source: firstNodeId,
                    target: notAcceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: "15m",
                        delayData: {
                            delay: 15,
                            unit: "m"
                        },
                        isPositive: false,
                        isConditionalPath: true
                    }
                } as WorkflowEdge
            ]
        } else {
            // Single path for non-conditional nodes
            const addStepNodeId = `add-step-${firstNodeId}`
            const addStepNode: WorkflowNode = {
                id: addStepNodeId,
                type: 'addStep',
                position: {
                    x: 100,
                    y: 150
                },
                data: {
                    pathType: 'accepted'
                },
                measured: {
                    width: 220,
                    height: 40
                },
                deletable: false
            }

            nodes = [firstNode, addStepNode]
            edges = [{
                    id: `e0-1`,
                    source: firstNodeId,
                    target: addStepNodeId,
                    type: 'buttonedge',
                    animated: true,
                    data: {
                        delay: "15m",
                        delayData: {
                            delay: 15,
                            unit: "m"
                        }
                    }
                }]
        }

        setWorkflow({
            nodes,
            edges
        })
    }

    const addStepToWorkflow = (nodeType: WorkflowNodeType) => {
        if (!workflow || !selectedNodeId) return

        // Find the clicked AddStepNode
        const clickedAddStepNode = workflow.nodes.find(node => node.id === selectedNodeId)
        if (!clickedAddStepNode) return

        const clickedPathType = (clickedAddStepNode.data as AddStepNodeData).pathType

        // Remove ONLY the clicked AddStepNode, preserve all other nodes including other AddStep nodes
        const nodesWithoutClickedAddStep = workflow.nodes.filter(node => node.id !== selectedNodeId)
        const edgesWithoutClickedAddStep = workflow.edges.filter(edge => edge.target !== selectedNodeId)

        // Generate new node ID in the reference format
        const timestamp = Date.now()
        const newNodeId = `${nodeType}-${timestamp}`

        // Create new action node at the position of the clicked AddStep node
        const newActionNode: WorkflowNode = {
            id: newNodeId,
            type: 'action',
            position: {
                x: clickedAddStepNode.position.x,
                y: clickedAddStepNode.position.y
            },
            data: {
                type: nodeType,
                label: getNodeLabel(nodeType),
                isConfigured: true,
                config: getDefaultConfigForNodeType(nodeType),
                pathType: clickedPathType
            } as ActionNodeData,
            measured: {
                width: 220,
                height: 54
            },
            deletable: true
        }

        // Find the edge that was leading to the clicked AddStepNode
        const sourceEdge = workflow.edges.find(edge => edge.target === selectedNodeId)
        const sourceNodeId = sourceEdge?.source || '1'

        let nodes: WorkflowNode[] = [...nodesWithoutClickedAddStep, newActionNode]
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
                    delay: sourceEdge?.data?.delay || "15m",
                    delayData: sourceEdge?.data?.delayData || {
                        delay: 15,
                        unit: "m"
                    },
                    isPositive: sourceEdge?.data?.isPositive,
                    isConditionalPath: sourceEdge?.data?.isConditionalPath
                }
            } as WorkflowEdge
        ]

        if (hasConditionalPaths(nodeType)) {
            // Create two AddStep nodes for accepted and not-accepted paths
            const acceptedAddStepNodeId = `add-step-accepted-${newNodeId}`
            const notAcceptedAddStepNodeId = `add-step-not-accepted-${newNodeId}`

            const acceptedAddStepNode: WorkflowNode = {
                id: acceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: clickedAddStepNode.position.x + 150,
                    y: clickedAddStepNode.position.y + 220
                },
                data: {
                    pathType: 'accepted'
                },
                measured: {
                    width: 220,
                    height: 40
                },
                deletable: true
            }

            const notAcceptedAddStepNode: WorkflowNode = {
                id: notAcceptedAddStepNodeId,
                type: 'addStep',
                position: {
                    x: clickedAddStepNode.position.x - 150,
                    y: clickedAddStepNode.position.y + 220
                },
                data: {
                    pathType: 'not-accepted'
                },
                measured: {
                    width: 220,
                    height: 40
                },
                deletable: true
            }

            nodes.push(acceptedAddStepNode, notAcceptedAddStepNode)
            edges.push(
                {
                    id: `e-${acceptedAddStepNodeId}-${newNodeId}`,
                    source: newNodeId,
                    target: acceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: "15m",
                        delayData: {
                            delay: 15,
                            unit: "m"
                        },
                        isPositive: true,
                        isConditionalPath: true
                    }
                } as WorkflowEdge,
                {
                    id: `e-${notAcceptedAddStepNodeId}-${newNodeId}`,
                    source: newNodeId,
                    target: notAcceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    data: {
                        delay: "15m",
                        delayData: {
                            delay: 15,
                            unit: "m"
                        },
                        isPositive: false,
                        isConditionalPath: true
                    }
                } as WorkflowEdge
            )
        } else {
            // Single path for non-conditional nodes - continue the same path type
            const newAddStepNodeId = `add-step-${clickedPathType}-${newNodeId}`
            const newAddStepNode: WorkflowNode = {
                id: newAddStepNodeId,
                type: 'addStep',
                position: {
                    x: clickedAddStepNode.position.x,
                    y: clickedAddStepNode.position.y + 200
                },
                data: {
                    pathType: clickedPathType // Maintain the same path type (accepted or not-accepted)
                },
                measured: {
                    width: 220,
                    height: 40
                },
                deletable: true
            }

            nodes.push(newAddStepNode)
            edges.push({
                id: `e-${newAddStepNodeId}-${newNodeId}`,
                source: newNodeId,
                target: newAddStepNodeId,
                type: sourceEdge?.data?.isConditionalPath ? 'conditional' : 'buttonedge',
                animated: true,
                data: {
                    delay: "15m",
                    delayData: {
                        delay: 15,
                        unit: "m"
                    },
                    isPositive: sourceEdge?.data?.isPositive,
                    isConditionalPath: sourceEdge?.data?.isConditionalPath
                }
            } as WorkflowEdge)
        }

        setWorkflow({
            nodes,
            edges
        })

        setIsAddingStepNode(false)
        setSelectedNodeId(null)
    }

    const { data: leadLists, isLoading: isLoadingLeadLists } = useLeadLists();
    const [tab, setTab] = useState<CampaignTabs>(CampaignTabs.DETAILS)

    const initialDetailsState: CampaignDetailsState = {
        name: '',
        description: '',
        senderAccount: '',
        prospectList: '',
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        timezone: getUserTimezone()
    }

    function campaignDetailsReducer(
        state: CampaignDetailsState,
        action: CampaignDetailsAction
    ): CampaignDetailsState {
        switch (action.type) {
            case 'SET_FIELD':
                return {
                    ...state,
                    [action.field]: action.value,
                }
            case 'RESET':
                return initialDetailsState
            default:
                return state
        }
    }

    const [detailsState, dispatchDetails] = useReducer(
        campaignDetailsReducer,
        initialDetailsState
    )

    const tabs = [
        {
            id: CampaignTabs.DETAILS,
            label: "Details",
            icon: Settings,
            description: "Basic campaign information"
        },
        {
            id: CampaignTabs.FLOW,
            label: "Flow",
            icon: Workflow,
            description: "Campaign workflow and steps"
        }
    ]

    useEffect(() => {
        console.log(workflow)
    }, [workflow])

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Tabs */}
            <div className="border-b">
                <div className="flex row items-center justify-between">

                    <nav className="flex space-x-8">
                        {tabs.map((tabItem) => {
                            const Icon = tabItem.icon
                            return (
                                <button
                                    key={tabItem.id}
                                    onClick={() => setTab(tabItem.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tab === tabItem.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tabItem.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                    <Button>
                        Create Campaign
                    </Button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-6">
                {tab === CampaignTabs.DETAILS && renderDetailsTab({
                    state: detailsState,
                    setState: dispatchDetails,
                    connectedAccounts,
                    isLoadingAccounts,
                    leadLists,
                    isLoadingLeadLists
                })}
                {tab === CampaignTabs.FLOW && renderFlowTab({
                    workflow,
                    setWorkflow,
                    onAddFirstNode: handleAddFirstNodeClick,
                    onAddStepClick: handleAddStepClick,
                    onDelayUpdate: handleDelayUpdate,
                    onExportJSON: () => {
                        const cleanJSON = exportWorkflowJSON();
                        console.log('Clean Workflow JSON:', JSON.stringify(cleanJSON, null, 2));
                        // Copy to clipboard for easy testing
                        navigator.clipboard.writeText(JSON.stringify(cleanJSON, null, 2));
                    }
                })}
            </div>

            <NodeSelectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setIsAddingStepNode(false)
                    setSelectedNodeId(null)
                }}
                onSelectNodeType={handleSelectNodeType}
                currentWorkflowTypes={workflow?.nodes.filter(n => n.type === 'action').map(n => (n.data as ActionNodeData).type) || []}
            />
        </div>
    )
}

export default CreateCampaignPage;


const renderDetailsTab = ({
    state,
    setState,
    connectedAccounts,
    isLoadingAccounts,
    leadLists,
    isLoadingLeadLists
}: {
    state: CampaignDetailsState
    setState: ActionDispatch<[action: CampaignDetailsAction]>
    connectedAccounts?: { data: ConnectedAccount[] }
    isLoadingAccounts: boolean
    leadLists?: {
        data: LeadList[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
        }
        message: string
    }
    isLoadingLeadLists: boolean
}) => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
                <CardDescription>
                    Set up the basic details for your campaign
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">Campaign Name</Label>
                        <Input
                            id="campaign-name"
                            value={state.name}
                            onChange={(e) => setState({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
                            placeholder="Enter campaign name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={state.description}
                            onChange={(e) => setState({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                            placeholder="Campaign description"
                        />
                    </div>
                </div>
                <div className="space-y-2 w-80">
                    <Label htmlFor="sender-account">Sender Account</Label>
                    <Select
                        value={state.senderAccount}
                        onValueChange={(value) => setState({ type: 'SET_FIELD', field: 'senderAccount', value })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingAccounts ? (
                                <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                            ) : connectedAccounts?.data && connectedAccounts.data.length > 0 ? (
                                connectedAccounts.data.map((account: ConnectedAccount) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.display_name} ({account.provider})
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-accounts" disabled>No accounts connected</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="prospect-list">Prospect List</Label>
                    <Select
                        value={state.prospectList}
                        onValueChange={(value) => setState({ type: 'SET_FIELD', field: 'prospectList', value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select prospect list" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingLeadLists ? (
                                <SelectItem value="loading" disabled>Loading lead lists...</SelectItem>
                            ) : leadLists?.data && leadLists.data.length > 0 ? (
                                leadLists.data.map((list: LeadList) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        {list.name} ({list.total_leads} leads)
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-lists" disabled>No lead lists available</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <DatePicker
                            id="start-date"
                            value={state.startDate || ''}
                            onChange={(date) => setState({ type: 'SET_FIELD', field: 'startDate', value: date?.toISOString() || '' })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <DatePicker
                            id="end-date"
                            value={state.endDate || ''}
                            onChange={(date) => setState({ type: 'SET_FIELD', field: 'endDate', value: date?.toISOString() || '' })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <TimePicker
                            id="start-time"
                            value={state.startTime || ''}
                            onChange={(time) =>
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
                            onChange={(time) =>
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
                    <Select
                        value={state.timezone}
                        onValueChange={(value) => setState({ type: 'SET_FIELD', field: 'timezone', value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {Object.entries(getTimezoneOptionsByRegion()).map(([region, timezones]) => (
                                <div key={region}>
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                        {region}
                                    </div>
                                    {timezones.map((timezone) => (
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
)

const renderFlowTab = ({ workflow, setWorkflow, onAddFirstNode, onAddStepClick, onDelayUpdate, onExportJSON }: { workflow: WorkflowData | null, setWorkflow: (workflow: WorkflowData) => void, onAddFirstNode: () => void, onAddStepClick: (nodeId: string) => void, onDelayUpdate: (edgeId: string, delayConfig: { delay: number; unit: string }) => void, onExportJSON: () => void }) => {

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    {workflow ? (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={onExportJSON}>
                                    Export JSON
                                </Button>
                            </div>
                        <ReactFlowCard workflow={workflow} setWorkflow={setWorkflow} onAddStepClick={onAddStepClick} onDelayUpdate={onDelayUpdate} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full" style={{ height: '70vh' }}>
                            <Button onClick={onAddFirstNode}>Add First Node</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}