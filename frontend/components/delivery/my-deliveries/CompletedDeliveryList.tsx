import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export interface CompletedDeliveryItem {
  id: string;
  orderNumber: string;
  deliveredTimeStr: string;
  customerName: string;
  addressAndPaymentStr: string;
  tipStr: string;
}

const DEFAULT_COMPLETED_ITEMS: CompletedDeliveryItem[] = [
  {
    id: "1019",
    orderNumber: "Order #1019",
    deliveredTimeStr: "Delivered 6:45 PM",
    customerName: "Marcus Vance",
    addressAndPaymentStr: "424 Elm St • $42.00 KHQR",
    tipStr: "+$4.50 Tip",
  },
  {
    id: "1015",
    orderNumber: "Order #1015",
    deliveredTimeStr: "Delivered 5:50 PM",
    customerName: "Elena Rostova",
    addressAndPaymentStr: "88 Pine Rd • $19.20 Card",
    tipStr: "+$3.00 Tip",
  },
];

interface CompletedDeliveryListProps {
  items?: CompletedDeliveryItem[];
}

export const CompletedDeliveryList: React.FC<CompletedDeliveryListProps> = ({
  items = DEFAULT_COMPLETED_ITEMS,
}) => {
  const router = useRouter();

  if (!items || items.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Completed Deliveries</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Completed delivery tickets will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-space-sm" id="completed-tab-content">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => router.push(`/delivery/${item.id}`)}
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs border border-outline-variant/20 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {item.orderNumber} • {item.deliveredTimeStr}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-bold">
              Completed
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {item.customerName}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {item.addressAndPaymentStr}
              </p>
            </div>
            <span className="font-label-md text-label-md text-emerald-700 font-bold">
              {item.tipStr}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
