// User Management Table - Search, Filter, and Sort Users
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown } from 'lucide-react';

type UserProfile = {
  id: string;
  tier: string;
  total_cost_usd: string;
  total_tokens_used: number;
  tokens_used_this_month: number;
  requests_today: number;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
  messagesCount: number;
  lastActive: string;
};

type Props = {
  users: UserProfile[];
};

export function UserManagementTable({ users }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost' | 'tokens' | 'created'>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(user => user.tier === tierFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'cost':
          comparison = parseFloat(a.total_cost_usd) - parseFloat(b.total_cost_usd);
          break;
        case 'tokens':
          comparison = a.total_tokens_used - b.total_tokens_used;
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchTerm, tierFilter, sortBy, sortOrder]);

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="unlimited">Unlimited</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'cost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('cost')}
          >
            Cost <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant={sortBy === 'tokens' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('tokens')}
          >
            Tokens <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant={sortBy === 'created' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('created')}
          >
            Joined <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* User Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">User ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tier</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total Cost</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Tokens Used</th>
                <th className="px-4 py-3 text-right text-sm font-medium">This Month</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Requests Today</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No users found matching your filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="text-xs">{user.id.substring(0, 8)}...</code>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.tier === 'unlimited'
                            ? 'default'
                            : user.tier === 'pro'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {user.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      ${parseFloat(user.total_cost_usd).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {(user.total_tokens_used / 1000).toFixed(1)}K
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {(user.tokens_used_this_month / 1000).toFixed(1)}K
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {user.requests_today}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
