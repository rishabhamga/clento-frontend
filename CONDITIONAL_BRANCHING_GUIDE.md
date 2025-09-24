# Conditional Branching Implementation Guide

## Overview

The workflow system now supports conditional branching for nodes that have different outcomes, such as "Send Connection Request" which can result in "Accepted" or "Not Accepted" paths. This allows for more sophisticated automation workflows that can handle different scenarios.

## 🎯 Key Features

- **Automatic Branching**: Connection request nodes automatically create two paths
- **Visual Distinction**: Different colors and styles for accepted vs not-accepted paths
- **Smart Layout**: Automatic positioning of branched paths
- **Path Labels**: Clear labeling of each path type
- **Centralized Configuration**: Easy to add new conditional nodes

## 🔧 How It Works

### Node Configuration

Conditional nodes are marked in the configuration with `hasConditionalPaths: true`:

```typescript
// In src/config/workflow-nodes.ts
{
  type: 'send_connection_request',
  label: 'Send Connection Request',
  description: 'Send a LinkedIn connection request',
  icon: Send,
  color: 'bg-orange-100 text-orange-800 border-orange-200',
  category: 'connection',
  requiresMessage: true,
  isLinkedInOnly: true,
  hasConditionalPaths: true  // This enables conditional branching
}
```

### Visual Design

#### Edge Colors and Styles
- **Accepted Path**: Green solid line (`#22c55e`)
- **Not Accepted Path**: Red dashed line (`#ef4444`)
- **Regular Path**: Gray solid line (`#6b7280`)

#### AddStep Node Labels
- **Accepted**: Green badge with "Accepted" label
- **Not Accepted**: Red badge with "Not Accepted" label
- **Regular**: No special label

#### Action Node Indicators
- Conditional nodes show "Conditional" text below the main label
- Visual indicator that the node will branch into multiple paths

## 🛠 Implementation Details

### 1. Node Creation Logic

When creating a conditional node, the system:

1. **First Node**: Creates two AddStep nodes (accepted and not-accepted paths)
2. **Subsequent Nodes**: Replaces clicked AddStep with action node and creates appropriate branching

```typescript
// Example: Creating first connection request node
if (hasConditionalPaths(nodeType)) {
  // Creates two AddStep nodes at different positions
  const acceptedAddStepNode = { /* positioned left */ }
  const notAcceptedAddStepNode = { /* positioned right */ }

  // Creates two edges with different properties
  const acceptedEdge = { isPositive: true, isConditionalPath: true }
  const notAcceptedEdge = { isPositive: false, isConditionalPath: true }
}
```

### 2. Edge Data Structure

Edges now include conditional path information:

```typescript
interface WorkflowEdge {
  // ... existing properties
  data: {
    delayData: { delay: number; unit: string } | null;
    isPositive?: boolean;      // true for accepted, false for not-accepted
    isConditionalPath?: boolean; // true if this is a conditional edge
  }
}
```

### 3. Component Updates

#### AddStepNode Component
- Shows path type labels (Accepted/Not Accepted)
- Different button colors based on path type
- Conditional rendering of labels

#### DelayEdge Component
- Dynamic edge colors based on path type
- Solid lines for accepted paths, dashed for not-accepted
- Maintains existing delay functionality

#### ActionNode Component
- Shows "Conditional" indicator for conditional nodes
- Uses centralized configuration for consistent styling

## 🎨 Visual Examples

### Single Path Node (e.g., Profile Visit)
```
┌─────────────────┐
│  Profile Visit  │
└─────────────────┘
         │
         ▼
   ┌──────────┐
   │ Add Step │
   └──────────┘
```

### Conditional Path Node (e.g., Connection Request)
```
      ┌─────────────────────┐
      │ Send Connection Req │
      │    (Conditional)    │
      └─────────────────────┘
             ╱       ╲
        ────╱         ╲────
       ╱                   ╲
      ▼                     ▼
┌──────────┐          ┌──────────────┐
│Accepted  │          │ Not Accepted │
│Add Step  │          │   Add Step   │
└──────────┘          └──────────────┘
```

## 📝 Adding New Conditional Nodes

To add a new node type with conditional branching:

### Step 1: Update Configuration
```typescript
// In src/config/workflow-nodes.ts
{
  type: 'your_conditional_action',
  label: 'Your Conditional Action',
  description: 'Action that can have different outcomes',
  icon: YourIcon,
  color: 'bg-blue-100 text-blue-800 border-blue-200',
  category: 'connection',
  hasConditionalPaths: true  // Enable conditional branching
}
```

### Step 2: That's It!
The system automatically handles:
- ✅ Creating branched paths
- ✅ Visual styling (colors, labels)
- ✅ Edge routing and positioning
- ✅ UI components updates

## 🔍 Current Conditional Nodes

1. **Send Invite** (`send_invite`)
   - Accepted: User accepts connection request
   - Not Accepted: User declines or ignores request

2. **Send Connection Request** (`send_connection_request`)
   - Accepted: Connection request is accepted
   - Not Accepted: Connection request is declined/ignored

## 🚀 Advanced Features

### Path-Specific Workflows
Each path maintains its own workflow context:
- Actions added to "Accepted" path only affect accepted connections
- Actions added to "Not Accepted" path only affect declined/ignored requests
- Independent delay configurations for each path

### Smart Recommendations
The recommendation system understands conditional paths:
- Suggests appropriate follow-up actions based on path type
- Different recommendations for accepted vs not-accepted paths

### Validation
The system validates workflow configurations:
- Ensures conditional nodes have proper branching
- Warns about logical inconsistencies
- Validates path-specific action sequences

## 🎯 Best Practices

### 1. Accepted Path Actions
Typical actions for accepted connection requests:
- Send follow-up message
- Like recent posts
- Send InMail
- Add to nurture sequence

### 2. Not Accepted Path Actions
Typical actions for not-accepted requests:
- Withdraw request (after delay)
- Try different approach (email)
- Add to re-engagement list
- Visit profile again (after longer delay)

### 3. Delay Recommendations
- **Accepted Path**: Shorter delays (hours to days)
- **Not Accepted Path**: Longer delays (days to weeks)
- **Between Actions**: Respect LinkedIn limits and best practices

## 🔮 Future Enhancements

The conditional branching system is designed to support:

1. **Multiple Conditions**: More than just accepted/not-accepted
2. **Dynamic Conditions**: Based on profile data or behavior
3. **Nested Conditionals**: Conditional nodes within conditional paths
4. **Custom Path Types**: User-defined outcome types
5. **Analytics**: Track conversion rates by path
6. **A/B Testing**: Different strategies for different paths

## 🛠 Technical Notes

### Performance Considerations
- Efficient edge rendering with conditional styling
- Optimized node positioning algorithms
- Minimal re-renders when updating workflow structure

### Browser Compatibility
- Uses standard CSS properties for edge styling
- SVG-based edge rendering for consistent appearance
- Responsive design for different screen sizes

### Accessibility
- Screen reader friendly labels for path types
- Keyboard navigation support for all conditional elements
- High contrast colors for visual distinction

---

The conditional branching system provides a powerful foundation for creating sophisticated automation workflows while maintaining simplicity for users. The centralized configuration makes it easy to extend and customize as needed.
