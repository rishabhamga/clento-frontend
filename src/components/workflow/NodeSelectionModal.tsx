import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowNodeType, NODE_CATEGORIES } from "@/config/workflow-nodes";
import { getNodesGroupedByCategory, getRecommendedNextSteps } from "@/config/workflow-config";

interface NodeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectNodeType: (nodeType: WorkflowNodeType) => void;
    currentWorkflowTypes?: string[];
}

export const NodeSelectionModal = ({
    isOpen,
    onClose,
    onSelectNodeType,
    currentWorkflowTypes = []
}: NodeSelectionModalProps) => {
    const handleSelectNode = (nodeType: WorkflowNodeType) => {
        onSelectNodeType(nodeType);
        onClose();
    };

    const nodesByCategory = getNodesGroupedByCategory();
    const recommendedNodes = getRecommendedNextSteps(currentWorkflowTypes);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Select Action Type</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="all" className="flex-1 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All Actions</TabsTrigger>
                        <TabsTrigger value="recommended">
                            Recommended
                            {recommendedNodes.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                                    {recommendedNodes.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        <TabsTrigger value="connection">Connection</TabsTrigger>
                        <TabsTrigger value="messaging">Messaging</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 overflow-y-auto max-h-[50vh]">
                        <TabsContent value="all">
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(nodesByCategory).map(([category, nodes]) => (
                                    <div key={category} className="col-span-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                            {NODE_CATEGORIES[category as keyof typeof NODE_CATEGORIES]?.label}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {nodes.map((nodeType) => (
                                                <NodeCard
                                                    key={nodeType.type}
                                                    nodeType={nodeType}
                                                    onClick={() => handleSelectNode(nodeType.type)}
                                                    isRecommended={recommendedNodes.some(n => n.type === nodeType.type)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="recommended">
                            {recommendedNodes.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {recommendedNodes.map((nodeType) => (
                                        <NodeCard
                                            key={nodeType.type}
                                            nodeType={nodeType}
                                            onClick={() => handleSelectNode(nodeType.type)}
                                            isRecommended={true}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No specific recommendations available.</p>
                                    <p className="text-sm mt-1">All actions are available in the "All Actions" tab.</p>
                                </div>
                            )}
                        </TabsContent>

                        {Object.entries(nodesByCategory).map(([category, nodes]) => (
                            <TabsContent key={category} value={category}>
                                <div className="grid grid-cols-2 gap-3">
                                    {nodes.map((nodeType) => (
                                        <NodeCard
                                            key={nodeType.type}
                                            nodeType={nodeType}
                                            onClick={() => handleSelectNode(nodeType.type)}
                                            isRecommended={recommendedNodes.some(n => n.type === nodeType.type)}
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

interface NodeCardProps {
    nodeType: {
        type: WorkflowNodeType;
        label: string;
        description: string;
        icon: any;
        color: string;
        requiresMessage?: boolean;
        requiresTemplate?: boolean;
    };
    onClick: () => void;
    isRecommended?: boolean;
}

const NodeCard = ({ nodeType, onClick, isRecommended }: NodeCardProps) => {
    const Icon = nodeType.icon;

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:ring-2 hover:ring-blue-500 relative"
            onClick={onClick}
        >
            {isRecommended && (
                <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 z-10 bg-green-100 text-green-800 border-green-200"
                >
                    Recommended
                </Badge>
            )}
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${nodeType.color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm">{nodeType.label}</h3>
                            {nodeType.requiresMessage && (
                                <Badge variant="outline" className="text-xs">
                                    Message
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {nodeType.description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
