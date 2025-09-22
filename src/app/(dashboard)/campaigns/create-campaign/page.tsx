"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Settings, Workflow } from "lucide-react";
import { ActionDispatch, useReducer, useState } from "react";
import { useConnectedAccounts, ConnectedAccount } from "../../../../hooks/useConnectedAccounts";
import { useLeadLists } from "../../../../hooks/useLeadLists";
import { LeadList } from "../../../../types/lead-list";
import { getTimezoneOptionsByRegion, getUserTimezone } from "../../../../lib/timezone-utils";
import ReactFlowCard from "../../../../components/ui/react-flow";

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

type CampaignDetailsAction =
    | { type: 'SET_FIELD'; field: keyof CampaignDetailsState; value: string }
    | { type: 'RESET' }

const CreateCampaignPage = () => {
    const { data: connectedAccounts, isLoading: isLoadingAccounts } = useConnectedAccounts()

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
                {tab === CampaignTabs.FLOW && renderFlowTab()}
            </div>
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

const renderFlowTab = () => (
    <div className="space-y-6">
        <Card>
            <CardContent>
                <ReactFlowCard />
            </CardContent>
        </Card>
    </div>
)