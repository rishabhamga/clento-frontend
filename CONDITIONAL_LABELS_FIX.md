# Conditional Labels Fix

## Issue
AddStep nodes were showing path labels ("Accepted", "Not Accepted") even when they weren't connected to conditional nodes. This meant that regular workflow steps like "Follow Profile → AddStep" would show "Accepted" label when they shouldn't.

## Root Cause
The AddStepNode component was showing labels based solely on the `pathType` property:
```typescript
// OLD: Always show labels for accepted/not-accepted pathTypes
{(data.pathType === 'accepted' || data.pathType === 'not-accepted') && (
    <div>Accepted/Not Accepted</div>
)}
```

This meant ANY AddStep node with `pathType: 'accepted'` would show the label, regardless of context.

## Solution
Modified the AddStepNode component to check if the **parent node** (the node directly above it) has conditional paths:

```typescript
// Check if the parent node (source of incoming edge) is conditional
const shouldShowPathLabel = () => {
    if (!nodeId) return false;

    const edges = getEdges();
    const nodes = getNodes();

    // Find the edge that leads to this AddStep node
    const incomingEdge = edges.find(edge => edge.target === nodeId);
    if (!incomingEdge) return false;

    // Find the source node (parent)
    const parentNode = nodes.find(node => node.id === incomingEdge.source);
    if (!parentNode || parentNode.type !== 'action') return false;

    // Check if parent node has conditional paths
    const parentNodeData = parentNode.data as unknown as ActionNodeData;
    return hasConditionalPaths(parentNodeData.type);
};
```

## Behavior Now

### ✅ Shows Labels When:
- Parent node is `send_connection_request` (conditional)
- Parent node is `send_invite` (conditional)
- AddStep is part of accepted/not-accepted branch

### ✅ Hides Labels When:
- Parent node is `follow_profile` (non-conditional)
- Parent node is `comment_post` (non-conditional)
- Parent node is `like_post` (non-conditional)
- Any other non-conditional node

## Visual Examples

### Before (Incorrect)
```
Follow Profile
     │
     ▼
┌──────────┐
│ Accepted │  ← Wrong! Should not show "Accepted"
│ Add Step │
└──────────┘
```

### After (Correct)
```
Follow Profile
     │
     ▼
┌──────────┐
│ Add Step │  ← Correct! No label shown
└──────────┘
```

### Conditional Node (Still Shows Labels)
```
Send Connection Request
         ╱       ╲
    ────╱         ╲────
   ╱                   ╲
  ▼                     ▼
┌──────────┐      ┌──────────────┐
│ Accepted │      │ Not Accepted │  ← Correct! Labels shown
│ Add Step │      │   Add Step   │
└──────────┘      └──────────────┘
```

## Files Modified
- `src/components/workflow/AddStepNode.tsx` - Added parent node checking logic
- Added imports for `useReactFlow`, `ActionNodeData`, and `hasConditionalPaths`

## Technical Details
- Uses React Flow's `getNodes()` and `getEdges()` to traverse the workflow graph
- Checks the immediate parent node's type and conditional status
- Only shows path labels when the parent node actually has conditional branching
- Maintains all existing functionality for truly conditional paths
