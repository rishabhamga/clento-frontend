import { WorkflowNodeType } from '@/config/workflow-nodes';
import { ActionNodeData, BaseConfig, WorkflowNode } from '@/app/(dashboard)/campaigns/create-campaign/page';

/**
 * Validates if a node is properly configured based on its type and configuration
 */
export function isNodeConfigured(node: WorkflowNode): boolean {
    const nodeData = node.data as ActionNodeData;
    const config = nodeData.config || {};

    // Skip validation for AddStep nodes (they're placeholders)
    if (node.type === 'addStep') {
        return true;
    }

    switch (nodeData.type) {
        case 'profile_visit':
        case 'withdraw_request':
            // These nodes don't require configuration
            return true;

        case 'like_post':
            // Requires numberOfPosts and recentPostDays (both have defaults, so always valid)
            return true;

        case 'comment_post':
            // If AI is enabled, needs AI config; if disabled, needs customComment
            if (config.configureWithAI) {
                // AI mode: needs commentLength, tone, language (all have defaults)
                return true;
            } else {
                // Manual mode: needs customComment
                return !!(config.customComment && config.customComment.trim().length > 0);
            }

        case 'send_followup':
        case 'send_inmail':
            // If AI is enabled, needs AI config; if disabled, needs customMessage
            if (config.configureWithAI) {
                // AI mode: needs messageLength, tone, language (all have defaults)
                return true;
            } else {
                // Manual mode: needs customMessage
                return !!(config.customMessage && config.customMessage.trim().length > 0);
            }

        case 'send_connection_request':
            // If AI is enabled, needs AI config; if disabled, needs customMessage
            if (config.useAI) {
                // AI mode: needs tone, formality, approach, etc. (all have defaults)
                return true;
            } else {
                // Manual mode: needs customMessage
                return !!(config.customMessage && config.customMessage.trim().length > 0);
            }

        case 'webhook':
            // Requires webhookId
            return !!(config.webhookId && config.webhookId.trim().length > 0);

        default:
            // Unknown node type - consider it configured to avoid blocking
            return true;
    }
}

/**
 * Validates the entire workflow to ensure all nodes are properly configured
 * Returns validation result with details about unconfigured nodes
 */
export function validateWorkflow(workflow: { nodes: WorkflowNode[] } | null): {
    isValid: boolean;
    unconfiguredNodes: WorkflowNode[];
    errors: string[];
} {
    if (!workflow) {
        return {
            isValid: false,
            unconfiguredNodes: [],
            errors: ['No workflow created'],
        };
    }

    // Get all action nodes (exclude AddStep nodes)
    const actionNodes = workflow.nodes.filter(node => node.type === 'action');

    if (actionNodes.length === 0) {
        return {
            isValid: false,
            unconfiguredNodes: [],
            errors: ['Workflow must contain at least one action node'],
        };
    }

    // Check each action node
    const unconfiguredNodes: WorkflowNode[] = [];
    for (const node of actionNodes) {
        if (!isNodeConfigured(node)) {
            unconfiguredNodes.push(node);
        }
    }

    const errors: string[] = [];
    if (unconfiguredNodes.length > 0) {
        const nodeLabels = unconfiguredNodes.map(node => {
            const nodeData = node.data as ActionNodeData;
            return nodeData.label || nodeData.type;
        });

        if (unconfiguredNodes.length === 1) {
            errors.push(`Please configure the "${nodeLabels[0]}" node before creating the campaign`);
        } else {
            errors.push(`Please configure the following nodes before creating the campaign: ${nodeLabels.join(', ')}`);
        }
    }

    return {
        isValid: unconfiguredNodes.length === 0,
        unconfiguredNodes,
        errors,
    };
}
