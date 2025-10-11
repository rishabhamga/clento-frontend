import {
  User,
  UserPlus,
  Heart,
  MessageSquare,
  MessageCircle,
  Mail,
  Building2,
  UserMinus,
  Send
} from "lucide-react";
import { LucideIcon } from "lucide-react";

/**
 * Centralized workflow node configuration
 * This file contains all node types, their properties, and metadata
 * To add a new node type, simply add it to the WORKFLOW_NODE_TYPES array
 */

export type WorkflowNodeType =
  | "profile_visit"
  | "like_post"
  | "comment_post"
  | "send_followup"
  | "withdraw_request"
  | "send_inmail"
  | "send_connection_request";

  export enum EWorkflowNodeType {
    profile_visit = 'profile_visit',
    like_post = 'like_post',
    comment_post = 'comment_post',
    send_followup = 'send_followup',
    withdraw_request = 'withdraw_request',
    send_inmail = 'send_inmail',
    send_connection_request = 'send_connection_request'
}

export interface WorkflowNodeConfig {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: 'engagement' | 'connection' | 'messaging' | 'company';
  requiresMessage?: boolean;
  requiresTemplate?: boolean;
  isLinkedInOnly?: boolean;
  isEmailOnly?: boolean;
  hasConditionalPaths?: boolean; // Nodes that branch into multiple paths based on outcome
}

/**
 * Complete configuration for all workflow node types
 * Add new node types here to make them available throughout the application
 */
export const WORKFLOW_NODE_TYPES: WorkflowNodeConfig[] = [
  {
    type: 'profile_visit',
    label: 'Profile Visit',
    description: 'Visit a LinkedIn profile to increase visibility',
    icon: User,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    category: 'engagement',
    isLinkedInOnly: true
  },
  {
    type: 'like_post',
    label: 'Like Post',
    description: 'Like the most recent LinkedIn post',
    icon: Heart,
    color: 'bg-red-100 text-red-800 border-red-200',
    category: 'engagement',
    isLinkedInOnly: true
  },
  {
    type: 'comment_post',
    label: 'Comment Post',
    description: 'Comment on a LinkedIn post',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    category: 'engagement',
    requiresMessage: true,
    isLinkedInOnly: true
  },
  {
    type: 'send_connection_request',
    label: 'Send Connection Request',
    description: 'Send a LinkedIn connection request',
    icon: Send,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    category: 'connection',
    requiresMessage: true,
    isLinkedInOnly: true,
    hasConditionalPaths: true
  },
  {
    type: 'send_followup',
    label: 'Send Follow-up',
    description: 'Send a follow-up message to connected contacts',
    icon: MessageCircle,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    category: 'messaging',
    requiresMessage: true,
    requiresTemplate: true,
    isLinkedInOnly: true
  },
  {
    type: 'withdraw_request',
    label: 'Withdraw Request',
    description: 'Withdraw a pending connection request',
    icon: UserMinus,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    category: 'connection',
    isLinkedInOnly: true
  },
  {
    type: 'send_inmail',
    label: 'Send InMail',
    description: 'Send a LinkedIn InMail message',
    icon: Mail,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    category: 'messaging',
    requiresMessage: true,
    requiresTemplate: true,
    isLinkedInOnly: true
  },
];

/**
 * Utility functions for working with workflow nodes
 */

/**
 * Get node configuration by type
 */
export function getNodeConfig(type: WorkflowNodeType): WorkflowNodeConfig | undefined {
  return WORKFLOW_NODE_TYPES.find(node => node.type === type);
}

/**
 * Get all node types as array
 */
export function getAllNodeTypes(): WorkflowNodeType[] {
  return WORKFLOW_NODE_TYPES.map(node => node.type);
}

/**
 * Get nodes by category
 */
export function getNodesByCategory(category: WorkflowNodeConfig['category']): WorkflowNodeConfig[] {
  return WORKFLOW_NODE_TYPES.filter(node => node.category === category);
}

/**
 * Get nodes that require messages
 */
export function getNodesRequiringMessage(): WorkflowNodeConfig[] {
  return WORKFLOW_NODE_TYPES.filter(node => node.requiresMessage);
}

/**
 * Get LinkedIn-only nodes
 */
export function getLinkedInNodes(): WorkflowNodeConfig[] {
  return WORKFLOW_NODE_TYPES.filter(node => node.isLinkedInOnly);
}

/**
 * Get email-only nodes
 */
export function getEmailNodes(): WorkflowNodeConfig[] {
  return WORKFLOW_NODE_TYPES.filter(node => node.isEmailOnly);
}

/**
 * Check if a node type exists
 */
export function isValidNodeType(type: string): type is WorkflowNodeType {
  return getAllNodeTypes().includes(type as WorkflowNodeType);
}

/**
 * Check if a node type has conditional paths (accepted/not-accepted)
 */
export function hasConditionalPaths(type: WorkflowNodeType): boolean {
  const config = getNodeConfig(type);
  return config?.hasConditionalPaths || false;
}

/**
 * Get formatted label for node type
 */
export function getNodeLabel(type: WorkflowNodeType): string {
  const config = getNodeConfig(type);
  return config?.label || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Categories for organizing nodes in UI
 */
export const NODE_CATEGORIES = {
  engagement: {
    label: 'Engagement',
    description: 'Actions to engage with profiles and content'
  },
  connection: {
    label: 'Connection',
    description: 'Actions to manage connections'
  },
  messaging: {
    label: 'Messaging',
    description: 'Actions to send messages'
  },
  company: {
    label: 'Company',
    description: 'Actions related to company pages'
  }
} as const;
