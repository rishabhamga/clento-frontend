# Conditional Paths Layout Update

## Overview
Updated the conditional workflow paths layout to improve visual hierarchy and consistency by swapping path positions and enhancing edge coloring for conditional nodes.

## 🎯 Changes Made

### 1. Swapped Path Positions

#### Before
```
Send Connection Request
    ├── Accepted (Left)
    └── Not Accepted (Right)
```

#### After
```
Send Connection Request
    ├── Not Accepted (Left)
    └── Accepted (Right)
```

#### Positioning Changes
- **Accepted Path**: Moved from `x: 100` to `x: 400` (right side)
- **Not Accepted Path**: Moved from `x: 400` to `x: 100` (left side)
- **Subsequent Conditional Nodes**:
  - Accepted: Changed from `-150px` to `+150px` offset
  - Not Accepted: Changed from `+150px` to `-150px` offset

### 2. Enhanced Edge Coloring

#### New Logic
- **Conditional Path Edges**:
  - Green (`#22c55e`) for accepted paths
  - Red (`#ef4444`) for not-accepted paths
- **Edges from Conditional Nodes**: Green (`#22c55e`) for all edges originating from conditional nodes
- **Regular Edges**: Gray (`#6b7280`) for non-conditional nodes

#### Implementation
```typescript
// Check if source node has conditional paths
const sourceNode = nodes.find(node => node.id === sourceNodeId);
const isSourceConditional = sourceNode?.type === 'action' &&
  hasConditionalPaths((sourceNode.data as ActionNodeData).type);

if (edgeData?.isConditionalPath) {
  return edgeData?.isPositive ? '#22c55e' : '#ef4444';
}

// For edges from conditional nodes, use green
if (isSourceConditional) {
  return '#22c55e';
}

return '#6b7280'; // default gray
```

## 🎨 Visual Impact

### Layout Hierarchy
- **Accepted Path (Right)**: Positive outcome, natural reading flow
- **Not Accepted Path (Left)**: Alternative/negative outcome
- **Better Visual Balance**: More intuitive left-to-right progression

### Color Coding
- **Green Edges**: Indicate connection requests and positive flows
- **Red Edges**: Indicate rejected/failed paths
- **Gray Edges**: Standard workflow connections
- **Consistent Theming**: All conditional nodes use green as primary color

## 🔧 Technical Details

### Position Calculations
```typescript
// First conditional node creation
acceptedAddStepNode.position = { x: 400, y: 300 }    // Right
notAcceptedAddStepNode.position = { x: 100, y: 300 } // Left

// Subsequent conditional nodes
acceptedAddStep.position = {
  x: clickedAddStepNode.position.x + 150,  // Right offset
  y: clickedAddStepNode.position.y + 220
}
notAcceptedAddStep.position = {
  x: clickedAddStepNode.position.x - 150,  // Left offset
  y: clickedAddStepNode.position.y + 220
}
```

### Edge Color Detection
- Uses React Flow's `getNodes()` and `getEdges()` to traverse workflow
- Identifies source node from edge relationship
- Checks if source node has `hasConditionalPaths: true`
- Applies appropriate color based on path type and source node

## 📊 Benefits

### User Experience
- **Intuitive Layout**: Accepted paths on right feel more natural
- **Clear Visual Hierarchy**: Color coding makes flow logic obvious
- **Consistent Design**: All conditional elements use green theme
- **Better Readability**: Easier to distinguish path types at a glance

### Development
- **Centralized Logic**: Edge coloring logic is reusable and maintainable
- **Type Safety**: Proper TypeScript integration with workflow types
- **Scalable Design**: Works with nested conditional workflows

## 🎯 Layout Examples

### Simple Conditional Flow
```
Send Connection Request
├── Not Accepted (Left, Red) → Withdraw Request
└── Accepted (Right, Green) → Send Message
```

### Complex Nested Flow
```
Send Connection Request
├── Not Accepted (Left, Red) → Wait 3d → Profile Visit
└── Accepted (Right, Green) → Send Message → Send Follow-up
```

### Mixed Workflow
```
Profile Visit (Gray edge)
    ↓
Send Connection Request
├── Not Accepted (Left, Red) → Withdraw Request
└── Accepted (Right, Green) → Like Post → Send Message
```

## 🚀 Impact

### Visual Consistency
- All conditional workflows now follow the same layout pattern
- Color coding provides immediate visual feedback about workflow logic
- Professional appearance with consistent design language

### Workflow Logic
- Left-to-right reading pattern matches natural flow
- Positive outcomes (accepted) positioned prominently on right
- Negative outcomes (not accepted) clearly distinguished on left

The updated layout creates a more intuitive and visually consistent experience for building conditional workflows, making it easier for users to understand and manage complex automation sequences.
