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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { contacts } from "@/lib/data";
import type { Contact } from "@/lib/types";

const ContactsTable = ({ data }: { data: Contact[] }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden sm:table-cell">Phone</TableHead>
            <TableHead className="text-right">Transactions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell className="hidden md:table-cell">{contact.company}</TableCell>
              <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
              <TableCell className="hidden sm:table-cell">{contact.phone}</TableCell>
              <TableCell className="text-right">{contact.transactionCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function ContactsPage() {
  const customers = contacts.filter(c => c.type === 'Customer');
  const suppliers = contacts.filter(c => c.type === 'Supplier');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Contacts</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Contact
        </Button>
      </div>
      
      <Tabs defaultValue="customers">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <ContactsTable data={customers} />
        </TabsContent>
        <TabsContent value="suppliers">
          <ContactsTable data={suppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
