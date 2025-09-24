import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle } from '@/Components/ui/card';
import { Widget } from '@/types';
import { ChevronLeft, ChevronRight, MoveDown, MoveUp, X } from 'lucide-react';
import { ContactsWidget } from './ContactsWidget';
import { EmailsSentWidget } from './EmailsSentWidget';
import { FnbKitchenWidget } from './FnbKitchenWidget';
import { FnbReservationsWidget } from './FnbReservationsWidget';
import { FnbTablesWidget } from './FnbTablesWidget';
import GenealogyStatsWidget from './GenealogyStatsWidget';
import { LoanStatsWidget } from './LoanStatsWidget';
import { PayrollStatsWidget } from './PayrollStatsWidget';
import { RentalItemStatsWidget } from './RentalItemStatsWidget';
import { RetailInventoryWidget } from './RetailInventoryWidget';
import { RetailOrdersWidget } from './RetailOrdersWidget';
import { RetailSalesWidget } from './RetailSalesWidget';
import { SmsStatsWidget } from './SmsStatsWidget';

interface WidgetComponentProps {
    widget: Widget;
    onRemove: (id: number) => void;
    onMoveLeft: () => void;
    onMoveRight: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isLeftmost: boolean;
    isRightmost: boolean;
    isTopmost: boolean;
    isBottommost: boolean;
    isEditMode: boolean;
}

export function WidgetComponent({
    widget,
    onRemove,
    onMoveLeft,
    onMoveRight,
    onMoveUp,
    onMoveDown,
    isLeftmost,
    isRightmost,
    isTopmost,
    isBottommost,
    isEditMode,
}: WidgetComponentProps) {
    return (
        <Card className="relative mb-4 h-full border-2 border-gray-300 shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-gray-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-2 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                    {(widget.type as string) === 'retail_sales' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Retail Sales Overview
                        </>
                    )}
                    {(widget.type as string) === 'retail_inventory' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            Retail Inventory Status
                        </>
                    )}
                    {(widget.type as string) === 'retail_orders' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                            Retail Recent Orders
                        </>
                    )}
                    {(widget.type as string) === 'fnb_tables' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                            F&B Table Status
                        </>
                    )}
                    {(widget.type as string) === 'fnb_kitchen' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            F&B Kitchen Orders
                        </>
                    )}
                    {(widget.type as string) === 'fnb_reservations' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                            F&B Reservations
                        </>
                    )}
                    {(widget.type as string) === 'family_tree_stats' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                            Family Tree Statistics
                        </>
                    )}
                    {(widget.type as string) === 'contacts' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                            Recent Contacts
                        </>
                    )}
                    {(widget.type as string) === 'emails_sent' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                            Sent Emails
                        </>
                    )}
                    {(widget.type as string) === 'loan_stats' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            Loan Statistics
                        </>
                    )}
                    {(widget.type as string) === 'payroll_stats' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-violet-500"></span>
                            Payroll Statistics
                        </>
                    )}
                    {(widget.type as string) === 'rental_item_stats' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            Rental Statistics
                        </>
                    )}
                    {(widget.type as string) === 'sms_stats' && (
                        <>
                            <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                            SMS Statistics
                        </>
                    )}
                </CardTitle>
                {isEditMode && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(widget.id)}
                        className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>

            <div className="h-fit text-gray-900 dark:text-gray-100">
                {(widget.type as string) === 'retail_sales' && (
                    <RetailSalesWidget />
                )}
                {(widget.type as string) === 'retail_inventory' && (
                    <RetailInventoryWidget />
                )}
                {(widget.type as string) === 'retail_orders' && (
                    <RetailOrdersWidget />
                )}
                {(widget.type as string) === 'fnb_tables' && (
                    <FnbTablesWidget />
                )}
                {(widget.type as string) === 'fnb_kitchen' && (
                    <FnbKitchenWidget />
                )}
                {(widget.type as string) === 'fnb_reservations' && (
                    <FnbReservationsWidget />
                )}
                {(widget.type as string) === 'genealogy_stats' && (
                    <GenealogyStatsWidget />
                )}
                {(widget.type as string) === 'contacts' && <ContactsWidget />}
                {(widget.type as string) === 'emails_sent' && (
                    <EmailsSentWidget />
                )}
                {(widget.type as string) === 'loan_stats' && (
                    <LoanStatsWidget />
                )}
                {(widget.type as string) === 'payroll_stats' && (
                    <PayrollStatsWidget />
                )}
                {(widget.type as string) === 'rental_item_stats' && (
                    <RentalItemStatsWidget />
                )}
                {(widget.type as string) === 'sms_stats' && <SmsStatsWidget />}
            </div>

            {isEditMode && (
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onMoveLeft}
                            disabled={isLeftmost}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onMoveRight}
                            disabled={isRightmost}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onMoveUp}
                            disabled={isTopmost}
                            className="h-8 w-8 p-0"
                        >
                            <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onMoveDown}
                            disabled={isBottommost}
                            className="h-8 w-8 p-0"
                        >
                            <MoveDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
