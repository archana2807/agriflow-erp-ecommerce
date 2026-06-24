import { useCreatePayment } from "../../hooks/usePayments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema } from "../../validations";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Payments() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { invoiceId: "", amountPaid: "", paymentMethod: "CASH" },
  });
  const createPayment = useCreatePayment();

  const onSubmit = (data) => {
    createPayment.mutate(data, {
      onSuccess: () => reset({ invoiceId: "", amountPaid: "", paymentMethod: "CASH" }),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-sm text-muted-foreground">Record payments against invoices</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-5" />
            Record Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="invoiceId" className="text-sm font-medium">Invoice ID</label>
              <Input id="invoiceId" placeholder="Enter invoice ID" {...register("invoiceId")} />
              {errors.invoiceId && <p className="text-sm text-destructive">{errors.invoiceId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="amountPaid" className="text-sm font-medium">Amount Paid</label>
                <Input id="amountPaid" type="number" placeholder="Enter amount" min="1" {...register("amountPaid")} />
                {errors.amountPaid && <p className="text-sm text-destructive">{errors.amountPaid.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</label>
                <select
                  id="paymentMethod"
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("paymentMethod")}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={createPayment.isPending} className="w-full">
              {createPayment.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
