'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLeadList, useUpdateLeadList } from '@/hooks/useLeadLists';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EditLeadListPage() {
    const router = useRouter();
    const params = useParams();
    const leadListId = params.id as string;

    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        connectedAccountId: '',
    });

    // Track if form has been initialized
    const isInitialized = useRef(false);

    // State for validation
    const [errors, setErrors] = useState<{
        name?: string;
        connectedAccountId?: string;
    }>({});

    // API hooks
    const { data: leadListData, isLoading: isLoadingLeadList, error: leadListError } = useLeadList(leadListId);
    const { data: accountsData, isLoading: isLoadingAccounts } = useConnectedAccounts('linkedin');
    const updateMutation = useUpdateLeadList();

    // Filter valid connected accounts
    const validConnectedAccounts = accountsData?.data?.filter(account => account && account.id && account.display_name && typeof account.display_name === 'string' && account.display_name.trim().length > 0 && account.status === 'connected') || [];

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'List name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'List name must be at least 2 characters';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'List name must be less than 100 characters';
        }

        if (!formData.connectedAccountId) {
            newErrors.connectedAccountId = 'LinkedIn account is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: leadListId,
                data: {
                    name: formData.name.trim(),
                    connected_account_id: formData.connectedAccountId,
                },
            });

            // Navigate back to prospect lists page
            router.push('/prospect-lists');
        } catch (error) {
            console.error('Error updating lead list:', error);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        // Prevent resetting connectedAccountId to empty string if we have a valid value and accounts are loaded
        if (field === 'connectedAccountId' && value === '' && formData.connectedAccountId && !isLoadingAccounts) {
            return;
        }

        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Initialize form data only once when lead list data is loaded
    useEffect(() => {
        if (leadListData?.leadList && !isLoadingLeadList && !isInitialized.current) {
            setFormData({
                name: leadListData.leadList.name || '',
                connectedAccountId: leadListData.leadList.connected_account_id || '',
            });
            isInitialized.current = true;
        }
    }, [leadListData, isLoadingLeadList]);

    // Loading state
    if (isLoadingLeadList) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-center py-9">
                            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (leadListError) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Card>
                    <CardContent className="p-5">
                        <Alert variant="destructive">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <AlertDescription className="text-sm">Failed to load lead list. Please try again.</AlertDescription>
                        </Alert>
                        <div className="flex justify-start mt-3">
                            <Button variant="outline" onClick={() => router.push('/prospect-lists')} className="text-sm">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                Back to Lists
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No data state
    if (!leadListData?.leadList) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Card>
                    <CardContent className="p-5">
                        <Alert variant="destructive">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <AlertDescription className="text-sm">Lead list not found.</AlertDescription>
                        </Alert>
                        <div className="flex justify-start mt-3">
                            <Button variant="outline" onClick={() => router.push('/prospect-lists')} className="text-sm">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                Back to Lists
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div>
                <h1 className="text-xl font-bold text-foreground">Edit Lead List</h1>
                <p className="text-sm text-muted-foreground mt-1.5">Update the name and connected account for your lead list</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lead List Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* List Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">List Name</Label>
                            <Input id="name" placeholder="Enter list name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Connected Account */}
                        <div className="space-y-2">
                            <Label htmlFor="account">LinkedIn Account</Label>
                            <Select value={formData.connectedAccountId || undefined} onValueChange={value => handleInputChange('connectedAccountId', value)}>
                                <SelectTrigger className={errors.connectedAccountId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select LinkedIn account">
                                        {(() => {
                                            const selectedAccount = validConnectedAccounts.find(acc => acc.id === formData.connectedAccountId);
                                            return selectedAccount ? selectedAccount.display_name || 'Unknown Account' : 'Select LinkedIn account';
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingAccounts ? (
                                        <SelectItem value="loading" disabled>
                                            Loading accounts...
                                        </SelectItem>
                                    ) : validConnectedAccounts.length === 0 ? (
                                        <SelectItem value="no-accounts" disabled>
                                            No LinkedIn accounts connected
                                        </SelectItem>
                                    ) : (
                                        validConnectedAccounts.map(account => (
                                            <SelectItem key={account.id} value={account.id}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={account.profile_picture_url} alt={account.display_name || 'Account'} />
                                                        <AvatarFallback className="text-xs">
                                                            {account.display_name
                                                                ? account.display_name
                                                                      .split(' ')
                                                                      .map((n: string) => n[0])
                                                                      .join('')
                                                                : 'AC'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{account.display_name || 'Unknown Account'}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        Premium
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.connectedAccountId && <p className="text-sm text-red-500">{errors.connectedAccountId}</p>}
                        </div>

                        {/* Current Lead List Info */}
                        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                            <h4 className="font-medium text-xs text-muted-foreground">Current Lead List Info</h4>
                            <div className="text-xs space-y-0.5">
                                <p>
                                    <span className="font-medium">Total Leads:</span> {leadListData.leadList.total_leads || 0}
                                </p>
                                <p>
                                    <span className="font-medium">Status:</span>
                                    <Badge variant="outline" className="ml-2">
                                        {leadListData.leadList.status}
                                    </Badge>
                                </p>
                                <p>
                                    <span className="font-medium">Source:</span> {leadListData.leadList.source}
                                </p>
                                <p>
                                    <span className="font-medium">Created:</span> {leadListData.leadList.created_at ? new Date(leadListData.leadList.created_at).toLocaleDateString() : 'Unknown'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => router.push('/prospect-lists')} disabled={updateMutation.isPending} className="text-sm">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending || !formData.name.trim() || !formData.connectedAccountId} className="bg-purple-600 hover:bg-purple-700 text-white text-sm">
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5 mr-1.5" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
