import { WORKFLOW_NODE_TYPES, WorkflowNodeConfig, NODE_CATEGORIES } from './workflow-nodes';

/**
 * Enhanced workflow configuration system
 * This provides additional utilities for managing workflow nodes and their organization
 */

export interface WorkflowConfigOptions {
  includeCategories?: (keyof typeof NODE_CATEGORIES)[];
  excludeTypes?: string[];
  includeOnlyTypes?: string[];
  filterByPlatform?: 'linkedin' | 'email' | 'all';
}

/**
 * Get filtered workflow nodes based on options
 */
export function getFilteredWorkflowNodes(options: WorkflowConfigOptions = {}): WorkflowNodeConfig[] {
  let filteredNodes = [...WORKFLOW_NODE_TYPES];

  // Filter by categories
  if (options.includeCategories && options.includeCategories.length > 0) {
    filteredNodes = filteredNodes.filter(node =>
      options.includeCategories!.includes(node.category)
    );
  }

  // Filter by platform
  if (options.filterByPlatform) {
    switch (options.filterByPlatform) {
      case 'linkedin':
        filteredNodes = filteredNodes.filter(node => node.isLinkedInOnly);
        break;
      case 'email':
        filteredNodes = filteredNodes.filter(node => node.isEmailOnly);
        break;
      case 'all':
      default:
        // No filtering needed
        break;
    }
  }

  // Exclude specific types
  if (options.excludeTypes && options.excludeTypes.length > 0) {
    filteredNodes = filteredNodes.filter(node =>
      !options.excludeTypes!.includes(node.type)
    );
  }

  // Include only specific types
  if (options.includeOnlyTypes && options.includeOnlyTypes.length > 0) {
    filteredNodes = filteredNodes.filter(node =>
      options.includeOnlyTypes!.includes(node.type)
    );
  }

  return filteredNodes;
}

/**
 * Get workflow nodes organized by category
 */
export function getNodesGroupedByCategory(options: WorkflowConfigOptions = {}): Record<string, WorkflowNodeConfig[]> {
  const filteredNodes = getFilteredWorkflowNodes(options);

  return filteredNodes.reduce((groups, node) => {
    const category = node.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(node);
    return groups;
  }, {} as Record<string, WorkflowNodeConfig[]>);
}

/**
 * Workflow presets for common use cases
 */
export const WORKFLOW_PRESETS = {
  // Basic outreach workflow
  basic_outreach: {
    name: 'Basic Outreach',
    description: 'Simple profile visit and connection request',
    allowedTypes: ['profile_visit', 'send_connection_request'] as const,
    recommendedFlow: [
      { type: 'profile_visit', delay: 0 },
      { type: 'send_connection_request', delay: 24 }
    ]
  },

  // Engagement-first workflow
  engagement_first: {
    name: 'Engagement First',
    description: 'Engage with content before connecting',
    allowedTypes: ['profile_visit', 'like_post', 'comment_post', 'send_connection_request'] as const,
    recommendedFlow: [
      { type: 'profile_visit', delay: 0 },
      { type: 'like_post', delay: 2 },
      { type: 'comment_post', delay: 24 },
      { type: 'send_connection_request', delay: 48 }
    ]
  },

  // Full sequence workflow
  full_sequence: {
    name: 'Full Sequence',
    description: 'Complete outreach sequence with follow-ups',
    allowedTypes: [
      'profile_visit', 'like_post', 'send_connection_request',
      'send_followup', 'send_inmail'
    ] as const,
    recommendedFlow: [
      { type: 'profile_visit', delay: 0 },
      { type: 'like_post', delay: 2 },
      { type: 'send_connection_request', delay: 24 },
      { type: 'send_followup', delay: 168 }, // 1 week
      { type: 'send_inmail', delay: 336 } // 2 weeks
    ]
  },

  // Company-focused workflow
  company_focused: {
    name: 'Company Focused',
    description: 'Focus on company engagement',
    allowedTypes: ['profile_visit', 'follow_company', 'send_connection_request'] as const,
    recommendedFlow: [
      { type: 'profile_visit', delay: 0 },
      { type: 'follow_company', delay: 2 },
      { type: 'send_connection_request', delay: 24 }
    ]
  }
} as const;

/**
 * Get workflow preset by key
 */
export function getWorkflowPreset(presetKey: keyof typeof WORKFLOW_PRESETS) {
  return WORKFLOW_PRESETS[presetKey];
}

/**
 * Get all available workflow presets
 */
export function getAllWorkflowPresets() {
  return Object.entries(WORKFLOW_PRESETS).map(([key, preset]) => ({
    key: key as keyof typeof WORKFLOW_PRESETS,
    ...preset
  }));
}

/**
 * Validate if a workflow configuration is valid
 */
export function validateWorkflowConfiguration(nodeTypes: string[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if all node types are valid
  const validNodeTypes = WORKFLOW_NODE_TYPES.map(node => node.type);
  const invalidTypes = nodeTypes.filter(type => !validNodeTypes.includes(type as any));

  if (invalidTypes.length > 0) {
    errors.push(`Invalid node types: ${invalidTypes.join(', ')}`);
  }

  // Check for potential issues
  const hasConnectionRequest = nodeTypes.some(type =>
    ['send_connection_request', 'send_invite'].includes(type)
  );
  const hasFollowUp = nodeTypes.some(type => type === 'send_followup');

  if (hasFollowUp && !hasConnectionRequest) {
    warnings.push('Follow-up message without connection request may not be effective');
  }

  const hasWithdraw = nodeTypes.some(type => type === 'withdraw_request');
  if (hasWithdraw && !hasConnectionRequest) {
    warnings.push('Withdraw request without connection request is not logical');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get recommended next steps based on current workflow
 */
export function getRecommendedNextSteps(currentTypes: string[]): WorkflowNodeConfig[] {
  const currentTypesSet = new Set(currentTypes);

  // Basic recommendations based on what's already in the workflow
  const recommendations: WorkflowNodeConfig[] = [];

  // If no profile visit, recommend it first
  if (!currentTypesSet.has('profile_visit')) {
    const profileVisit = WORKFLOW_NODE_TYPES.find(n => n.type === 'profile_visit');
    if (profileVisit) recommendations.push(profileVisit);
  }

  // If has profile visit but no engagement, recommend engagement
  if (currentTypesSet.has('profile_visit') &&
      !currentTypesSet.has('like_post') &&
      !currentTypesSet.has('comment_post')) {
    const likePost = WORKFLOW_NODE_TYPES.find(n => n.type === 'like_post');
    if (likePost) recommendations.push(likePost);
  }

  // If has engagement but no connection request, recommend it
  if ((currentTypesSet.has('like_post') || currentTypesSet.has('comment_post')) &&
      !currentTypesSet.has('send_connection_request')) {
    const connectionRequest = WORKFLOW_NODE_TYPES.find(n => n.type === 'send_connection_request');
    if (connectionRequest) recommendations.push(connectionRequest);
  }

  // If has connection request but no follow-up, recommend it
  if (currentTypesSet.has('send_connection_request') &&
      !currentTypesSet.has('send_followup')) {
    const followUp = WORKFLOW_NODE_TYPES.find(n => n.type === 'send_followup');
    if (followUp) recommendations.push(followUp);
  }

  return recommendations;
}
