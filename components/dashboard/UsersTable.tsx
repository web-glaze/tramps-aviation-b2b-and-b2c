// @ts-nocheck
"use client";

import { useState } from "react";
import { useUsers, useDeleteUser } from "@/lib/hooks/useUsers";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Trash2, Edit, Eye } from "lucide-react";
import { getInitials, capitalize } from "@/lib/utils";
import type { User, TableColumn } from "@/types";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({ page, limit: 10, search });
  const deleteUser = useDeleteUser();

  const columns: any[] = [
    {
      key: "name",
      label: "User",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {String(value)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "secondary"} className="capitalize">
          {String(value)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value) => (
        <span className="text-sm text-muted-foreground">{String(value)}</span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteUser.mutate(row.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const users = (data?.data ?? []) as User[];
  const meta = data?.meta;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          {meta && (
            <span className="text-sm text-muted-foreground ml-auto">
              {meta.total} users total
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DataTable<User>
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found."
        />

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
