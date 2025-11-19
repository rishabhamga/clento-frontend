'use client';

import { useState, useEffect } from 'react';
import { WorkflowNodeType, getNodeConfig } from '@/config/workflow-nodes';
import { ActionNodeData, BaseConfig } from '@/app/(dashboard)/campaigns/create-campaign/page';
import { Info, Settings, X } from 'lucide-react';
import { CheckNever } from '../../lib/axios-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// Custom Toggle Component
const Toggle = ({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (checked: boolean) => void; id: string }) => {
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${checked ? 'bg-black' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

interface NodeConfigurationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    nodeData: ActionNodeData | null;
    nodeId: string;
    onConfigChange?: (nodeId: string, config: BaseConfig) => void;
}

export const NodeConfigurationDrawer = ({ isOpen, onClose, nodeData, nodeId, onConfigChange }: NodeConfigurationDrawerProps) => {
    const [config, setConfig] = useState<BaseConfig>({});

    if (!nodeData) return null;

    const nodeConfig = getNodeConfig(nodeData.type);
    const Icon = nodeConfig?.icon;

    // Initialize config from nodeData when it changes
    useEffect(() => {
        if (nodeData?.config) {
            setConfig(nodeData.config as BaseConfig);
        } else {
            setConfig({});
        }
    }, [nodeData]);

    if (!isOpen) return null;

    const handleConfigChange = (key: keyof BaseConfig, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        if (nodeId) {
            onConfigChange?.(nodeId, newConfig);
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-[400px] sm:w-[500px] bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Configure Action</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
                {/* Node Info Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">{Icon && <Icon className="h-5 w-5 text-gray-600" />}</div>
                        <div>
                            <h3 className="font-medium text-gray-900">{nodeConfig?.label || nodeData.label}</h3>
                            <p className="text-sm text-gray-500">{nodeConfig?.description}</p>
                        </div>
                    </div>
                </div>

                {/* Configuration Placeholder */}
                {renderConfiguration({ nodeData, config, onConfigChange: handleConfigChange })}

                {/* Node Requirements */}
                {nodeConfig && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900">Requirements</h3>
                        <div className="space-y-2">
                            {nodeConfig.requiresMessage && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    Requires message content
                                </div>
                            )}
                            {nodeConfig.requiresTemplate && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Requires message template
                                </div>
                            )}
                            {nodeConfig.isLinkedInOnly && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    LinkedIn only
                                </div>
                            )}
                            {nodeConfig.isEmailOnly && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    Email only
                                </div>
                            )}
                            {nodeConfig.hasConditionalPaths && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                    Has conditional paths (accepted/not-accepted)
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
                <button onClick={onClose} className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Done
                </button>
            </div>
        </div>
    );
};

const renderConfiguration = ({ nodeData, config, onConfigChange }: { nodeData: ActionNodeData; config: BaseConfig; onConfigChange: (key: keyof BaseConfig, value: any) => void }) => {
    switch (nodeData.type) {
        case 'profile_visit':
        case 'withdraw_request':
            return <NoConfiguration />;
        case 'like_post':
            return <LikeConfiguration config={config} onConfigChange={onConfigChange} />;
        case 'send_followup':
        case 'send_inmail':
            return <SendMessageConfiguration config={config} onConfigChange={onConfigChange} />;
        case 'comment_post':
            return <CommentConfiguration config={config} onConfigChange={onConfigChange} />;
        case 'send_connection_request':
            return <ConnectionRequestConfiguration config={config} onConfigChange={onConfigChange} />;
        default:
            CheckNever(nodeData.type);
    }
};

const NoConfiguration = () => {
    return (
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-gray-400" />
                <div>
                    <p className="text-sm font-medium text-gray-600">No configuration options available</p>
                    <p className="text-xs text-gray-500 mt-1">This is a simple action no configuration needed</p>
                </div>
            </div>
        </div>
    );
};

const CommentConfiguration = ({ config, onConfigChange }: { config: BaseConfig; onConfigChange: (key: keyof BaseConfig, value: any) => void }) => {
    const clickVariable = (variable: string) => {
        navigator.clipboard.writeText(variable);
        toast.success('Variable copied to clipboard');
    };
    return (
        <div className="space-y-6">
            {/* Number of Posts */}
            <div className="flex items-center justify-between">
                <Label htmlFor="number-of-posts" className="text-sm font-medium">
                    Number of Posts
                </Label>
                <Input id="number-of-posts" type="number" value={config.numberOfPosts || 1} onChange={e => onConfigChange('numberOfPosts', parseInt(e.target.value) || 1)} min="1" max="10" className="w-20" />
            </div>

            {/* Recent Post Within Days */}
            <div className="flex items-center justify-between">
                <Label htmlFor="recent-post-days" className="text-sm font-medium">
                    Recent Post Within (days)
                </Label>
                <Input id="recent-post-days" type="number" value={config.recentPostDays || 7} onChange={e => onConfigChange('recentPostDays', parseInt(e.target.value) || 7)} min="1" max="30" className="w-20" />
            </div>

            {/* Configure with AI */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label htmlFor="configure-with-ai" className="text-sm font-medium">
                        Configure with AI
                    </Label>
                    <p className="text-xs text-gray-500">Let AI help you generate engaging comments</p>
                </div>
                <Toggle id="configure-with-ai" checked={config.configureWithAI || false} onCheckedChange={checked => onConfigChange('configureWithAI', checked)} />
            </div>

            {/* AI-dependent fields - only show when AI is enabled */}
            {config.configureWithAI && (
                <>
                    {/* Length Select */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="comment-length" className="text-sm font-medium">
                            Comment Length
                        </Label>
                        <Select value={config.commentLength || 'medium'} onValueChange={value => onConfigChange('commentLength', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select comment length" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                                <SelectItem value="medium">Medium (2-3 sentences)</SelectItem>
                                <SelectItem value="long">Long (3+ sentences)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tone */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="comment-tone" className="text-sm font-medium">
                            Tone
                        </Label>
                        <Select value={config.tone || 'professional'} onValueChange={value => onConfigChange('tone', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                                <SelectItem value="supportive">Supportive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="comment-language" className="text-sm font-medium">
                            Language
                        </Label>
                        <Select value={config.language || 'english'} onValueChange={value => onConfigChange('language', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                                <SelectItem value="german">German</SelectItem>
                                <SelectItem value="portuguese">Portuguese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {/* Conditional Content based on AI toggle */}
            {config.configureWithAI ? (
                /* Custom Guidelines - shown when AI is enabled */
                <div className="space-y-2">
                    <Label htmlFor="custom-guidelines" className="text-sm font-medium">
                        Custom Guidelines
                    </Label>
                    <Textarea id="custom-guidelines" value={config.customGuidelines || ''} onChange={e => onConfigChange('customGuidelines', e.target.value)} placeholder="Enter any specific guidelines for comment generation..." className="min-h-[80px] w-full" />
                </div>
            ) : (
                /* Custom Comment - shown when AI is disabled */
                <div className="space-y-2">
                    <Label htmlFor="custom-comment" className="text-sm font-medium">
                        Custom Comment
                    </Label>
                    <Textarea id="custom-comment" value={config.customComment || ''} onChange={e => onConfigChange('customComment', e.target.value)} placeholder="Type your comment here. Use variables like {{first_name}}, {{last_name}}, {{company}}..." className="min-h-[100px] w-full" />
                    <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium">Available variables:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{first_name}}')}>
                                {'{{first_name}}'}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{last_name}}')}>
                                {'{{last_name}}'}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{company}}')}>
                                {'{{company}}'}
                            </span>
                        </div>
                        <p>These variables will be automatically replaced with the actual values when sending comments.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ConnectionRequestConfiguration = ({ config, onConfigChange }: { config: BaseConfig; onConfigChange: (key: keyof BaseConfig, value: any) => void }) => {
    const clickVariable = (variable: string) => {
        navigator.clipboard.writeText(variable);
        toast.success('Variable copied to clipboard');
    };

    return (
        <div className="space-y-6">
            {/* Can Use AI */}
            <div className="flex items-center justify-between">
                <Label htmlFor="can-use-ai" className="text-sm font-medium">
                    Can Use AI
                </Label>
                <Toggle id="can-use-ai" checked={config.useAI || false} onCheckedChange={checked => onConfigChange('useAI', checked)} />
            </div>

            {/* AI Guidelines - Only show if AI is enabled */}
            {config.useAI && (
                <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900">AI Guidelines</h4>

                    {/* Tone */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-tone" className="text-sm font-medium">
                            Tone
                        </Label>
                        <Select value={config.tone || 'moderate'} onValueChange={value => onConfigChange('tone', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cold">Cold</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="warm">Warm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Formality */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-formality" className="text-sm font-medium">
                            Formality
                        </Label>
                        <Select value={config.formality || 'approachable'} onValueChange={value => onConfigChange('formality', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select formality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="approachable">Approachable</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Approach */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-approach" className="text-sm font-medium">
                            Approach
                        </Label>
                        <Select value={config.approach || 'diplomatic'} onValueChange={value => onConfigChange('approach', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select approach" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="direct">Direct</SelectItem>
                                <SelectItem value="diplomatic">Diplomatic</SelectItem>
                                <SelectItem value="indirect">Indirect</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Focus */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-focus" className="text-sm font-medium">
                            Focus
                        </Label>
                        <Select value={config.focus || 'relational'} onValueChange={value => onConfigChange('focus', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select focus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="relational">Relational</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Intention */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-intention" className="text-sm font-medium">
                            Intention
                        </Label>
                        <Select value={config.intention || 'networking'} onValueChange={value => onConfigChange('intention', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select intention" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="networking">Networking</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="collaboration">Collaboration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Call-to-Action */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-cta" className="text-sm font-medium">
                            Call-to-Action
                        </Label>
                        <Select value={config.callToAction || 'confident'} onValueChange={value => onConfigChange('callToAction', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select CTA" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="strong">Strong</SelectItem>
                                <SelectItem value="confident">Confident</SelectItem>
                                <SelectItem value="subtle">Subtle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Personalization */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-personalization" className="text-sm font-medium">
                            Personalization
                        </Label>
                        <Select value={config.personalization || 'specific'} onValueChange={value => onConfigChange('personalization', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select personalization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="specific">Specific</SelectItem>
                                <SelectItem value="generic">Generic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="connection-language" className="text-sm font-medium">
                            Language
                        </Label>
                        <Select value={config.language || 'english'} onValueChange={value => onConfigChange('language', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                                <SelectItem value="german">German</SelectItem>
                                <SelectItem value="portuguese">Portuguese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            {/* Engage with recent activity */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="engage-recent-activity" className="text-sm font-medium">
                            Engage with recent activity?
                        </Label>
                        <Toggle id="engage-recent-activity" checked={config.engageWithRecentActivity || false} onCheckedChange={checked => onConfigChange('engageWithRecentActivity', checked)} />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-gradient-purple w-45" arrowClassName="!bg-purple-600 !fill-purple-600">
                    AI will analyze and reference their recent LinkedIn posts to create a more personalized connection request
                </TooltipContent>
            </Tooltip>

            {/* Conditional Content based on AI toggle */}
            {config.useAI ? (
                /* Custom Guidelines - shown when AI is enabled */
                <div className="space-y-2">
                    <Label htmlFor="connection-custom-guidelines" className="text-sm font-medium">
                        Custom Guidelines
                    </Label>
                    <Textarea id="connection-custom-guidelines" value={config.customGuidelines || ''} onChange={e => onConfigChange('customGuidelines', e.target.value)} placeholder="Enter any specific guidelines for connection requests..." className="min-h-[80px] w-full" />
                </div>
            ) : (
                /* Custom Message - shown when AI is disabled */
                <div className="space-y-2">
                    <Label htmlFor="custom-message" className="text-sm font-medium">
                        Custom Connection Request Message
                    </Label>
                    <Textarea id="custom-message" value={config.customMessage || ''} onChange={e => onConfigChange('customMessage', e.target.value)} placeholder="Type your connection request message here. Use variables like {{first_name}}, {{last_name}}, {{company}}..." className="min-h-[100px] w-full" />
                    <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium">Available variables:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{first_name}}')}>
                                {'{{first_name}}'}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{last_name}}')}>
                                {'{{last_name}}'}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{company}}')}>
                                {'{{company}}'}
                            </span>
                        </div>
                        <p>These variables will be automatically replaced with the actual values when sending connection requests.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const SendMessageConfiguration = ({ config, onConfigChange }: { config: BaseConfig; onConfigChange: (key: keyof BaseConfig, value: any) => void }) => {
    const clickVariable = (variable: string) => {
        navigator.clipboard.writeText(variable);
        toast.success('Variable copied to clipboard');
    };

    return (
        <div className="space-y-6">
            {/* Smart Followups */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label htmlFor="smart-followups" className="text-sm font-medium">
                        Smart Followups
                    </Label>
                    <p className="text-xs text-gray-500">Only go when the user hasn't replied yet</p>
                </div>
                <Toggle id="smart-followups" checked={config.smartFollowups || false} onCheckedChange={checked => onConfigChange('smartFollowups', checked)} />
            </div>

            {/* Configure with AI */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label htmlFor="configure-with-ai" className="text-sm font-medium">
                        Configure with AI
                    </Label>
                    <p className="text-xs text-gray-500">Let AI help you generate engaging messages</p>
                </div>
                <Toggle id="configure-with-ai" checked={config.configureWithAI || false} onCheckedChange={checked => onConfigChange('configureWithAI', checked)} />
            </div>

            {/* AI-dependent fields - only show when AI is enabled */}
            {config.configureWithAI && (
                <>
                    {/* Message Length */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="message-length" className="text-sm font-medium">
                            Message Length
                        </Label>
                        <Select value={config.messageLength || 'medium'} onValueChange={value => onConfigChange('messageLength', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select message length" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                                <SelectItem value="medium">Medium (2-3 sentences)</SelectItem>
                                <SelectItem value="long">Long (3+ sentences)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tone */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="message-tone" className="text-sm font-medium">
                            Tone
                        </Label>
                        <Select value={config.tone || 'professional'} onValueChange={value => onConfigChange('tone', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                                <SelectItem value="supportive">Supportive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="message-language" className="text-sm font-medium">
                            Language
                        </Label>
                        <Select value={config.language || 'english'} onValueChange={value => onConfigChange('language', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                                <SelectItem value="german">German</SelectItem>
                                <SelectItem value="portuguese">Portuguese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Engage with recent activity */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="message-engage-activity" className="text-sm font-medium">
                            Engage with recent activity?
                        </Label>
                        <Toggle id="message-engage-activity" checked={config.engageWithRecentActivity || false} onCheckedChange={checked => onConfigChange('engageWithRecentActivity', checked)} />
                    </div>

                    {/* Message Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="message-purpose" className="text-sm font-medium">
                            Message Purpose
                        </Label>
                        <Textarea id="message-purpose" value={config.messagePurpose || ''} onChange={e => onConfigChange('messagePurpose', e.target.value)} placeholder="Explain to AI in your language what the purpose of this message is..." className="min-h-[80px] w-full" />
                    </div>
                </>
            )}

            {/* Conditional Content based on AI toggle */}
            {config.configureWithAI ? (
                /* Custom Guidelines - shown when AI is enabled */
                <div className="space-y-2">
                    <Label htmlFor="custom-guidelines" className="text-sm font-medium">
                        Custom Guidelines
                    </Label>
                    <Textarea id="custom-guidelines" value={config.customGuidelines || ''} onChange={e => onConfigChange('customGuidelines', e.target.value)} placeholder="Enter any specific guidelines for message generation..." className="min-h-[80px] w-full" />
                </div>
            ) : (
                /* Custom Message - shown when AI is disabled */
                <div className="space-y-2">
                    <Label htmlFor="custom-message" className="text-sm font-medium">
                        Custom Message
                    </Label>
                    <Textarea id="custom-message" value={config.customMessage || ''} onChange={e => onConfigChange('customMessage', e.target.value)} placeholder="Type your message here. Use variables like {{first_name}}, {{last_name}}, {{company}}..." className="min-h-[100px] w-full" />
                    <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium">Available variables:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{first_name}}')}>
                                {'{{first_name}}'}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{last_name}}')}>
                                {'{{last_name}}'}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono cursor-pointer" onClick={() => clickVariable('{{company}}')}>
                                {'{{company}}'}
                            </span>
                        </div>
                        <p>These variables will be automatically replaced with the actual values when sending messages.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const LikeConfiguration = ({ config, onConfigChange }: { config: BaseConfig; onConfigChange: (key: keyof BaseConfig, value: any) => void }) => {
    return (
        <div className="space-y-6">
            {/* Number of Posts */}
            <div className="flex items-center justify-between">
                <Label htmlFor="like-number-of-posts" className="text-sm font-medium">
                    Number of Posts
                </Label>
                <Input id="like-number-of-posts" type="number" value={config.numberOfPosts || 1} onChange={e => onConfigChange('numberOfPosts', parseInt(e.target.value) || 1)} min="1" max="10" className="w-20" />
            </div>

            {/* Recent Post Within Days */}
            <div className="flex items-center justify-between">
                <Label htmlFor="like-recent-post-days" className="text-sm font-medium">
                    Recent Post Within (days)
                </Label>
                <Input id="like-recent-post-days" type="number" value={config.recentPostDays || 7} onChange={e => onConfigChange('recentPostDays', parseInt(e.target.value) || 7)} min="1" max="30" className="w-20" />
            </div>
        </div>
    );
};
