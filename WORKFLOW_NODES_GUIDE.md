# Centralized Workflow Node Configuration Guide

## Overview

The workflow node system has been completely centralized to make it easy to add, modify, or configure node types throughout the application. All node-related configuration is now managed from a single source of truth.

## 🎯 Key Benefits

- **Single Source of Truth**: All node types, icons, colors, and metadata are defined in one place
- **Easy to Extend**: Add new node types by simply adding them to the configuration array
- **Type Safety**: Full TypeScript support with centralized type definitions
- **Consistent UI**: All components automatically use the same styling and behavior
- **Smart Recommendations**: Built-in logic for recommending next steps in workflows
- **Category Organization**: Nodes are organized by categories (engagement, connection, messaging, company)

## 📁 File Structure

```
src/config/
├── workflow-nodes.ts        # Core node definitions and utilities
└── workflow-config.ts       # Advanced configuration and presets

src/types/
└── campaign.ts             # Updated to use centralized types

src/lib/
└── validations.ts          # Updated validation schemas

src/components/workflow/
├── NodeSelectionModal.tsx  # Enhanced modal with categories and recommendations
└── ActionNode.tsx          # Updated to use centralized config
```

## 🔧 How to Add a New Node Type

### Step 1: Add to Configuration

Edit `src/config/workflow-nodes.ts` and add your new node to the `WORKFLOW_NODE_TYPES` array:

```typescript
{
  type: 'your_new_action',
  label: 'Your New Action',
  description: 'Description of what this action does',
  icon: YourIcon, // Import from lucide-react
  color: 'bg-purple-100 text-purple-800 border-purple-200',
  category: 'engagement', // or 'connection', 'messaging', 'company'
  requiresMessage: true, // optional: if this action needs a message
  requiresTemplate: true, // optional: if this action needs a template
  isLinkedInOnly: true, // optional: if this is LinkedIn-specific
  isEmailOnly: false // optional: if this is email-specific
}
```

### Step 2: That's It!

The new node type will automatically be available in:
- ✅ NodeSelectionModal (with proper categorization)
- ✅ ActionNode component (with correct icon and styling)
- ✅ Type definitions and validation schemas
- ✅ All utility functions

## 🎨 Available Configuration Options

### Node Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | ✅ | Unique identifier for the node type |
| `label` | `string` | ✅ | Human-readable label |
| `description` | `string` | ✅ | Description shown in selection modal |
| `icon` | `LucideIcon` | ✅ | Icon component from lucide-react |
| `color` | `string` | ✅ | Tailwind CSS classes for styling |
| `category` | `string` | ✅ | Category for organization |
| `requiresMessage` | `boolean` | ❌ | Whether this action requires a message |
| `requiresTemplate` | `boolean` | ❌ | Whether this action requires a template |
| `isLinkedInOnly` | `boolean` | ❌ | LinkedIn-specific actions |
| `isEmailOnly` | `boolean` | ❌ | Email-specific actions |

### Categories

- **engagement**: Actions to engage with profiles and content
- **connection**: Actions to manage connections
- **messaging**: Actions to send messages
- **company**: Actions related to company pages

## 🛠 Utility Functions

### Core Functions (workflow-nodes.ts)

```typescript
// Get configuration for a specific node type
const config = getNodeConfig('profile_visit')

// Get all available node types
const allTypes = getAllNodeTypes()

// Get nodes by category
const engagementNodes = getNodesByCategory('engagement')

// Get nodes that require messages
const messageNodes = getNodesRequiringMessage()

// Get formatted label
const label = getNodeLabel('profile_visit') // "Profile Visit"

// Validate node type
const isValid = isValidNodeType('some_type')
```

### Advanced Functions (workflow-config.ts)

```typescript
// Get filtered nodes with options
const filteredNodes = getFilteredWorkflowNodes({
  includeCategories: ['engagement', 'connection'],
  excludeTypes: ['withdraw_request'],
  filterByPlatform: 'linkedin'
})

// Get nodes organized by category
const nodesByCategory = getNodesGroupedByCategory()

// Get workflow recommendations
const recommendations = getRecommendedNextSteps(['profile_visit'])

// Validate workflow configuration
const validation = validateWorkflowConfiguration(['profile_visit', 'send_followup'])
```

## 🎯 Workflow Presets

Pre-configured workflow templates are available:

```typescript
import { getWorkflowPreset, getAllWorkflowPresets } from '@/config/workflow-config'

// Get a specific preset
const basicOutreach = getWorkflowPreset('basic_outreach')

// Get all available presets
const allPresets = getAllWorkflowPresets()
```

Available presets:
- **basic_outreach**: Simple profile visit and connection request
- **engagement_first**: Engage with content before connecting
- **full_sequence**: Complete outreach sequence with follow-ups
- **company_focused**: Focus on company engagement

## 🔍 Enhanced Node Selection Modal

The NodeSelectionModal now includes:

- **Categorized Tabs**: Nodes organized by type (All, Recommended, Engagement, Connection, Messaging)
- **Smart Recommendations**: Shows recommended next steps based on current workflow
- **Visual Indicators**: Badges for recommended nodes and required features
- **Better UX**: Larger modal with better organization and search capabilities

### Usage

```typescript
<NodeSelectionModal
  isOpen={isModalOpen}
  onClose={handleClose}
  onSelectNodeType={handleSelectNodeType}
  currentWorkflowTypes={currentNodeTypes} // For recommendations
/>
```

## 🚀 Migration Notes

### What Changed

1. **Node Type Definitions**: Moved from inline types to centralized configuration
2. **Icon & Color Logic**: Removed hardcoded switch statements, now uses configuration
3. **Validation Schemas**: Updated to use centralized type definitions
4. **Modal Enhancement**: Added categories, recommendations, and better UX

### Breaking Changes

- `ActionNodeData['type']` now uses `WorkflowNodeType` from centralized config
- Hardcoded node type arrays have been replaced with dynamic imports
- Some component props may have changed (check TypeScript errors)

## 🎉 Benefits for Developers

1. **Faster Development**: Add new node types in seconds, not minutes
2. **Consistency**: All UI components automatically stay in sync
3. **Type Safety**: Full TypeScript support prevents runtime errors
4. **Better UX**: Smart recommendations and categorization improve user experience
5. **Maintainability**: Single source of truth makes updates easy
6. **Extensibility**: Easy to add new features like filtering, presets, etc.

## 🔮 Future Enhancements

The centralized system makes it easy to add:

- **Custom Node Icons**: User-uploaded or custom icon sets
- **Dynamic Filtering**: Filter nodes based on connected accounts or capabilities
- **Workflow Templates**: Save and reuse common workflow patterns
- **Conditional Logic**: Show/hide nodes based on previous selections
- **A/B Testing**: Different node sets for different user groups
- **Analytics**: Track which nodes are most commonly used

---

**Need help?** The centralized configuration system is designed to be intuitive. Most changes only require updating the `WORKFLOW_NODE_TYPES` array in `workflow-nodes.ts`.
