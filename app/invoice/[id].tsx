
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Download } from 'lucide-react-native';
import { colors } from '@/components/FreshComponents';
import { invoice } from '@/lib/mockData';

export default function InvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const inv = { ...invoice, orderId: id ?? invoice.orderId };

  const handleDownload = () => {
    const content = [
      'FRESH & PURE - TAX INVOICE',
      `Invoice: ${inv.id}`,
      `Order: ${inv.orderId}`,
      `Date: ${inv.dateGenerated}`,
      '',
      `Sold By: ${inv.sellerName}`,
      `GSTIN: ${inv.gstin}`,
      '',
      `Billed To: ${inv.billedTo}`,
      '',
      'ITEM\t\tQTY\tRATE\tAMOUNT',
      ...inv.lineItems.map(
        (li) =>
          `${li.name}\t\t${li.quantity}\t${li.rate}\t${li.amount}`
      ),
      '',
      `Subtotal: ${inv.subtotal}`,
      `CGST: ${inv.cgst}`,
      `SGST: ${inv.sgst}`,
      `Total: ${inv.total}`,
      `Payment Mode: ${inv.paymentMode}`,
      '',
      'Thank you for your business!',
    ].join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([content], {
        type: 'text/plain',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `invoice-${inv.id}.txt`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } else {
      Alert.alert(
        'Invoice Downloaded',
        `Invoice ${inv.id} has been downloaded.`
      );
    }
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      {/* Back Button */}
      <Pressable
        className="ml-4 mt-2"
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Text className="text-[32px] leading-[30px] text-[#111827]">
          <ArrowLeft size={28} color="#111827" />
        </Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <Text className="mt-2 text-[22px] font-extrabold text-[#111827]">
          Invoice
        </Text>

        <Text className="mt-1 text-[13px] text-[#64748B]">
          {inv.id}
        </Text>

        {/* Invoice Card */}
        <View className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-white p-4">

          {/* Seller / Customer */}
          <View className="flex-row justify-between border-b border-[#F1F5F9] pb-[14px]">

            <View>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Sold By
              </Text>

              <Text className="mt-[2px] text-[14px] font-bold text-[#111827]">
                {inv.sellerName}
              </Text>

              <Text className="mt-[2px] text-[11px] text-[#64748B]">
                GSTIN: {inv.gstin}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Billed To
              </Text>

              <Text className="mt-[2px] text-[14px] font-bold text-[#111827]">
                {inv.billedTo}
              </Text>

              <Text className="mt-[2px] text-[11px] text-[#64748B]">
                {inv.dateGenerated}
              </Text>
            </View>

          </View>

          {/* Table Header */}
          <View className="mt-2 flex-row border-b border-[#F1F5F9] py-[10px]">

            <Text className="flex-[2] text-[13px] font-semibold text-[#111827]">
              Item
            </Text>

            <Text className="flex-1 text-[13px] text-[#111827]">
              Qty
            </Text>

            <Text className="flex-1 text-[13px] text-[#111827]">
              Rate
            </Text>

            <Text className="flex-1 text-right text-[13px] font-bold text-[#111827]">
              Amount
            </Text>

          </View>

          {/* Items */}
          {inv.lineItems.map((li, i) => (
            <View
              key={i}
              className="flex-row py-[10px]"
            >
              <Text className="flex-[2] text-[13px] font-semibold text-[#111827]">
                {li.name}
              </Text>

              <Text className="flex-1 text-[13px] text-[#111827]">
                {li.quantity}
              </Text>

              <Text className="flex-1 text-[13px] text-[#111827]">
                ₹{li.rate}
              </Text>

              <Text className="flex-1 text-right text-[13px] font-bold text-[#111827]">
                ₹{li.amount}
              </Text>
            </View>
          ))}

          {/* Divider */}
          <View className="my-2 h-px bg-[#F1F5F9]" />

          {/* Summary */}
          <View className="flex-row justify-between py-1">
            <Text className="text-[13px] text-[#64748B]">
              Subtotal
            </Text>

            <Text className="text-[13px] font-semibold text-[#111827]">
              ₹{inv.subtotal}
            </Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="text-[13px] text-[#64748B]">
              CGST
            </Text>

            <Text className="text-[13px] font-semibold text-[#111827]">
              ₹{inv.cgst}
            </Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="text-[13px] text-[#64748B]">
              SGST
            </Text>

            <Text className="text-[13px] font-semibold text-[#111827]">
              ₹{inv.sgst}
            </Text>
          </View>

          {/* Total Divider */}
          <View className="my-2 h-px bg-[#F1F5F9]" />

          {/* Total */}
          <View className="flex-row justify-between py-1">
            <Text className="text-[15px] font-extrabold text-[#111827]">
              Total
            </Text>

            <Text className="text-[15px] font-extrabold text-[#111827]">
              ₹{inv.total}
            </Text>
          </View>

          {/* Payment Mode */}
          <Text className="mt-[10px] text-[12px] text-[#64748B]">
            Payment Mode: {inv.paymentMode}
          </Text>

        </View>

        {/* Download Button */}
        <Pressable
          className="mt-5 flex-row items-center justify-center gap-2 rounded-[14px] bg-[#1E4FFF] py-[14px]"
          onPress={handleDownload}
        >
          <Download size={16} color="#fff" />

          <Text className="text-[14px] font-bold text-white">
            Download Invoice
          </Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
