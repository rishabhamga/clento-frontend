"use client"

import { Button } from "@/components/ui/button";
import { WorkflowNodeType, getNodeLabel, hasConditionalPaths } from "@/config/workflow-nodes";
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
}

export interface ActionNodeData {
    type: WorkflowNodeType;
    label: string;
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
        delayData: {
            delay: number;
            unit: "m" | "d" | string; // minutes, days, etc
        } | null;
        isPositive?: boolean;
        isConditionalPath?: boolean;
    };
    deletable: boolean;
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
        const firstNode: WorkflowNode = {
            id: '1',
                type: 'action',
                position: {
                x: 250,
                y: 80
                },
                data: {
                    type: nodeType,
                label: getNodeLabel(nodeType),
                    config: {}
                } as ActionNodeData,
                measured: {
                    width: 200,
                    height: 100
                },
            deletable: false
        }

        let nodes: WorkflowNode[] = [firstNode]
        let edges: WorkflowEdge[] = []

        if (hasConditionalPaths(nodeType)) {
            // Create two AddStep nodes for accepted and not-accepted paths
            const acceptedAddStepNode: WorkflowNode = {
                id: '2',
                type: 'addStep',
                position: {
                    x: 400,
                    y: 300
                },
                data: {
                    pathType: 'accepted'
                },
                measured: {
                    width: 200,
                    height: 60
                },
                deletable: false
            }

            const notAcceptedAddStepNode: WorkflowNode = {
                id: '3',
                type: 'addStep',
                position: {
                    x: 100,
                    y: 300
                },
                data: {
                    pathType: 'not-accepted'
                },
                measured: {
                    width: 200,
                    height: 60
                },
                deletable: false
            }

            nodes = [firstNode, acceptedAddStepNode, notAcceptedAddStepNode]
            edges = [
                {
                    id: '1-2',
                    source: '1',
                    target: '2',
                    type: 'conditional',
                    animated: true,
                    selected: false,
                    data: {
                        delayData: null,
                        isPositive: true,
                        isConditionalPath: true
                    },
                    deletable: false
                } as WorkflowEdge,
                {
                    id: '1-3',
                    source: '1',
                    target: '3',
                    type: 'conditional',
                    animated: true,
                    selected: false,
                    data: {
                        delayData: null,
                        isPositive: false,
                        isConditionalPath: true
                    },
                    deletable: false
                } as WorkflowEdge
            ]
        } else {
            // Single path for non-conditional nodes
            const addStepNode: WorkflowNode = {
                id: '2',
                type: 'addStep',
                position: {
                    x: 250,
                    y: 280
                },
                data: {
                    pathType: 'accepted'
                },
                measured: {
                    width: 200,
                    height: 60
                },
                deletable: false
            }

            nodes = [firstNode, addStepNode]
            edges = [{
                    id: '1-2',
                    source: '1',
                    target: '2',
                    type: 'conditional',
                    animated: true,
                    selected: false,
                    data: {
                        delayData: null
                    },
                    deletable: false
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

        // Generate new node ID
        const newNodeId = String(Date.now())

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
                config: {}
            } as ActionNodeData,
            measured: {
                width: 200,
                height: 100
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
                id: `${sourceNodeId}-${newNodeId}`,
                source: sourceNodeId,
                target: newNodeId,
                type: 'conditional',
                animated: true,
                selected: false,
                data: {
                    delayData: sourceEdge?.data?.delayData || null,
                    isPositive: sourceEdge?.data?.isPositive,
                    isConditionalPath: sourceEdge?.data?.isConditionalPath
                },
                deletable: true
            } as WorkflowEdge
        ]

        if (hasConditionalPaths(nodeType)) {
            // Create two AddStep nodes for accepted and not-accepted paths
            const acceptedAddStepNodeId = String(Date.now() + 1)
            const notAcceptedAddStepNodeId = String(Date.now() + 2)

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
                    width: 200,
                    height: 60
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
                    width: 200,
                    height: 60
                },
                deletable: true
            }

            nodes.push(acceptedAddStepNode, notAcceptedAddStepNode)
            edges.push(
                {
                    id: `${newNodeId}-${acceptedAddStepNodeId}`,
                    source: newNodeId,
                    target: acceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    selected: false,
                    data: {
                        delayData: null,
                        isPositive: true,
                        isConditionalPath: true
                    },
                    deletable: true
                } as WorkflowEdge,
                {
                    id: `${newNodeId}-${notAcceptedAddStepNodeId}`,
                    source: newNodeId,
                    target: notAcceptedAddStepNodeId,
                    type: 'conditional',
                    animated: true,
                    selected: false,
                    style: {
                        stroke: '#ef4444',
                        strokeWidth: 2,
                        strokeDasharray: '5,5'
                    },
                    data: {
                        delayData: null,
                        isPositive: false,
                        isConditionalPath: true
                    },
                    deletable: true
                } as WorkflowEdge
            )
        } else {
            // Single path for non-conditional nodes - continue the same path type
            const newAddStepNodeId = String(Date.now() + 1)
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
                    width: 200,
                    height: 60
                },
                deletable: true
            }

            nodes.push(newAddStepNode)
            edges.push({
                id: `${newNodeId}-${newAddStepNodeId}`,
                source: newNodeId,
                target: newAddStepNodeId,
                type: 'conditional',
                animated: true,
                selected: false,
                style: {
                    stroke: sourceEdge?.data?.isPositive ? '#22c55e' : (sourceEdge?.data?.isPositive === false ? '#ef4444' : '#6b7280'),
                    strokeWidth: 2,
                    strokeDasharray: sourceEdge?.data?.isPositive === false ? '5,5' : 'none'
                },
                data: {
                    delayData: null,
                    isPositive: sourceEdge?.data?.isPositive,
                    isConditionalPath: sourceEdge?.data?.isConditionalPath
                },
                deletable: true
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
                {tab === CampaignTabs.FLOW && renderFlowTab({ workflow, setWorkflow, onAddFirstNode: handleAddFirstNodeClick, onAddStepClick: handleAddStepClick, onDelayUpdate: handleDelayUpdate })}
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

const renderFlowTab = ({ workflow, setWorkflow, onAddFirstNode, onAddStepClick, onDelayUpdate }: { workflow: WorkflowData | null, setWorkflow: (workflow: WorkflowData) => void, onAddFirstNode: () => void, onAddStepClick: (nodeId: string) => void, onDelayUpdate: (edgeId: string, delayConfig: { delay: number; unit: string }) => void }) => {

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    {workflow ? (
                        <ReactFlowCard workflow={workflow} setWorkflow={setWorkflow} onAddStepClick={onAddStepClick} onDelayUpdate={onDelayUpdate} />
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