"use client"
import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Minus, Plus } from "lucide-react";
import { inventory as initialInventory } from "@/lib/data";
import type { InventoryItem } from "@/lib/types";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [isPending, startTransition] = useTransition();

  const handleStockChange = (itemId: string, amount: number) => {
    startTransition(() => {
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.id === itemId
            ? { ...item, stock: Math.max(0, item.stock + amount) }
            : item
        )
      );
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Inventory</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>
            Manage stock for seeds, fertilizers, and equipment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const isLowStock = item.stock <= item.reorderLevel;
                return (
                  <TableRow key={item.id} className={isPending ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.supplier}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{item.stock}</span>
                        {isLowStock && (
                          <Badge variant="destructive">Low</Badge>
                        )}
                      </div>
                      <small className="text-muted-foreground">Reorder at {item.reorderLevel}</small>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleStockChange(item.id, -1)} disabled={isPending}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleStockChange(item.id, 1)} disabled={isPending}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
